const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const path = require("path");
const Web3 = require("web3");
const { Image } = require("image-js");
const DIDDocumentFactory = require("./build/contracts/DIDDocumentFactory.json");
const buildingFactory = require("./build/contracts/buildingFactory.json");
const Building = require("./build/contracts/Building.json");
server.use(bodyParser.json());

server.use(express.static("files"));
var web3 = new Web3("http://localhost:7545");
var dFac = new web3.eth.Contract(
  DIDDocumentFactory.abi,
  "0x9EaDd47e64599e3cf454Bee5e147e04Fc3071813"
);
var bFac = new web3.eth.Contract(
  buildingFactory.abi,
  "0xEF6d739c57CA17902961dAF5771ba28ddd8cc108"
);
var privateKey =
  "8e72ff3d3243bd5684b34bcb2d7b40e02b859506bbfe82c96814c9d501805a00";
var accountAddr = "0x756EE3bDa36f890A7eec6ad472971875fE52101c";
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
  let arr = [];
  await bFac
    .getPastEvents("enter", {
      filter: { workerAddress: workerAddress },
      fromBlock: fromBlock,
      toBlock: toBlock,
    })
    .then((res) => {
      for (let i of res) {
        arr.push(i.returnValues.buildingAddress);
      }
    });
  return arr;
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
  let arr = [];
  await bFac
    .getPastEvents("enter", {
      filter: { buildingAddress: buildingAddress },
      fromBlock: fromBlock,
      toBlock: toBlock,
    })
    .then((res) => {
      for (let i of res) {
        arr.push(i.returnValues.workerAddress);
      }
    });
  return arr;
}

server.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/index.html"));
});

server.get("/enterLeave", (req, res) => {
  res.sendFile(path.join(__dirname + "/verify.html"));
});

server.get("/sign", (req, res) => {
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
          res.status(200).send("Successfully")
        } catch 
          (err){
            res.status(200).send("You are entering another building");
          };
      } else res.status(200).send("You are not working here");
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
    let DID = "did:ether:" + pubAddress.substring(2);
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
            res.status(200).send("Successfully")
          } catch 
            (err){
              res.status(200).send("You are in another building");
            };
        } else res.status(200).send("You are not working here");
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
