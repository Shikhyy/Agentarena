// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title AgentNFT
 * @notice ERC-721 NFT representing AI Agents in AgentArena
 * @dev Each agent has on-chain XP, ELO, level, and personality traits.
 *      Metadata evolves as agents play games and gain experience.
 *      UPDATER_ROLE allows Judge Agent to update stats post-match.
 */
contract AgentNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable, AccessControl {

    bytes32 public constant UPDATER_ROLE = keccak256("UPDATER_ROLE");

    uint256 private _nextTokenId;

    // ── Agent On-Chain State ─────────────────────────────────
    struct AgentStats {
        string name;
        string personality;   // aggressive, conservative, unpredictable, adaptive, chaos
        uint256 xp;
        uint256 elo;
        uint16 level;
        uint32 wins;
        uint32 losses;
        uint32 gamesPlayed;
        uint64 createdAt;
        uint64 lastBattleAt;
        bool isRetired;       // Hall of Fame status
    }

    // ── Breeding / Bloodline ─────────────────────────────────
    struct Bloodline {
        uint256 parentA;
        uint256 parentB;
        uint8 generation;
    }

    mapping(uint256 => AgentStats) public agentStats;
    mapping(uint256 => Bloodline) public bloodline;
    mapping(uint256 => uint256[]) public equippedSkills; // tokenId => skillNFT tokenIds

    // ── fee config ───────────────────────────────────────────
    uint256 public mintPrice = 0.01 ether;
    uint256 public breedPrice = 0.02 ether;
    uint256 public maxSupply = 10_000;

    // ── Events ───────────────────────────────────────────────
    event AgentMinted(uint256 indexed tokenId, address indexed owner, string name, string personality);
    event AgentBred(uint256 indexed childId, uint256 parentA, uint256 parentB, uint8 generation);
    event StatsUpdated(uint256 indexed tokenId, uint256 xp, uint256 elo, uint16 level, uint32 wins, uint32 losses);
    event AgentRetired(uint256 indexed tokenId, string name, uint256 finalElo);
    event SkillEquipped(uint256 indexed agentId, uint256 skillId);
    event SkillUnequipped(uint256 indexed agentId, uint256 skillId);

    // ── Game Engine (authorized caller) ─────────────────────
    address public gameEngine;

    modifier onlyGameEngine() {
        require(msg.sender == gameEngine || msg.sender == owner() || hasRole(UPDATER_ROLE, msg.sender), "Not authorized");
        _;
    }

    constructor() ERC721("AgentArena Agent", "AGENT") Ownable(msg.sender) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    // ── Minting ──────────────────────────────────────────────
    function mintAgent(
        string calldata name,
        string calldata personality,
        string calldata metadataURI
    ) external payable returns (uint256) {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(_nextTokenId < maxSupply, "Max supply reached");

        uint256 tokenId = _nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);

        agentStats[tokenId] = AgentStats({
            name: name,
            personality: personality,
            xp: 0,
            elo: 1500,
            level: 1,
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
            createdAt: uint64(block.timestamp),
            lastBattleAt: 0,
            isRetired: false
        });

        emit AgentMinted(tokenId, msg.sender, name, personality);
        return tokenId;
    }

    // ── Breeding ─────────────────────────────────────────────
    function breedAgents(
        uint256 parentA,
        uint256 parentB,
        string calldata childName,
        string calldata childPersonality,
        string calldata metadataURI
    ) external payable returns (uint256) {
        require(msg.value >= breedPrice, "Insufficient breeding fee");
        require(ownerOf(parentA) == msg.sender, "Not owner of parent A");
        require(ownerOf(parentB) == msg.sender, "Not owner of parent B");
        require(parentA != parentB, "Cannot self-breed");
        require(!agentStats[parentA].isRetired, "Parent A is retired");
        require(!agentStats[parentB].isRetired, "Parent B is retired");
        require(agentStats[parentA].level >= 5, "Parent A needs level 5+");
        require(agentStats[parentB].level >= 5, "Parent B needs level 5+");

        uint256 childId = _nextTokenId++;

        _safeMint(msg.sender, childId);
        _setTokenURI(childId, metadataURI);

        // Inherit averaged ELO from parents
        uint256 inheritedElo = (agentStats[parentA].elo + agentStats[parentB].elo) / 2;

        // Generation = max(parentA, parentB) + 1
        uint8 genA = bloodline[parentA].generation;
        uint8 genB = bloodline[parentB].generation;
        uint8 childGen = (genA > genB ? genA : genB) + 1;

        agentStats[childId] = AgentStats({
            name: childName,
            personality: childPersonality,
            xp: 0,
            elo: inheritedElo,
            level: 1,
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
            createdAt: uint64(block.timestamp),
            lastBattleAt: 0,
            isRetired: false
        });

        bloodline[childId] = Bloodline({
            parentA: parentA,
            parentB: parentB,
            generation: childGen
        });

        emit AgentBred(childId, parentA, parentB, childGen);
        return childId;
    }

    // ── Game Engine: Update Stats ────────────────────────────
    function updateStats(
        uint256 tokenId,
        uint256 xpGained,
        int256 eloChange,
        bool won
    ) external onlyGameEngine {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        AgentStats storage stats = agentStats[tokenId];
        require(!stats.isRetired, "Agent is retired");

        stats.xp += xpGained;
        stats.gamesPlayed += 1;
        stats.lastBattleAt = uint64(block.timestamp);

        if (won) {
            stats.wins += 1;
        } else {
            stats.losses += 1;
        }

        // ELO update (clamped to 0)
        if (eloChange >= 0) {
            stats.elo += uint256(eloChange);
        } else {
            uint256 loss = uint256(-eloChange);
            stats.elo = stats.elo > loss ? stats.elo - loss : 0;
        }

        // Level up: every 1000 XP
        stats.level = uint16(stats.xp / 1000) + 1;

        emit StatsUpdated(tokenId, stats.xp, stats.elo, stats.level, stats.wins, stats.losses);
    }

    // ── Judge Agent: Post-Match Update ─────────────────────
    /**
     * @notice Called by Judge Agent (UPDATER_ROLE) after match settlement.
     *         Updates ELO, wins/losses, and evolution stage in one call.
     */
    function updatePostMatch(
        uint256 tokenId,
        uint256 xpGained,
        int256 eloChange,
        bool won,
        string calldata newMetadataURI
    ) external onlyGameEngine {
        require(_ownerOf(tokenId) != address(0), "Agent does not exist");
        AgentStats storage stats = agentStats[tokenId];
        require(!stats.isRetired, "Agent is retired");

        stats.xp += xpGained;
        stats.gamesPlayed += 1;
        stats.lastBattleAt = uint64(block.timestamp);

        if (won) { stats.wins += 1; } else { stats.losses += 1; }

        if (eloChange >= 0) {
            stats.elo += uint256(eloChange);
        } else {
            uint256 loss = uint256(-eloChange);
            stats.elo = stats.elo > loss ? stats.elo - loss : 0;
        }

        stats.level = uint16(stats.xp / 1000) + 1;

        // Update metadata URI for evolution
        if (bytes(newMetadataURI).length > 0) {
            _setTokenURI(tokenId, newMetadataURI);
        }

        emit StatsUpdated(tokenId, stats.xp, stats.elo, stats.level, stats.wins, stats.losses);
    }

    // ── Hall of Fame (Retire) ────────────────────────────────
    function retireAgent(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(agentStats[tokenId].level >= 20, "Need level 20+ to retire");
        require(!agentStats[tokenId].isRetired, "Already retired");

        agentStats[tokenId].isRetired = true;
        emit AgentRetired(tokenId, agentStats[tokenId].name, agentStats[tokenId].elo);
    }

    // ── Skill Equip/Unequip ─────────────────────────────────
    function equipSkill(uint256 agentId, uint256 skillId) external {
        require(ownerOf(agentId) == msg.sender, "Not owner");
        require(equippedSkills[agentId].length < 3, "Max 3 skills");
        equippedSkills[agentId].push(skillId);
        emit SkillEquipped(agentId, skillId);
    }

    function unequipSkill(uint256 agentId, uint256 skillIndex) external {
        require(ownerOf(agentId) == msg.sender, "Not owner");
        uint256[] storage skills = equippedSkills[agentId];
        require(skillIndex < skills.length, "Invalid index");
        uint256 skillId = skills[skillIndex];
        skills[skillIndex] = skills[skills.length - 1];
        skills.pop();
        emit SkillUnequipped(agentId, skillId);
    }

    function getEquippedSkills(uint256 agentId) external view returns (uint256[] memory) {
        return equippedSkills[agentId];
    }

    // ── Admin ────────────────────────────────────────────────
    function setGameEngine(address _engine) external onlyOwner {
        gameEngine = _engine;
    }

    function setMintPrice(uint256 _price) external onlyOwner {
        mintPrice = _price;
    }

    function setBreedPrice(uint256 _price) external onlyOwner {
        breedPrice = _price;
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // ── Overrides ────────────────────────────────────────────
    function _update(address to, uint256 tokenId, address auth)
        internal override(ERC721, ERC721Enumerable)
        returns (address)
    {
        return super._update(to, tokenId, auth);
    }

    function _increaseBalance(address account, uint128 value)
        internal override(ERC721, ERC721Enumerable)
    {
        super._increaseBalance(account, value);
    }

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721Enumerable, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
