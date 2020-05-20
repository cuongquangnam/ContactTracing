const Migrations = artifacts.require("Migrations");
const DIDDocumentFactory = artifacts.require("DIDDocumentFactory");
const buildingFactory = artifacts.require("buildingFactory");
module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(DIDDocumentFactory);
  deployer.deploy(buildingFactory)
};

