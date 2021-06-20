// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ERC20Token.sol";
import "./MyNFT.sol";

contract  Marketplace is Ownable{
    event Saler(address Saler, uint idToken, uint priceToken);
    event Buyer(address Buyer, uint idToken, uint priceToken);
    
    address addressContractMyNFT;
    address addressContractERC20;
    

    constructor(address _addressContractMyNFT, address _addressContractERC20) {
        addressContractMyNFT = _addressContractMyNFT;
        addressContractERC20 = _addressContractERC20;
    }
    
    //call MyNFT
    function callContractMyNFT() private view returns (MyNFT){
        MyNFT nft = MyNFT(addressContractMyNFT);
        return nft;
    }
    
    // call contract tokenERC20
    function callContractERC20() private view returns (TokenFactory){
        TokenFactory erc20 = TokenFactory(addressContractERC20);
        return erc20;
    }
    
    function getTokenInfo(uint _tokenId) public view returns(address, uint, bool){
        address owner = callContractMyNFT().ownerOf(_tokenId); 
        (uint price, bool sale) = callContractMyNFT().forSale(_tokenId);
        return (owner, price, sale);
    }
    
    // setPrice and SaleNFT
    function saleNFT(uint _tokenId, uint _price) public
    {
        require(address(this) == callContractMyNFT().getApproved(_tokenId), "Token is not approved !" );
        require(callContractMyNFT().exists(_tokenId), " Token is not exists !");
        require(callContractMyNFT().ownerOf(_tokenId) == msg.sender, " Token is not owned ! ");
        callContractMyNFT().setStatus(_tokenId, _price ,true);
        emit Saler(msg.sender,_tokenId, _price);
    }
    
    //  Buy NFT
    function buyToken(uint _tokenId) public
    {
        address owner = callContractMyNFT().ownerOf(_tokenId);
        (,uint price, bool sale) = getTokenInfo(_tokenId);
        require(msg.sender != address(0) && msg.sender != address(this) , "Invalid token address !");
        require(callContractMyNFT().exists(_tokenId),"Token is not exists !");
        require(sale == true, "Token is not sale now");
        callContractERC20().transferFrom(msg.sender, owner, price);
        callContractMyNFT().safeTransferFrom(callContractMyNFT().ownerOf(_tokenId), msg.sender, _tokenId);
        callContractMyNFT().setStatus(_tokenId, 0, false);
        emit Buyer(msg.sender ,_tokenId, price);
    }
}
