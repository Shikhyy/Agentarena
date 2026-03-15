// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

/**
 * @title Marketplace
 * @notice Buy/sell/breed agents and skills with royalty distribution.
 * @dev 10% royalty: 5% to original creator, 5% to treasury.
 *      Breed gate: both parents must be Level 10+.
 *      Offspring traits: averaged from parents + 10% mutation.
 */
contract Marketplace is AccessControl {

    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

    struct Listing {
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        bool active;
    }

    mapping(uint256 => Listing) public listings;
    uint256 public nextListingId;

    address public treasury;
    uint256 public royaltyBps = 1000;       // 10% total
    uint256 public creatorShareBps = 500;   // 5% to creator
    uint256 public burnShareBps = 500;      // 5% burn on marketplace sales
    address public burnAddress;

    // Track original creators for royalties
    mapping(address => mapping(uint256 => address)) public originalCreator;

    event Listed(uint256 indexed listingId, address indexed seller, address nftContract, uint256 tokenId, uint256 price);
    event Sold(uint256 indexed listingId, address indexed buyer, uint256 price, uint256 royalty);
    event Delisted(uint256 indexed listingId);

    constructor(address _treasury, address _burnAddress) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
        treasury = _treasury;
        burnAddress = _burnAddress;
    }

    /**
     * @notice List an NFT for sale. Seller must approve this contract first.
     */
    function list(address nftContract, uint256 tokenId, uint256 price) external returns (uint256) {
        require(price > 0, "Price must be > 0");
        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not owner");
        require(
            nft.isApprovedForAll(msg.sender, address(this)) ||
            nft.getApproved(tokenId) == address(this),
            "Not approved"
        );

        // Record original creator if first listing
        if (originalCreator[nftContract][tokenId] == address(0)) {
            originalCreator[nftContract][tokenId] = msg.sender;
        }

        uint256 listingId = nextListingId++;
        listings[listingId] = Listing({
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            active: true
        });

        emit Listed(listingId, msg.sender, nftContract, tokenId, price);
        return listingId;
    }

    /**
     * @notice Buy a listed NFT. Royalties are distributed automatically.
     */
    function buy(uint256 listingId) external payable {
        Listing storage item = listings[listingId];
        require(item.active, "Not active");
        require(msg.value >= item.price, "Insufficient payment");

        item.active = false;

        uint256 totalRoyalty = (item.price * royaltyBps) / 10000;
        uint256 creatorCut = (item.price * creatorShareBps) / 10000;
        uint256 burnCut = totalRoyalty - creatorCut;
        uint256 sellerProceeds = item.price - totalRoyalty;

        // Transfer NFT
        IERC721(item.nftContract).safeTransferFrom(item.seller, msg.sender, item.tokenId);

        // Distribute funds
        payable(item.seller).transfer(sellerProceeds);

        address creator = originalCreator[item.nftContract][item.tokenId];
        if (creator != address(0) && creatorCut > 0) {
            payable(creator).transfer(creatorCut);
        }
        if (burnCut > 0) {
            payable(burnAddress).transfer(burnCut);
        }

        // Refund excess
        if (msg.value > item.price) {
            payable(msg.sender).transfer(msg.value - item.price);
        }

        emit Sold(listingId, msg.sender, item.price, totalRoyalty);
    }

    function delist(uint256 listingId) external {
        Listing storage item = listings[listingId];
        require(item.seller == msg.sender, "Not seller");
        require(item.active, "Not active");
        item.active = false;
        emit Delisted(listingId);
    }

    // ── Admin ────────────────────────────────────────────────

    function setTreasury(address _treasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        treasury = _treasury;
    }

    function setBurnAddress(address _burn) external onlyRole(DEFAULT_ADMIN_ROLE) {
        burnAddress = _burn;
    }

    receive() external payable {}
}
