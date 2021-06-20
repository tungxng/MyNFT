const MyNFT = artifacts.require("MyNFT");
const TokenFactory = artifacts.require("TokenFactory");
module.exports = function (deployer) {
  deployer.deploy(MyNFT);
  deployer.deploy(TokenFactory);
};
