const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const path = require("path");
const Web3 = require("web3");
// const { Image } = require("image-js");
const DIDDocumentFactory = require("./build/contracts/DIDDocumentFactory.json");
const buildingFactory = require("./build/contracts/buildingFactory.json");
const Building = require("./build/contracts/Building.json");
server.use(bodyParser.json());

server.use(express.static("files"));
var web3 = new Web3("http://localhost:7545");
var dFac = new web3.eth.Contract(
  DIDDocumentFactory.abi,
  "DID-DOCUMENT-FACTORY-ADDRESS"
);
var bFac = new web3.eth.Contract(
  buildingFactory.abi,
  "BUILDING-FACTORY-ADDRESS"
);
var privateKey =
  "PRIVATE-KEY-OF-A-RANDOM-ACCOUNT-ON-GANACHE(CAN BE THE FIRST ONE)";
var accountAddr = "PUBLIC-ADDRESS-OF-ABOVE-PRIVATE-KEY";
async function getHigherLower(time, low, high) {
  if (high - low == 1) return [high, low];
  let mid = Math.floor((low + high) / 2);
  let midBlock = await web3.eth.getBlock(mid);
  let midTime = midBlock.timestamp;
  // console.log(midTime);
  if (midTime < time) return await getHigherLower(time, mid, high);
  else if (midTime > time) return await getHigherLower(time, low, mid);
  else return [mid, mid];
}

// web3.eth.getBlock("latest").then(res=>console.log(res.timestamp));
// web3.eth.getBlock(0).then(res=>console.log(res.timestamp));
// getHigherLower(1589894400,0,58).then(console.log)
async function getBuildingIn(workerAddress, startTime, endTime) {
  let latest = await web3.eth.getBlock("latest");
  let res = await getHigherLower(startTime, 0, latest.number);
  let fromBlock = res[0];
  console.log(fromBlock);
  let toBlock;
  if (endTime < latest.timestamp) {
    res = await getHigherLower(endTime, 0, latest.number);
    toBlock = res[1];
  } else toBlock = latest.number;
  console.log(toBlock);
  let arr1 = [];
  let arr2 = [];
  await bFac
    .getPastEvents("enter", {
      filter: { workerAddress: workerAddress },
      fromBlock: fromBlock,
      toBlock: toBlock,
    })
    .then(async (res) => {
      for (let i of res) {
        arr1.push(i.returnValues.buildingAddress);
        let block = await web3.eth.getBlock(i.blockNumber);
        let time = new Date(block.timestamp*1000+ 8*3600*1000);
        arr2.push(time);
      }
    });
  return {
      address:arr1,
      time:arr2
  };
}

async function getWorkerIn(buildingAddress, startTime, endTime) {
  let latest = await web3.eth.getBlock("latest");
  let res = await getHigherLower(startTime, 0, latest.number);
  let fromBlock = res[0];
  console.log(fromBlock);
  let toBlock;
  if (endTime < latest.timestamp) {
    res = await getHigherLower(endTime, 0, latest.number);
    toBlock = res[1];
  } else toBlock = latest.number;
  console.log(toBlock);
  console.log(buildingAddress);
  let arr1 = [];
  let arr2 = [];
  await bFac
    .getPastEvents("enter", {
      filter: { buildingAddress: buildingAddress },
      fromBlock: fromBlock,
      toBlock: toBlock,
    })
    .then(async (res) => {
      for (let i of res) {
        arr1.push(i.returnValues.workerAddress);
        let block = await web3.eth.getBlock(i.blockNumber);
        let time = new Date(block.timestamp*1000+ 8*3600*1000);
        arr2.push(time);
      }
    });
  return {
      address:arr1,
      time:arr2
  };
}

server.get("/contactTracing.html", (req, res) => {
  res.sendFile(path.join(__dirname + "/contactTracing.html"));
});

server.get("/verify.html", (req, res) => {
  res.sendFile(path.join(__dirname + "/verify.html"));
});

server.get("/sign.html", (req, res) => {
  res.sendFile(path.join(__dirname + "/sign.html"));
});

server.get("/findByWorker", async (req, res) => {
  //   console.log("aaaaaa");
  workerAddress = req.query.workerAddress;
  startingTime = req.query.startingTime;
  endingTime = req.query.endingTime;
  //   console.log(workerAddress);
  //   console.log(startingTime);
  //   console.log(endingTime);
  let arr = await getBuildingIn(workerAddress, startingTime, endingTime);
  console.log(arr);
  res.send(arr);
});

server.get("/findByBuilding", async (req, res) => {
  //   console.log("aaaaaa");
  buildingAddress = req.query.buildingAddress;
  startingTime = req.query.startingTime;
  endingTime = req.query.endingTime;
  //   console.log(workerAddress);
  //   console.log(startingTime);
  //   console.log(endingTime);
  console.log(startingTime)
  let arr = await getWorkerIn(buildingAddress, startingTime, endingTime);
  console.log(arr);
  res.send(arr);
});

server.get("/enter", async (req, res) => {
  let cert = req.query.cert;
  // console.log(cert);

  var certJSON = JSON.parse(cert);
  let buildingAddress = req.query.buildingAddress;
  let building = new web3.eth.Contract(Building.abi, buildingAddress);
  console.log(buildingAddress);
  // console.log(certJSON)
  let messageJSON = {};
  console.log(certJSON);
  messageJSON["workerDID"] = certJSON.workerDID;
  // console.log("yesssss")
  messageJSON["companyOwnerDID"] = certJSON.companyOwnerDID;
  let message = JSON.stringify(messageJSON);
  // console.log(message)
  let signature = certJSON.signature;
  let pubAddress = web3.eth.accounts.recover(message, signature);
  let DID = "did:ether:" + pubAddress;
  await building.methods
    .check_companyOwner(DID)
    .call()
    .then(async (check) => {
      console.log(check);
      if (check) {
        console.log();
        let workerAddress = await certJSON.workerDID.substring(10);
        console.log(workerAddress);
        console.log(buildingAddress);
        try{
        let tx = await bFac.methods._enter(workerAddress, buildingAddress);
        let signed = await web3.eth.accounts.signTransaction(
          {
            data: tx.encodeABI(),
            to: bFac._address,
            gas: Math.round(
              (await tx.estimateGas({ from: accountAddr })) * 1.5
            ),
          },
          "0x" + privateKey
        );

          await web3.eth.sendSignedTransaction(signed.rawTransaction);
          res.status(200).send("Verified and entered building successfully")
        } catch 
          (err){
            res.status(200).send("You have already entered a building");
          };
      } else res.status(200).send("You are not authorized to work here");
    });
});

server.get("/leave", async (req, res) => {
    let cert = req.query.cert;
    // console.log(cert);
  
    var certJSON = JSON.parse(cert);
    let buildingAddress = req.query.buildingAddress;
    let building = new web3.eth.Contract(Building.abi, buildingAddress);
    console.log(buildingAddress);
    // console.log(certJSON)
    let messageJSON = {};
    console.log(certJSON);
    messageJSON["workerDID"] = certJSON.workerDID;
    // console.log("yesssss")
    messageJSON["companyOwnerDID"] = certJSON.companyOwnerDID;
    let message = JSON.stringify(messageJSON);
    // console.log(message)
    let signature = certJSON.signature;
    let pubAddress = web3.eth.accounts.recover(message, signature);
    let DID = "did:ether:" + pubAddress;
    await building.methods
      .check_companyOwner(DID)
      .call()
      .then(async (check) => {
        console.log(check);
        if (check) {
          console.log();
          let workerAddress = await certJSON.workerDID.substring(10);
          console.log(workerAddress);
          console.log(buildingAddress);
          try{
          let tx = await bFac.methods._leave(workerAddress, buildingAddress);
          let signed = await web3.eth.accounts.signTransaction(
            {
              data: tx.encodeABI(),
              to: bFac._address,
              gas: Math.round(
                (await tx.estimateGas({ from: accountAddr })) * 1.5
              ),
            },
            "0x" + privateKey
          );
  
            await web3.eth.sendSignedTransaction(signed.rawTransaction);
            res.status(200).send("Verified and Left successfully")
          } catch 
            (err){
              res.status(200).send("You have not entered a building");
            };
        } else res.status(200).send("The cert is not correct");
      });
  });

server.get("/getsignature", async (req, res,next) => {
  console.log("a");
  let upload = req.query.upload;
  let privatekey = req.query.privatekey;
  console.log(upload);
  let sign = await web3.eth.accounts.sign(upload, privatekey);
  let signature = sign.signature;
  let cert =
    upload.substring(0, upload.length - 1) +
    ',"signature":"' +
    signature +
    '"}';
  console.log(cert);
  res.send(cert);
});
server.listen(3000, function () {
  console.log("Server listen on port 3000");
});

// getBuildingFromTime(1589894400,"0xca6eacb0bd5d2a61c8de2d325112108d7abef0d9").then(console.log)
// const jsQR = require("jsqr")
//  Image.load('download.png').then(
// (newImage)=>{const code = jsQR(newImage,200,200)
// console.log(code)})
