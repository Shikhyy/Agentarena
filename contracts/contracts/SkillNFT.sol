// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";

/**
 * @title SkillNFT
 * @notice ERC-1155 multi-token representing equippable Skills for AI Agents
 * @dev Skills come in different rarities and are game-type specific.
 *      Each skill ID maps to a specific ability that agents can use.
 */
contract SkillNFT is ERC1155, ERC1155Supply, Ownable {

    // ── Skill Metadata ───────────────────────────────────────
    enum Rarity { Common, Uncommon, Rare, Epic, Legendary }
    enum GameType { All, Chess, Poker, Monopoly }

    struct SkillDefinition {
        string name;
        string description;
        Rarity rarity;
        GameType gameType;
        uint256 maxSupply;   // 0 = unlimited
        uint256 price;       // in wei
        bool active;
    }

    mapping(uint256 => SkillDefinition) public skills;
    uint256 public nextSkillId;

    // ── Events ───────────────────────────────────────────────
    event SkillCreated(uint256 indexed skillId, string name, Rarity rarity, GameType gameType);
    event SkillPurchased(uint256 indexed skillId, address indexed buyer, uint256 amount);

    constructor() ERC1155("https://api.agentarena.gg/skills/{id}.json") Ownable(msg.sender) {
        // Pre-define Phase 1 skills
        _createSkill("Poker Face", "Reduces bluff detection by opponents by 30%", Rarity.Rare, GameType.Poker, 500, 0.005 ether);
        _createSkill("Grandmaster Openings", "Access to 50+ proven chess opening strategies", Rarity.Epic, GameType.Chess, 200, 0.01 ether);
        _createSkill("Bluff Detector", "15% chance to detect opponent bluffs each round", Rarity.Uncommon, GameType.Poker, 1000, 0.003 ether);
        _createSkill("Endgame Mastery", "Enhanced piece evaluation in endgame positions", Rarity.Rare, GameType.Chess, 500, 0.005 ether);
        _createSkill("Time Pressure", "Forces opponent to make decisions 20% faster", Rarity.Common, GameType.All, 0, 0.001 ether);
        _createSkill("Counter-Attack", "10% damage boost when responding to opponent moves", Rarity.Uncommon, GameType.All, 2000, 0.002 ether);
        _createSkill("Pattern Recognition", "Agent learns opponent patterns 25% faster", Rarity.Epic, GameType.All, 150, 0.015 ether);
        _createSkill("Deal Maker", "Enhanced negotiation in property trades", Rarity.Rare, GameType.Monopoly, 300, 0.008 ether);
        _createSkill("Mind Games", "Randomly injects unexpected moves 10% of the time", Rarity.Legendary, GameType.All, 50, 0.05 ether);
        _createSkill("Iron Will", "Prevents tilt - agent performance stays stable under pressure", Rarity.Legendary, GameType.All, 100, 0.03 ether);
    }

    // ── Admin: Create Skills ─────────────────────────────────
    function _createSkill(
        string memory name,
        string memory description,
        Rarity rarity,
        GameType gameType,
        uint256 maxSupply,
        uint256 price
    ) internal {
        uint256 skillId = nextSkillId++;
        skills[skillId] = SkillDefinition({
            name: name,
            description: description,
            rarity: rarity,
            gameType: gameType,
            maxSupply: maxSupply,
            price: price,
            active: true
        });
        emit SkillCreated(skillId, name, rarity, gameType);
    }

    function createSkill(
        string calldata name,
        string calldata description,
        Rarity rarity,
        GameType gameType,
        uint256 maxSupply,
        uint256 price
    ) external onlyOwner {
        _createSkill(name, description, rarity, gameType, maxSupply, price);
    }

    // ── Purchase Skills ──────────────────────────────────────
    function purchaseSkill(uint256 skillId, uint256 amount) external payable {
        SkillDefinition storage skill = skills[skillId];
        require(skill.active, "Skill not active");
        require(msg.value >= skill.price * amount, "Insufficient payment");
        if (skill.maxSupply > 0) {
            require(totalSupply(skillId) + amount <= skill.maxSupply, "Exceeds max supply");
        }
        _mint(msg.sender, skillId, amount, "");
        emit SkillPurchased(skillId, msg.sender, amount);
    }

    // ── Reward Skills (from game wins) ───────────────────────
    function rewardSkill(address to, uint256 skillId, uint256 amount) external onlyOwner {
        SkillDefinition storage skill = skills[skillId];
        require(skill.active, "Skill not active");
        if (skill.maxSupply > 0) {
            require(totalSupply(skillId) + amount <= skill.maxSupply, "Exceeds max supply");
        }
        _mint(to, skillId, amount, "");
    }

    // ── Admin ────────────────────────────────────────────────
    function setSkillActive(uint256 skillId, bool active) external onlyOwner {
        skills[skillId].active = active;
    }

    function setSkillPrice(uint256 skillId, uint256 price) external onlyOwner {
        skills[skillId].price = price;
    }

    function setURI(string calldata newURI) external onlyOwner {
        _setURI(newURI);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // ── View ─────────────────────────────────────────────────
    function getSkill(uint256 skillId) external view returns (SkillDefinition memory) {
        return skills[skillId];
    }

    function getSkillCount() external view returns (uint256) {
        return nextSkillId;
    }

    // ── Overrides ────────────────────────────────────────────
    function _update(address from, address to, uint256[] memory ids, uint256[] memory values)
        internal override(ERC1155, ERC1155Supply)
    {
        super._update(from, to, ids, values);
    }
}
