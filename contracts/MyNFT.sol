// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
    
contract MyNFT is ERC721URIStorage {
    mapping (uint =>TokenInfo) public forSale ;
    event Mint(address recipient, uint tokenId);
    constructor() ERC721("MyNFT", "NFT") {}
    uint[] public listIdNFT;

    struct TokenInfo {
        uint price;
        bool status;
    }
    
    // Create NFT
    function mintToken(uint _idToken, string memory tokenURI) public returns (uint)
    {
        _safeMint(msg.sender, _idToken);
        _setTokenURI(_idToken, tokenURI);
        listIdNFT.push(_idToken);
        emit Mint(msg.sender, _idToken);
        return _idToken;
    }
    
    function getListIdNFT() public view returns(uint[] memory) {
        return listIdNFT;
    }
    
    function removeListNFT(uint _tokenId) private {
        for (uint i = 0; i < listIdNFT.length; i++) {
            if (listIdNFT[i] == _tokenId) {
                listIdNFT[i] = listIdNFT[listIdNFT.length - 1];
                listIdNFT.pop();
            }
        }
    }
    
    function setStatus(uint _tokenID, uint _price, bool _status) public{
        forSale[_tokenID].price = _price;
        forSale[_tokenID].status = _status;
    }
    

    // UnSale nft 
    function unSale(uint _idToken) public{
        setStatus(_idToken, 0, false);
        approve(address(0),_idToken);
        
    }

    //delete token
    function deleteNFT(uint _tokenId) public  {
        require (_exists(_tokenId) , "Token is not exist !");
        require (ownerOf(_tokenId) == msg.sender ,  "Token is not owned !" );
        _burn(_tokenId);
        removeListNFT(_tokenId);
    }
    //Check exists of token
    function exists(uint _tokenId) public view returns (bool) {
        return _exists(_tokenId);
    }
}
