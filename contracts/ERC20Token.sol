// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TokenFactory is ERC20, Ownable{
    
    event Bought(uint256 amount);
    event Withdraw(address owner, uint256 amount);
    
    uint private timePutOnSale;
    address private ownerAddress;
    uint256 private remaingToken;
    uint256 private soldToken = 0;
    

    function testbalance() public view returns(uint256){
        return address(this).balance;
    }
    
    constructor() ERC20("ERC20 test token", "E20"){
        ownerAddress = msg.sender;
        _mint(msg.sender, 1000*10**decimals()/2);
        _mint(address(this), 1000*10**decimals()/2);
        remaingToken = balanceOf(address(this));
        timePutOnSale = block.timestamp + 5 seconds;
    }

     function tokenPrice(uint256 amount) private view returns(uint256){
        uint256 time = block.timestamp - timePutOnSale;
        uint256 tokenAmount;
        if (time < 3 minutes){
            tokenAmount = amount * 5;
        } else if(time >= 3 minutes && time < 7 minutes){
            tokenAmount = amount * 4;
        } else {
            tokenAmount = amount * 3;
        }
        return tokenAmount;
    }
    
    function buyToken() public payable{
        uint256 totalToken = tokenPrice(msg.value);
        require(timePutOnSale < block.timestamp, "Tokens are unsale now");
        require(msg.value > 0, "you must enter some ether");
        require(totalToken <= balanceOf(address(this)), "address balance lower than token request");
        this.transfer(msg.sender, totalToken);
        soldToken += (totalToken); 
        remaingToken -= totalToken;
        emit Bought(msg.value);
    }

    function addTokenSupply() public onlyOwner{
        _mint(address(this), 50*10**decimals());
        remaingToken += 50*10**decimals();
    }
    
    //Schedule backend
    function systemInfo() public view returns(uint, uint, uint){
        return(totalSupply(), remaingToken, soldToken);
    }
    
    function withdraw() public payable onlyOwner{
        payable(msg.sender).transfer(address(this).balance);
        emit Withdraw(ownerAddress, address(this).balance);
    }
}
