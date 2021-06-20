import './App.css';
import React, { Component } from 'react';
import isMyNFT from './MyNFT';
import {Route} from "react-router-dom";
import ERC20 from './ERC20';
import Market from './Market';
import WriteJson from './writeJson.js';

class App extends Component  {
    
  render() {
    const addFile = async (fileName, filePath) => {
        const file = fs.readFileSync(filePath);
        const fileAdded = ipfs.add({path: fileName, content: file})
        const fileHash = (await fileAdded).cid;
    
        return fileHash;
    }
    
    const writeJson = async (name,description,uriImg) =>{
        var obj = {
            description: "",
            image:"",
            name:""
        }
        obj.name =name;
        obj.description = description;
        obj.image = uriImg;
    
        fs.writeFile ("input.json", JSON.stringify(obj), function(err) {
            if (err) throw err;
           
            }
        );
    }
    return (
      <div >
        <Route exact path="/" component={Market}  /> 
          <Route exact path="/MyNFT" component={isMyNFT}  /> 
          <Route exact path="/Gold" component={ERC20}  /> 
          <Route exact path="/MarketPlace" component={Market}  /> 
          <Route exact path="/WriteJson" component={WriteJson}  /> 
      </div>
    );
  }
}


export default App; 