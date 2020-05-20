const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const path = require("path");
const Web3 = require("web3");
const DIDDocumentFactory = require("./build/contracts/DIDDocumentFactory.json");
const buildingFactory = require("./build/contracts/buildingFactory.json");
server.use(bodyParser.json());

var web3 = new Web3("http://localhost:7545");
var dFac = new web3.eth.Contract(
  DIDDocumentFactory.abi,
  "0xb218f106816DC984e07d788C58A377c036507b39"
);
var bFac = new web3.eth.Contract(
  buildingFactory.abi,
   "0xDd8B5dAFfE006e4C60965c97c2B02943335416A3"
);

async function getHigherLower(time,low,high){
    if (high-low==1) return [high,low];
    let mid = Math.floor((low+high)/2);
    let midBlock = await web3.eth.getBlock(mid);
    let midTime = midBlock.timestamp;
    // console.log(midTime);
    if (midTime<time) return await getHigherLower(time,mid,high);
    else if (midTime>time) return await getHigherLower(time,low,mid);
    else return [mid,mid];
}



// web3.eth.getBlock("latest").then(res=>console.log(res.timestamp));
// web3.eth.getBlock(0).then(res=>console.log(res.timestamp));
// getHigherLower(1589894400,0,58).then(console.log)
async function getBuildingFromTime(time, workerAddress){
    let res = await getHigherLower(time,0,62);
    let fromBlock = res[0];
    let arr = [];
    await bFac.getPastEvents("leave",
        {filter:{workerAddress:workerAddress},fromBlock:fromBlock,toBlock:"latest"})
        .then(res=>{
            for (let i of res) arr.push(i.returnValues.buildingAddress);
            return arr;
        });
    return arr; 
}


getBuildingFromTime(1589894400,"0xca6eacb0bd5d2a61c8de2d325112108d7abef0d9").then(console.log)