import './App.css';
import React, { Component } from 'react';
import isMyNFT from './MyNFT';
import {Route} from "react-router-dom";
import ERC20 from './ERC20';
import Market from './Market';

class App extends Component  {
  render() {
    return (
      <div >
        <Route exact path="/" component={Market}  /> 
          <Route exact path="/MyNFT" component={isMyNFT}  /> 
          <Route exact path="/Gold" component={ERC20}  /> 
          <Route exact path="/MarketPlace" component={Market}  /> 
      </div>
    );
  }
}


export default App; 