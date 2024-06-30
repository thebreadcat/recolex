// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Pebbl is ERC1155, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIdCounter;

    uint256 public mintPrice = 0.0004 ether;
    uint256 public creatorRoyalty = 75; // 75% royalty
    bool public freeFirstMint = true;
    string private _contractURI;

    struct Item {
        address creator;
        string metadataUri;
        bool publicMinting;
        uint256 totalMints;
    }

    mapping(uint256 => Item) private _items;
    mapping(address => uint256) private _firstMint;

    event NewNFTMinted(uint256 indexed id, address indexed creator, string metadataUri);

    constructor() ERC1155("https://recolex.io/metadata/{id}.json") {}

    function createItem(string memory metadataUri, bool allowPublicMinting) public payable returns (uint256) {
        if (freeFirstMint && _firstMint[msg.sender] == 0 && msg.sender != owner()) {
            _firstMint[msg.sender] = 1;
        } else if (msg.sender != owner()) {
            require(msg.value == mintPrice, "Incorrect ETH amount sent");
        }

        _itemIdCounter.increment();
        uint256 newItemId = _itemIdCounter.current();

        _items[newItemId] = Item({
            creator: msg.sender,
            metadataUri: metadataUri,
            publicMinting: allowPublicMinting,
            totalMints: 1
        });
        _mint(msg.sender, newItemId, 1, "");

        emit NewNFTMinted(newItemId, msg.sender, metadataUri);
        return newItemId;
    }

    function mint(uint256 id, uint256 amount) public payable {
        require(_items[id].creator != address(0), "Item does not exist");
        require(
            msg.sender == _items[id].creator || _items[id].publicMinting,
            "Minting not allowed by others"
        );

        uint256 totalPrice = mintPrice * amount;
        require(msg.value == totalPrice, "Incorrect ETH amount sent");

        if (msg.sender != _items[id].creator && totalPrice > 0) {
            uint256 royalty = (totalPrice * creatorRoyalty) / 100;
            payable(_items[id].creator).transfer(royalty);
        }

        _items[id].totalMints += amount;
        _mint(msg.sender, id, amount, "");
    }

    function mintFor(uint256 id, uint256 amount, address recipient) public payable {
        require(_items[id].creator != address(0), "Item does not exist");
        require(
            msg.sender == _items[id].creator || _items[id].publicMinting,
            "Minting not allowed by others"
        );

        uint256 totalPrice = mintPrice * amount;
        require(msg.value == totalPrice, "Incorrect ETH amount sent");

        if (msg.sender != _items[id].creator && totalPrice > 0) {
            uint256 royalty = (totalPrice * creatorRoyalty) / 100;
            payable(_items[id].creator).transfer(royalty);
        }

        _items[id].totalMints += amount;
        _mint(recipient, id, amount, "");
    }

    function uri(uint256 tokenId) override public view returns (string memory) {
        return _items[tokenId].metadataUri;
    }

    function setTokenUri(uint256 tokenId, string memory newUri) public onlyOwner {
        _items[tokenId].metadataUri = newUri;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function transferOwnership(address newOwner) public override onlyOwner {
        _transferOwnership(newOwner);
    }

    function togglePublicMinting(uint256 id) public {
        require(msg.sender == _items[id].creator, "Only creator can toggle");
        bool currentStatus = _items[id].publicMinting;
        _items[id].publicMinting = !currentStatus;
    }

    function setMintPrice(uint256 newPrice) public onlyOwner {
        mintPrice = newPrice;
    }

    function setCreatorRoyalty(uint256 newRoyalty) public onlyOwner {
        require(newRoyalty <= 100, "Royalty cannot exceed 100%");
        creatorRoyalty = newRoyalty;
    }

    function setFreeFirstMint(bool enabled) public onlyOwner {
        freeFirstMint = enabled;
    }

    function getFirstMint(address user) public view returns (uint256) {
        return _firstMint[user];
    }

    function setFirstMint(address user, uint256 tokenId) public onlyOwner {
        _firstMint[user] = tokenId;
    }

    function setContractURI(string memory newContractURI) public onlyOwner {
        _contractURI = newContractURI;
    }

    function contractURI() public view returns (string memory) {
        return _contractURI;
    }

    function totalCreatedItems() public view returns (uint256) {
        return _itemIdCounter.current();
    }

    function isCreator(uint256 tokenId, address user) public view returns (bool) {
        return _items[tokenId].creator == user;
    }

    function isPublicMintingEnabled(uint256 tokenId) public view returns (bool) {
        return _items[tokenId].publicMinting;
    }

    function getTotalMints(uint256 tokenId) public view returns (uint256) {
        return _items[tokenId].totalMints;
    }

    function getCreator(uint256 tokenId) public view returns (address) {
        return _items[tokenId].creator;
    }
}
