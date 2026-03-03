// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArenaToken
 * @notice $ARENA — the native ERC-20 utility token for the AgentArena ecosystem.
 * @dev Used for: betting on game outcomes, purchasing skill NFTs, tournament entry,
 *      marketplace transactions, and governance voting (Phase 4).
 *
 *      Tokenomics:
 *      - Total Supply: 1,000,000,000 (1B)
 *      - Community Rewards: 40%  (400M)
 *      - Treasury:          20%  (200M)
 *      - Team/Advisors:     15%  (150M, 12-month vesting)
 *      - Liquidity:         15%  (150M)
 *      - Strategic:         10%  (100M)
 *
 *      Quarterly 1% rake burn — revenue from game fees is burned.
 */
contract ArenaToken is ERC20, ERC20Burnable, Ownable {

    // ── Token Distribution Wallets ───────────────────────────
    address public treasuryWallet;
    address public rewardsPool;
    address public liquidityPool;

    // ── Betting Integration ──────────────────────────────────
    address public bettingContract;
    mapping(address => bool) public authorizedSpenders; // game engine, marketplace

    // ── Vesting ──────────────────────────────────────────────
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 released;
        uint64 startTime;
        uint64 duration;
    }
    mapping(address => VestingSchedule) public vestingSchedules;

    // ── Events ───────────────────────────────────────────────
    event RewardDistributed(address indexed to, uint256 amount, string reason);
    event RakeBurned(uint256 amount, uint256 quarter);
    event AuthorizedSpenderUpdated(address indexed spender, bool authorized);

    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;

    constructor(
        address _treasury,
        address _rewards,
        address _liquidity
    ) ERC20("Arena Token", "ARENA") Ownable(msg.sender) {
        treasuryWallet = _treasury;
        rewardsPool = _rewards;
        liquidityPool = _liquidity;

        // Mint allocations
        _mint(_rewards,   400_000_000 * 10**18);  // 40% Community Rewards
        _mint(_treasury,  200_000_000 * 10**18);  // 20% Treasury
        _mint(msg.sender, 150_000_000 * 10**18);  // 15% Team (will vest)
        _mint(_liquidity,  150_000_000 * 10**18);  // 15% Liquidity
        _mint(msg.sender, 100_000_000 * 10**18);  // 10% Strategic
    }

    // ── Reward Distribution ──────────────────────────────────
    function distributeReward(
        address to,
        uint256 amount,
        string calldata reason
    ) external {
        require(msg.sender == rewardsPool || msg.sender == owner(), "Not authorized");
        require(balanceOf(rewardsPool) >= amount, "Insufficient rewards pool");

        _transfer(rewardsPool, to, amount);
        emit RewardDistributed(to, amount, reason);
    }

    // ── Rake Burn ────────────────────────────────────────────
    function rakeBurn(uint256 amount) external onlyOwner {
        _burn(treasuryWallet, amount);
        emit RakeBurned(amount, block.timestamp / 90 days);
    }

    // ── Authorized Spenders ──────────────────────────────────
    function setAuthorizedSpender(address spender, bool authorized) external onlyOwner {
        authorizedSpenders[spender] = authorized;
        emit AuthorizedSpenderUpdated(spender, authorized);
    }

    // ── Vesting ──────────────────────────────────────────────
    function createVesting(
        address beneficiary,
        uint256 amount,
        uint64 duration
    ) external onlyOwner {
        require(vestingSchedules[beneficiary].totalAmount == 0, "Vesting exists");
        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            released: 0,
            startTime: uint64(block.timestamp),
            duration: duration
        });
        _transfer(msg.sender, address(this), amount);
    }

    function releaseVested() external {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        require(schedule.totalAmount > 0, "No vesting schedule");

        uint256 elapsed = block.timestamp - schedule.startTime;
        uint256 vested;
        if (elapsed >= schedule.duration) {
            vested = schedule.totalAmount;
        } else {
            vested = (schedule.totalAmount * elapsed) / schedule.duration;
        }

        uint256 releasable = vested - schedule.released;
        require(releasable > 0, "Nothing to release");

        schedule.released += releasable;
        _transfer(address(this), msg.sender, releasable);
    }

    // ── Wallet Updates ───────────────────────────────────────
    function setTreasuryWallet(address _treasury) external onlyOwner {
        treasuryWallet = _treasury;
    }

    function setRewardsPool(address _rewards) external onlyOwner {
        rewardsPool = _rewards;
    }

    function setBettingContract(address _betting) external onlyOwner {
        bettingContract = _betting;
    }
}
