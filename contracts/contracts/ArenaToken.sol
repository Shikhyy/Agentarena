// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArenaToken
 * @notice $ARENA — the native ERC-20 utility token for the AgentArena ecosystem.
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  TOKENOMICS (PRD §09 — locked to 100M fixed supply)           ║
 * ║  Total Supply:    100,000,000 (100M) — NO mint after genesis   ║
 * ║  Community Rewards: 40%  (40M)  — streaming match rewards       ║
 * ║  Treasury:          20%  (20M)  — protocol ops + grants         ║
 * ║  Team/Advisors:     15%  (15M)  — 12-month linear vesting       ║
 * ║  Liquidity:         15%  (15M)  — DEX bootstrapping             ║
 * ║  Strategic:         10%  (10M)  — investors / partnerships      ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  BURN MECHANICS                                                  ║
 * ║  1. Quarterly Rake:       1% of revenue from all game fees      ║
 * ║  2. Breeding Fee:         50% of each breeding fee burned       ║
 * ║  3. Tournament Entry:     25% of each entry fee burned          ║
 * ║  4. Marketplace Rake:     5% of Skill NFT sales burned          ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  EARN                                                            ║
 * ║  Win matches (ELO-scaled), win bets, tournament prizes,        ║
 * ║  referrals (100 $ARENA per user who plays 3+ matches)           ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  SPEND                                                           ║
 * ║  Skill NFTs (5-20), tournament entry, breeding, cosmetics,      ║
 * ║  governance votes                                                ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
contract ArenaToken is ERC20, ERC20Burnable, Ownable {

    // ── Supply Constants ─────────────────────────────────────────
    uint256 public constant TOTAL_SUPPLY   = 100_000_000 * 10**18; // 100M fixed

    // Distribution amounts (immutable at genesis)
    uint256 public constant REWARDS_ALLOC  =  40_000_000 * 10**18; // 40%
    uint256 public constant TREASURY_ALLOC =  20_000_000 * 10**18; // 20%
    uint256 public constant TEAM_ALLOC     =  15_000_000 * 10**18; // 15%
    uint256 public constant LIQUIDITY_ALLOC = 15_000_000 * 10**18; // 15%
    uint256 public constant STRATEGIC_ALLOC = 10_000_000 * 10**18; // 10%

    // ── Burn Rate Constants (basis points) ───────────────────────
    uint256 public constant BREEDING_BURN_BPS    = 5000; // 50% of breeding fee burned
    uint256 public constant TOURNAMENT_BURN_BPS  = 2500; // 25% of tournament entry burned
    uint256 public constant MARKETPLACE_BURN_BPS =  500; //  5% of Skill NFT sale burned
    uint256 public constant QUARTERLY_RAKE_BPS   =  100; //  1% quarterly rake

    // ── Wallets ──────────────────────────────────────────────────
    address public treasuryWallet;
    address public rewardsPool;
    address public liquidityPool;

    // ── Integration Addresses ────────────────────────────────────
    address public bettingContract;
    address public breedingContract;
    address public tournamentContract;
    address public marketplaceContract;

    // ── Authorized callers that can trigger burns ────────────────
    mapping(address => bool) public authorizedBurners;

    // ── Burn Accounting ──────────────────────────────────────────
    uint256 public totalBurned;
    uint256 public lastQuarterlyBurn;       // unix timestamp of last quarterly burn

    // ── Vesting ──────────────────────────────────────────────────
    struct VestingSchedule {
        uint256 totalAmount;
        uint256 released;
        uint64  startTime;
        uint64  duration;
        bool    revocable;
        bool    revoked;
    }
    mapping(address => VestingSchedule) public vestingSchedules;

    // ── Referral Rewards ─────────────────────────────────────────
    uint256 public constant REFERRAL_REWARD    = 100 * 10**18; // 100 $ARENA per referee
    uint256 public constant REFERRAL_THRESHOLD = 3;            // after 3 matches played
    mapping(address => address) public referredBy;
    mapping(address => uint256) public matchesPlayed;
    mapping(address => bool)    public referralClaimed;

    // ── Events ───────────────────────────────────────────────────
    event RewardDistributed(address indexed to, uint256 amount, string reason);
    event BurnEvent(string burnType, uint256 amountBurned, uint256 totalBurnedNow);
    event QuarterlyRakeBurned(uint256 amount, uint256 quarter);
    event BreedingFeeBurned(uint256 burned, uint256 toTreasury);
    event TournamentEntryBurned(uint256 burned, uint256 toTreasury);
    event MarketplaceRakeBurned(uint256 burned, uint256 toTreasury);
    event VestingCreated(address indexed beneficiary, uint256 amount, uint64 duration);
    event VestingReleased(address indexed beneficiary, uint256 amount);
    event VestingRevoked(address indexed beneficiary, uint256 returned);
    event ReferralRewarded(address indexed referrer, address indexed referee, uint256 amount);
    event AuthorizedBurnerSet(address indexed burner, bool authorized);

    // ── Errors ───────────────────────────────────────────────────
    error NotAuthorized();
    error VestingExists();
    error NoVestingSchedule();
    error NothingToRelease();
    error AlreadyClaimed();
    error ThresholdNotMet();
    error TooSoonForQuarterlyBurn();

    // ── Constructor ──────────────────────────────────────────────
    constructor(
        address _treasury,
        address _rewards,
        address _liquidity,
        address _teamMultisig,
        address _strategicMultisig
    ) ERC20("Arena Token", "ARENA") Ownable(msg.sender) {
        treasuryWallet = _treasury;
        rewardsPool    = _rewards;
        liquidityPool  = _liquidity;

        // Mint exactly 100M — splits MUST sum to TOTAL_SUPPLY
        _mint(_rewards,            REWARDS_ALLOC);   // 40M — community rewards
        _mint(_treasury,           TREASURY_ALLOC);  // 20M — treasury ops
        _mint(address(this),       TEAM_ALLOC);      // 15M — locked here for vesting
        _mint(_liquidity,          LIQUIDITY_ALLOC); // 15M — DEX liquidity
        _mint(_strategicMultisig,  STRATEGIC_ALLOC); // 10M — strategic partners

        // Create default vesting for team multisig (12-month linear)
        if (_teamMultisig != address(0)) {
            vestingSchedules[_teamMultisig] = VestingSchedule({
                totalAmount: TEAM_ALLOC,
                released:    0,
                startTime:   uint64(block.timestamp),
                duration:    365 days,  // 12-month linear vesting
                revocable:   true,
                revoked:     false
            });
            emit VestingCreated(_teamMultisig, TEAM_ALLOC, uint64(365 days));
        }
    }

    // ── Authorization ────────────────────────────────────────────

    modifier onlyAuthorizedBurner() {
        if (!authorizedBurners[msg.sender] && msg.sender != owner()) revert NotAuthorized();
        _;
    }

    function setAuthorizedBurner(address burner, bool authorized) external onlyOwner {
        authorizedBurners[burner] = authorized;
        emit AuthorizedBurnerSet(burner, authorized);
    }

    // ── Reward Distribution ──────────────────────────────────────

    function distributeReward(
        address to,
        uint256 amount,
        string calldata reason
    ) external {
        if (msg.sender != rewardsPool && msg.sender != owner()) revert NotAuthorized();
        require(balanceOf(rewardsPool) >= amount, "Insufficient rewards pool");
        _transfer(rewardsPool, to, amount);
        emit RewardDistributed(to, amount, reason);
    }

    // ── BURN MECHANICS (PRD-compliant) ───────────────────────────

    /**
     * @notice Quarterly 1% rake burn. Can only be called once per 90 days.
     * @param amount Amount to burn from treasury revenue.
     */
    function quarterlyRakeBurn(uint256 amount) external onlyOwner {
        if (block.timestamp < lastQuarterlyBurn + 90 days) revert TooSoonForQuarterlyBurn();
        lastQuarterlyBurn = block.timestamp;

        // Burn from treasury (revenue is routed through treasury first)
        _burn(treasuryWallet, amount);
        totalBurned += amount;

        uint256 quarter = block.timestamp / 90 days;
        emit QuarterlyRakeBurned(amount, quarter);
        emit BurnEvent("quarterly_rake", amount, totalBurned);
    }

    /**
     * @notice Process breeding fee: burn 50%, send 50% to treasury.
     * Called by BreedingContract when a breed transaction is executed.
     * @param totalFee Total fee in $ARENA (already transferred to this contract).
     */
    function processBreedingFee(uint256 totalFee) external onlyAuthorizedBurner {
        uint256 burnAmount    = (totalFee * BREEDING_BURN_BPS) / 10_000;   // 50%
        uint256 treasuryShare = totalFee - burnAmount;                      // 50%

        _burn(address(this), burnAmount);
        _transfer(address(this), treasuryWallet, treasuryShare);
        totalBurned += burnAmount;

        emit BreedingFeeBurned(burnAmount, treasuryShare);
        emit BurnEvent("breeding_fee", burnAmount, totalBurned);
    }

    /**
     * @notice Process tournament entry fee: burn 25%, send 75% to prize pool.
     * Called by TournamentContract when an agent enters.
     * @param totalFee     Total entry fee.
     * @param prizePool    Address of the prize pool accumulator.
     */
    function processTournamentEntry(uint256 totalFee, address prizePool) external onlyAuthorizedBurner {
        uint256 burnAmount  = (totalFee * TOURNAMENT_BURN_BPS) / 10_000;   // 25%
        uint256 prizeShare  = totalFee - burnAmount;                         // 75%

        _burn(address(this), burnAmount);
        _transfer(address(this), prizePool, prizeShare);
        totalBurned += burnAmount;

        emit TournamentEntryBurned(burnAmount, prizeShare);
        emit BurnEvent("tournament_entry", burnAmount, totalBurned);
    }

    /**
     * @notice Process Skill NFT marketplace sale: burn 5%, send 95% to seller.
     * @param saleAmount    Total sale amount in $ARENA.
     * @param seller        NFT seller address.
     */
    function processMarketplaceRake(uint256 saleAmount, address seller) external onlyAuthorizedBurner {
        uint256 burnAmount  = (saleAmount * MARKETPLACE_BURN_BPS) / 10_000; // 5%
        uint256 sellerShare = saleAmount - burnAmount;                        // 95%

        _burn(address(this), burnAmount);
        _transfer(address(this), seller, sellerShare);
        totalBurned += burnAmount;

        emit MarketplaceRakeBurned(burnAmount, sellerShare);
        emit BurnEvent("marketplace_rake", burnAmount, totalBurned);
    }

    // ── Vesting ──────────────────────────────────────────────────

    function createVesting(
        address beneficiary,
        uint256 amount,
        uint64  duration,
        bool    revocable
    ) external onlyOwner {
        if (vestingSchedules[beneficiary].totalAmount != 0) revert VestingExists();
        require(balanceOf(address(this)) >= amount, "Insufficient balance for vesting");

        vestingSchedules[beneficiary] = VestingSchedule({
            totalAmount: amount,
            released:    0,
            startTime:   uint64(block.timestamp),
            duration:    duration,
            revocable:   revocable,
            revoked:     false
        });

        emit VestingCreated(beneficiary, amount, duration);
    }

    function releaseVested() external {
        VestingSchedule storage schedule = vestingSchedules[msg.sender];
        if (schedule.totalAmount == 0) revert NoVestingSchedule();
        if (schedule.revoked) revert NotAuthorized();

        uint256 elapsed = block.timestamp - schedule.startTime;
        uint256 vested  = elapsed >= schedule.duration
            ? schedule.totalAmount
            : (schedule.totalAmount * elapsed) / schedule.duration;

        uint256 releasable = vested - schedule.released;
        if (releasable == 0) revert NothingToRelease();

        schedule.released += releasable;
        _transfer(address(this), msg.sender, releasable);

        emit VestingReleased(msg.sender, releasable);
    }

    function revokeVesting(address beneficiary) external onlyOwner {
        VestingSchedule storage schedule = vestingSchedules[beneficiary];
        require(schedule.revocable, "Not revocable");
        require(!schedule.revoked,  "Already revoked");

        // Calculate unvested tokens to return to treasury
        uint256 elapsed  = block.timestamp - schedule.startTime;
        uint256 vested   = elapsed >= schedule.duration
            ? schedule.totalAmount
            : (schedule.totalAmount * elapsed) / schedule.duration;
        uint256 unvested = schedule.totalAmount - vested;

        schedule.revoked = true;

        if (unvested > 0) {
            _transfer(address(this), treasuryWallet, unvested);
            emit VestingRevoked(beneficiary, unvested);
        }
    }

    // ── Referral System ──────────────────────────────────────────

    /**
     * @notice Register a referral relationship.
     * Reward of 100 $ARENA is claimable once referee plays 3+ matches.
     */
    function registerReferral(address referee, address referrer) external onlyOwner {
        require(referee != referrer, "Self-referral");
        require(referredBy[referee] == address(0), "Already referred");
        referredBy[referee] = referrer;
    }

    /**
     * @notice Called by game server when a player completes a match.
     * Auto-pays referral reward after 3 matches.
     */
    function recordMatchPlayed(address player) external onlyAuthorizedBurner {
        matchesPlayed[player]++;

        address referrer = referredBy[player];
        if (
            referrer != address(0) &&
            !referralClaimed[player] &&
            matchesPlayed[player] >= REFERRAL_THRESHOLD
        ) {
            referralClaimed[player] = true;
            if (balanceOf(rewardsPool) >= REFERRAL_REWARD) {
                _transfer(rewardsPool, referrer, REFERRAL_REWARD);
                emit ReferralRewarded(referrer, player, REFERRAL_REWARD);
            }
        }
    }

    // ── Contract Address Updates ─────────────────────────────────

    function setTreasuryWallet(address _treasury)    external onlyOwner { treasuryWallet     = _treasury; }
    function setRewardsPool(address _rewards)        external onlyOwner { rewardsPool        = _rewards; }
    function setBettingContract(address _betting)    external onlyOwner { bettingContract    = _betting; }
    function setBreedingContract(address _breeding)  external onlyOwner { breedingContract   = _breeding; }
    function setTournamentContract(address _tourn)   external onlyOwner { tournamentContract = _tourn; }
    function setMarketplaceContract(address _market) external onlyOwner { marketplaceContract = _market; }

    // ── View Helpers ─────────────────────────────────────────────

    function circulatingSupply() external view returns (uint256) {
        // Circulating = minted - burned - vesting locked
        return TOTAL_SUPPLY - totalBurned - balanceOf(address(this));
    }

    function getVestedAmount(address beneficiary) external view returns (uint256 vested, uint256 releasable) {
        VestingSchedule storage s = vestingSchedules[beneficiary];
        if (s.totalAmount == 0 || s.revoked) return (0, 0);
        uint256 elapsed = block.timestamp - s.startTime;
        vested = elapsed >= s.duration ? s.totalAmount : (s.totalAmount * elapsed) / s.duration;
        releasable = vested - s.released;
    }

    function getBurnStats() external view returns (
        uint256 burned,
        uint256 remaining,
        uint256 burnPercent
    ) {
        burned = totalBurned;
        remaining = totalSupply();
        burnPercent = TOTAL_SUPPLY == 0 ? 0 : (totalBurned * 10_000) / TOTAL_SUPPLY; // basis points
    }
}
