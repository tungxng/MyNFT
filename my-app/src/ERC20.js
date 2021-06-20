import './App.css';
import React, { Component } from 'react';
import MyNFT from './contracts/MyNFT.json'
import ERC20Token from './contracts/TokenFactory.json'
import Web3 from 'web3';

class ERC20 extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      addressMarketPlace: '0x0',
      myNFT: {},
      erc20Token: {},
      balance: '0',
      myNFTBalance: '0',
      erc20TokenBalance: '0',
      systemInfo: [],
      loading: true,
    }
  }
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }
  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
  }
  async loadBlockchainData() {
    const web3 = window.web3
    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })
    const networkId = await web3.eth.net.getId()
    //load balance
    if (typeof accounts[0] !== 'undefined') {
      const balance = await web3.eth.getBalance(accounts[0])
      this.setState({ account: accounts[0], balance: balance })
    } else {
      window.alert('Please login with MetaMask')
    }
    // Load MyNFT
    const myNFTData = MyNFT.networks[networkId]
    if (myNFTData) {
      const myNFT = new web3.eth.Contract(MyNFT.abi, myNFTData.address)
      this.setState({ myNFT: myNFT })
      let myNFTBalance = await myNFT.methods.balanceOf(this.state.account).call()
      this.setState({ myNFTBalance: myNFTBalance.toString() })
    } else {
      window.alert('MyNFT contract not deployed to detected network.')
    }
    // Load ERCToken
    const ERC20TokenData = ERC20Token.networks[networkId]
    if (ERC20TokenData) {
      const erc20Token = new web3.eth.Contract(ERC20Token.abi, ERC20TokenData.address)
      this.setState({ erc20Token: erc20Token })
      let erc20TokenBalance = await erc20Token.methods.balanceOf(this.state.account).call()
      let systemInfo = await erc20Token.methods.systemInfo().call()
      this.setState({ erc20TokenBalance: erc20TokenBalance.toString(), systemInfo: systemInfo })
    } else {
      window.alert('ERC20Token contract not deployed to detected network.')
    }
  }
  async buyE20(amount) {
    if (this.state.erc20Token !== 'undefined') {
      try {
        await this.state.erc20Token.methods.buyToken().send({ value: amount, from: this.state.account })
        console.log('Done')
      } catch (e) {
        console.log('Error, buyE20: ', e)
      }
    }
  }
  render() {
    return (
      <div id="wrapper">
        <nav className="navbar-default navbar-static-side" role="navigation">
          <div className="sidebar-collapse">
            <ul className="nav metismenu" id="side-menu">
              <li className="nav-header">
                <div className="dropdown profile-element">
                  <img alt="image" className="rounded-circle" src="img/profile_small.jpg" />
                  <a data-toggle="dropdown" className="dropdown-toggle" href="#">
                    <span className="block m-t-xs font-bold">* {window.web3.utils.fromWei(this.state.balance)} BNB</span>
                    <span className="block m-t-xs font-bold">* {this.state.myNFTBalance} NFT</span>
                    <span className="block m-t-xs font-bold">* {window.web3.utils.fromWei(this.state.erc20TokenBalance)} GOLD</span>

                  </a>
                </div>
                <div className="logo-element">
                  NFT
          </div>
              </li>
              <li>
                <a href="/MyNFT"><i className="fa fa-edit" /> <span className="nav-label">NFT</span>
                </a>
              </li>
              <li className="active">
                <a href="/Gold"><i className="fa fa-pie-chart" /> <span className="nav-label">GOLD</span>
                </a>
              </li>
              <li>
                <a href="/MarketPlace"><i className="fa fa-flask" /> <span className="nav-label">MARKETPLACE</span></a>
              </li>
            </ul>
          </div>
        </nav>
        <div id="page-wrapper" className="gray-bg">
          <div className="row border-bottom">
            <nav className="navbar navbar-static-top white-bg" role="navigation" style={{ marginBottom: 0 }}>
              <div className="navbar-header">
                <a className="navbar-minimalize minimalize-styl-2 btn btn-primary " href="#"><i className="fa fa-bars" /> </a>
                <form role="search" className="navbar-form-custom" action="search_results.html">
                  <div className="form-group">
                    <input type="text" placeholder="Search for something..." className="form-control" name="top-search" id="top-search" />
                  </div>
                </form>
              </div>
              <ul className="nav navbar-top-links navbar-right">
                <li>
                  <span className="m-r-sm text-muted welcome-message"><strong>Account: </strong>{this.state.account}</span>
                </li>
              </ul>
            </nav>
          </div>
          <div className="wrapper wrapper-content animated fadeInRight">
            <div className="wrapper wrapper-content animated fadeInRight">
              <div className="row">
                <div className="col-lg-7">
                  <div className="ibox ">
                    <div className="ibox-content">
                      <div className="row">
                        <div className="col-sm-6 b-r">
                          <h3 className="m-t-none m-b">Buy GOLD</h3>
                          <form role="form" onSubmit={(e) => {
                            e.preventDefault()
                            let amount = this.amountERC20.value
                            amount = window.web3.utils.toWei(amount)
                            this.buyE20(amount)
                          }}>
                            <div className="form-group"><label>Enter the BNB number you want to buy</label> <input type="number" placeholder="BNB" className="form-control" ref={(input) => { this.amountERC20 = input }} required /></div>
                            <div>
                              <button className="btn btn-sm btn-primary float-right m-t-n-xs" type="submit" ><strong>BUY GOLD</strong></button>
                            </div>
                          </form>

                        </div>
                        <div className="col-sm-6">
                          <h4>Not a member?</h4>
                          <p>You can create an account:</p>
                          <p className="text-center">
                            <a href><i className="fa fa-sign-in big-icon" /></a>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    );
  }
}

export default ERC20;