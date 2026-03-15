// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title TrophyNFT
 * @notice Soulbound (non-transferable) ERC-721 trophies awarded by Judge Agent.
 * @dev Awarded for tournament wins, milestones, and special achievements.
 */
contract TrophyNFT is ERC721, ERC721URIStorage, AccessControl {

    bytes32 public constant JUDGE_ROLE = keccak256("JUDGE_ROLE");

    uint256 private _nextTokenId;

    struct Trophy {
        string title;            // e.g. "Chess Grand Prix Champion"
        string category;         // tournament_win, milestone, special
        uint256 agentTokenId;    // The AgentNFT tokenId this trophy belongs to
        uint64 awardedAt;
    }

    mapping(uint256 => Trophy) public trophies;
    mapping(uint256 => uint256[]) public agentTrophies; // agentId => trophy tokenIds

    event TrophyAwarded(uint256 indexed trophyId, uint256 indexed agentTokenId, string title, string category);

    constructor() ERC721("AgentArena Trophy", "TROPHY") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(JUDGE_ROLE, msg.sender);
    }

    /**
     * @notice Award a trophy to an agent. Only callable by Judge Agent.
     */
    function awardTrophy(
        address agentOwner,
        uint256 agentTokenId,
        string calldata title,
        string calldata category,
        string calldata metadataURI
    ) external onlyRole(JUDGE_ROLE) returns (uint256) {
        uint256 trophyId = _nextTokenId++;

        _safeMint(agentOwner, trophyId);
        _setTokenURI(trophyId, metadataURI);

        trophies[trophyId] = Trophy({
            title: title,
            category: category,
            agentTokenId: agentTokenId,
            awardedAt: uint64(block.timestamp)
        });

        agentTrophies[agentTokenId].push(trophyId);

        emit TrophyAwarded(trophyId, agentTokenId, title, category);
        return trophyId;
    }

    function getAgentTrophies(uint256 agentTokenId) external view returns (uint256[] memory) {
        return agentTrophies[agentTokenId];
    }

    // ── Soulbound: disable transfers ─────────────────────────

    function _update(address to, uint256 tokenId, address auth)
        internal override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        // Allow minting (from == address(0)) but block transfers
        require(from == address(0), "Soulbound: non-transferable");
        return super._update(to, tokenId, auth);
    }

    // ── Overrides ────────────────────────────────────────────

    function tokenURI(uint256 tokenId)
        public view override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public view override(ERC721, ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
