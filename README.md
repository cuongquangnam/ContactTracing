# ContactTracing

This is a demo aiming to showcase the use of Decentralized ID and Blockchain to solve the problem of verification and contact tracing of COVID-19 pandemic.

The project uses Truffle + Ganache testnet for testing.

Further development may include creation of QR code representing the URL for the json certificate so that the verifier can check by scanning the code.

## Veritrace

## Installation Guide:
Install Ganache from https://www.trufflesuite.com/ganache

Install Nodejs from https://nodejs.org/en/download/

Install Truffle with npm
`npm install -g truffle`

Install all dependencies 

## Guide: 
1. Clone the repo 
`git clone https://github.com/cuongquangnam/ContactTracing.git`
2. Create a new workspace in ganache for this project and in the configuration under truffle projects select add project and select the file location of your truffle-config folder. The file location should look something like
`C:\Users\sydel\Desktop\did\ContactTracing\truffle-config.js`
3. Open the repo you have cloned in your text editor.
4. Open the terminal in the same working directory.
5. In the terminal,
`truffle compile` 
Notice corresponding json files to the smart contracts appear in build/contracts.
`truffle migrate`
Notice that balance of eth in ganache's first account decreases after contracts are migrated. Clicking on the contract tab of ganache shows which contracts have been deployed and the addresses of the contracts.
`truffle console` brings up the truffle console which will be used to run some functions in the smart contract.
While in `truffle console`,
   - `var myContractBF = await BuildingFactory.deployed()`
This fetches the buildingFactory object deployed in ganache.
   - `myContractBF.set_didfactory("get-did-document-factory-address-from-ganache-tab-contracts")`
Calls set_didfactory function from buildingFactory object.
   - `myContractBF.createBuilding("Building1","100","244")`
`myContractBF.createBuilding("Building2","340","1144")
` 
`myContractBF.createBuilding("Building3","1040","2444")`
   Creates some building objects which will be used for the demo.
   - `myContractBF.getBuildingAt(0)`
`myContractBF.getBuildingAt(1)`
`myContractBF.getBuildingAt(2)`
Returns did of the building created. Should be in the format `'did:ether:f7317f93f6163e0611a6ebface56e36e2ff6ce9c'`
   - `var buildingOne = await Building.at('get-building-address-from-building-1-did')`
This fetches the building 1 object that was created earlier. An example is 
`var buildingOne = await Building.at('0xf7317f93f6163e0611a6ebface56e36e2ff6ce9c')`
   - `buildingOne.set_companyOwner("get-random-address-account-to-be-owners-address")`
For the companyOwner's address select a random address from the ganache accounts tab. An example would be `buildingOne.set_companyOwner("did:ether:0x9416a4Fc66b90d72C3697cb06edeAd7774A74a3a")` where `0x9416a4Fc66b90d72C3697cb06edeAd7774A74a3a` is the random address selected to be the owner's address.
6. Next we edit the code with the new addresses and private keys we have obtained.
   - change the `DIDDocumentFactory.abi` and `buildingFactory.abi` address in `server.js` which can be obtained from the contracts tab in ganache. For example, both take the format of `0x982993cCa0B474070c652e8363bD7e16A962613E`
   - change the `privateKey` and `accountAddr` fields in `server.js` to the private key corresponding to the companyOwner's address and the company owner's address. The private key of the account can be found in ganache's account tab by clicking on the key icon on the rightmostside of the account address. An example is `var privateKey = "7f155baaba59074655bceb20c21f6d1ce835b00a7c0b0ff3797c6f56d52bfa8c";` 
`var accountAddr = "0x9416a4Fc66b90d72C3697cb06edeAd7774A74a3a";`
    - change all the `buildingAddress` in `files/scriptVerify.js` with the addresses obtained earlier. For example `buildingAddress = 0xf7317f93f6163e0611a6ebface56e36e2ff6ce9c`
    - change all the displayed address in 'verify.html' with the addresses obtained earlier. For example `did:ether:0xf7317f93f6163e0611a6ebface56e36e2ff6ce9c`
7. Add a new terminal and do `node server`
8. Access `localhost:3000/sign.html` on your preferred browser (should be best if on Chrome)
9. Select a random account address from the ganache accounts tab to be a worker's address and replace it with workerDID in the following format. Replace companyOwnerDID with the previously selected companyOwner account from ganache. 
`{"workerDID":"did:ether:0x767fa9Fca86f8326e273f98506ad3B57893F6B4c","companyOwnerDID":"did:ether:0x9416a4Fc66b90d72C3697cb06edeAd7774A74a3a"}`
Use the private key of the companyOwner. The private key of the account can be found in ganache's account tab by clicking on the key icon on the rightmostside of the account address. Private key has 64 characters, example:
`E9873D79C6D87DC0FB6A5778633389_SAMPLE_PRIVATE_KEY_DO_NOT_IMPORT_F4453213303DA61F20BD67FC233AA33262`
Press submit query. 
The response will be in the following format.
`{"workerDID":"did:ether:0x767fa9Fca86f8326e273f98506ad3B57893F6B4c","companyOwnerDID":"did:ether:0x9416a4Fc66b90d72C3697cb06edeAd7774A74a3a","signature":"0xa81da85a0f5e6fadb4bac943485e3281f01d90c12a2b3266cd8ba2e44836973e237f1b50d35515d50e3b31435ec4ad61b95aa17bd7310994c52c6e55fc8946931c"}`
10. Copy and paste the response into the verify tab of the browser and select the building that the user would like to enter.

## Supported Features
1. User is able to enter the buildings that the companyOwner owns when he presents (1) a valid response for the building selected along with (2) the building number in `verify.html`.
2. User is denied entry for invalid response in `verify.html`.
3. User is not able to enter buildings twice. ie. the building must leave the building before being able to enter the same building or another building.
4. Do contact tracing by using the worker's did, for example `did:ether:0x767fa9Fca86f8326e273f98506ad3B57893F6B4c` or building's did, for example `did:ether:0xf7317f93f6163e0611a6ebface56e36e2ff6ce9c` along with an input timeframe to retrieve buildings associated with the worker's did and workers associated with the building's did in a specific timeframe respectively.

## FAQ
1. Unable to see selection of date in firefox.
A: Please use chrome.
