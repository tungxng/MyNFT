import './App.css';
import React, { Component } from 'react';
import MyNFT from './contracts/MyNFT.json'
import ERC20Token from './contracts/TokenFactory.json'
import MarketPlace from './contracts/Marketplace.json'
import Web3 from 'web3';

class isMyNFT extends Component {
  constructor(props) {
    super(props)
    this.state = {
      account: '0x0',
      addressMarketPlace: '0x0',
      myNFT: {},
      erc20Token: {},
      marketPlace: {},
      balance: '0',
      myNFTBalance: '0',
      erc20TokenBalance: '0',
      systemInfo: [],
      loading: true,
      listIdNFT: [],
      listObjectId: []
    }
  }
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
    await this.getArray()
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
    this.setState({ loading: false })
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
    // Load Market
    const MarketPlaceData = MarketPlace.networks[networkId]
    if (MarketPlaceData) {
      const marketPlace = new web3.eth.Contract(MarketPlace.abi, MarketPlaceData.address)
      const addressMarketPlace = MarketPlaceData.address;
      this.setState({ marketPlace, addressMarketPlace: addressMarketPlace })
    } else {
      window.alert('MarketPlace contract not deployed to detected network.')
    }
  }
  async mintNFT(tokenID, URI) {
    if (this.state.myNFT !== 'undefined') {
      try {
        await this.state.myNFT.methods.mintToken(tokenID, URI).send({ from: this.state.account })
        console.log('Done')
      } catch (e) {
        console.log('Error, mintNFT: ', e)
      }
    }
  }
  async sellNFT(tokenID, price) {
    if (this.state.myNFT !== 'undefined' && this.state.marketPlace !== 'undefined') {
      try {
        await this.state.myNFT.methods.approve(this.state.addressMarketPlace, tokenID).send({ from: this.state.account })
        await this.state.marketPlace.methods.saleNFT(tokenID, price).send({ from: this.state.account })
        console.log('Done')
      } catch (e) {
        console.log('Error, sellNFT: ', e)
      }
    }
  }

  //Input <List> => ListObject
  async getArray() {
    var objectArr = []
    var listIdNFT = await this.state.myNFT.methods.getListIdNFT().call({ from: this.state.account })
    this.setState({listIdNFT : listIdNFT})
    for (var i = 0; i < listIdNFT.length + 1; i++) {
      if (i === listIdNFT.length) {
        await this.getItem((listIdNFT[i - 1]), function (err, data) { return data })
        break
      }
      await this.getItem(listIdNFT[i], function (err, data) {
        if (err !== null) {
          console.log(err)
        } else {
          console.log(data)
          objectArr.push(data)
        }
      })
    }
    console.log(objectArr)
    this.setState({ listObjectId: objectArr })
  }
  //Input ID => Object info
  async getItem(tokenId, callback) {
    console.log(tokenId)
    var uri = await this.state.myNFT.methods.tokenURI(tokenId).call({ from: this.state.account });
    var infoNFT = await this.state.marketPlace.methods.getTokenInfo(tokenId).call({ from: this.state.account })
    var owner = await this.state.myNFT.methods.ownerOf(tokenId).call({ from: this.state.account })
    this.getJson(uri, function (err, data) {
      if (err != null) {
        console.error(err)
      } else {
        var info = {}
        info['name'] = `${data.name}`
        info['image'] = `${data.image}`
        info['description'] = `${data.description}`
        info['price'] = infoNFT[1]
        info['status'] = infoNFT[2]
        info['owner'] = owner
        info['id'] = tokenId
        console.log("HERE: " + info)
        callback(null, info)
      }
    })
  }
  //Input URL => Json
  getJson(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';

    xhr.onload = function () {

      var status = xhr.status;

      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status);
      }
    };
    xhr.send();
  }



  render() {

    var nfts = this.state.listObjectId
    let elements = nfts.map((nft, index) => {
      let result = ''
      if (nft.owner == this.state.account) {
        result = <div className="col-lg-3">
          <div className="contact-box center-version">
            <a >
              <img alt="image" style={{ height: '200px' }} src={nft.image} />
              <h3 className="m-b-xs"><strong>#{nft.name}</strong></h3>
              <div className="font-bold">ID: {nft.id}</div>
              <address className="m-t-md">
                {nft.description}<br />
                <strong>How much do you want to sell ?</strong><br />
                <div className="form-group"><input id={nft.id} type="number" step = '0.1' placeholder="GOLD" className="form-control" ref={(input) => { this.priceID = input }} required /></div>
                <strong>NFT transfer</strong><br />
                <div className="form-group"><input id={'receiver'+nft.id} type="text" placeholder="Address receiver" className="form-control" ref={(input) => { this.priceID = input }} required /></div>

              </address>
              <div className="contact-box-footer">
                <div class="m-t-xs btn-group">
                <form role="form" onSubmit={(e) => {
                      e.preventDefault()
                      let receiver = document.getElementById('receiver'+ nft.id).value
                      this.state.myNFT.methods.safeTransferFrom(this.state.account,receiver,nft.id).send({from: this.state.account})
                    }}>
                      <div className="m-t-xs btn-group">
                        <button className="btn btn-sm btn-primary float-right m-t-n-xs" type="submit"><strong>Transfer</strong></button>
                      </div>
                    </form>
                  {nft.status
                    ?
                    <form role="form" onClick={(e) => {
                      e.preventDefault()
                      this.state.myNFT.methods.unSale(nft.id).send({ from: this.state.account })
                    }}>
                      <div className="m-t-xs btn-group">
                        <button className="btn btn-sm btn-primary float-right m-t-n-xs" style={{ backgroundColor: '#ffa31a' }} type="submit"><strong>UnSale</strong></button>
                      </div>
                    </form>
                    :
                    <form role="form" onSubmit={(e) => {
                      e.preventDefault()
                      let price = document.getElementById(nft.id).value
                      // window.alert(price)
                      price = window.web3.utils.toWei(price)
                      this.sellNFT(nft.id, price)
                    }}>
                      <div className="m-t-xs btn-group">
                        <button className="btn btn-sm btn-primary float-right m-t-n-xs" type="submit"><strong>Sale</strong></button>
                      </div>
                    </form>
                  }
                  <form role="form" onClick={(e) => {
                    e.preventDefault()
                    this.state.myNFT.methods.deleteNFT(nft.id).send({ from: this.state.account })
                  }}>
                    <div className="m-t-xs btn-group">
                      <button className="btn btn-sm btn-primary float-right m-t-n-xs" style={{ backgroundColor: 'red' }} type="submit"><strong>Remove</strong></button>
                    </div>
                  </form>

                </div>

              </div>
            </a>
          </div>
        </div>
      }
      return result
    });

    
    let search = nfts.map((nft, index) => {

      <form onSubmit={(e) => {
        e.preventDefault()
        let idToken = this.mintTokenID.value
        let uri = this.mintTokenURI.value
        this.mintNFT(idToken, uri)
      }}>
        <div className='form-group mr-sm-2'>
          <br></br>
          <input
            id='mintTokenID'
            type='number'
            ref={(input) => { this.mintTokenID = input }}
            className="form-control form-control-md"
            placeholder='ID NFT'
            required />
          <br></br>
          <input
            id='mintTokenURI'
            ref={(input) => { this.mintTokenURI = input }}
            className="form-control form-control-md"
            placeholder='URI'
            required />
        </div>
        <button type='submit' className='button'>MINT</button>
      </form>

      return "bbbbbbb";
    });


    return (
      <div id="wrapper">
        <nav className="navbar-default navbar-static-side" role="navigation">
          <div className="sidebar-collapse">
            <ul className="nav metismenu" id="side-menu">
              <li className="nav-header">
                <div className="dropdown profile-element" >
                  <img alt="image" className="rounded-circle"  src="img/profile_small.jpg" />
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
              <li>
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
            <nav className="navbar navbar-static-top" role="navigation" style={{ marginBottom: 0 }}>
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
          <div className="row wrapper border-bottom white-bg page-heading">
            <div className="col-lg-9">
              <h2>Mint NFT</h2>
            </div>
          </div>
          <div className="wrapper wrapper-content animated fadeInRight">
            <div className="row">
              <div className="col-lg-7">
                <div className="ibox ">
                  <div className="ibox-content">
                    <div className="row">
                      <div className="col-sm-6 b-r">
                        <h3 className="m-t-none m-b">Mint NFT</h3>
                        <form role="form" onSubmit={(e) => {
                          e.preventDefault()
                          // let idToken = this.mintTokenID.value
                          let uri = 'https://cloudflare-ipfs.com/ipfs/' + this.mintTokenURI.value
                          this.mintNFT(this.state.listIdNFT.length, uri)
                        }}>
                          {/* <div className="form-group"><label>ID NFT</label> <input type="number" placeholder="ID" className="form-control" ref={(input) => { this.mintTokenID = input }} required /></div> */}
                          <div className="form-group"><label>Hash MetaData</label> <input placeholder="Hash" className="form-control" ref={(input) => { this.mintTokenURI = input }} required /></div>
                          <div>
                            <button className="btn btn-sm btn-primary float-right m-t-n-xs" type="submit"><strong>Mint</strong></button>
                          </div>
                        </form>
                      </div>
                      <div className="col-sm-6">
                        <p className="text-center">
                          <a href="#MyNFT"><i className="fa fa-sign-in big-icon" /></a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div id='MyNFT' className="row wrapper border-bottom white-bg page-heading">
              <div className="col-lg-9">
                <h2>My NFT</h2>
              </div>
            </div>
            <div className="wrapper wrapper-content animated fadeInRight">
              <div className="row">
                {elements}
              </div>
              <div class ="">
                {search}
              </div>
            </div>
          </div>
        </div>
      </div>

    );
  }
}

export default isMyNFT;