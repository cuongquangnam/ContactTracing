pragma solidity >=0.4.22 <0.7.0;

contract DIDDocumentFactory {
    mapping(string => address) public DIDDocumentArray;

    function createDIDDocument(address id) public returns (string memory){
        DIDDocument d = new DIDDocument(id);
        DIDDocumentArray[d.id()] = address(d);
        return d.id();
    }

}

contract DIDDocument {
    string public id; // user did
    struct publicKeyElement {
        string id;
        string Type;
        string owner;
        address ethereumAddress;
    }

    struct authenticationElement{
        string Type;
        string publicKey;
    }

    publicKeyElement[] public publicKey;
    authenticationElement[] public authentication;
    constructor(address newId) public{
        id = string(abi.encodePacked("did:ether:",toAsciiString(newId)));
        publicKeyElement memory p = publicKeyElement({
            id: string(abi.encodePacked(id,"#keys-1")),
            Type: "Secp256k1VerificationKey2018",
            owner: id,
            ethereumAddress: newId
        });

        authenticationElement memory a = authenticationElement({
            Type: "Secp256k1SignatureAuthentication2018",
            publicKey: string(abi.encodePacked(id,"#owner"))
        });

        publicKey.push(p);
        authentication.push(a);
    }
    
    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(40);
        for (uint i = 0; i < 20; i++) {
            byte b = byte(uint8(uint(x) / (2**(8*(19 - i)))));
            byte hi = byte(uint8(b) / 16);
            byte lo = byte(uint8(b) - 16 * uint8(hi));
            s[2*i] = char(hi);
            s[2*i+1] = char(lo);
        }
        return string(s);
    }

    function char(byte b) internal pure returns (byte ) {
        if (uint8(b) < 10) return byte(uint8(b) + 0x30);
        else return byte(uint8(b) + 0x57);
    }
   
}

contract buildingFactory{
    string[] public array_building;
    DIDDocumentFactory public didfactory;

    function createBuilding( string memory newName, string memory newLatitude, string memory newLongitude) public returns(string memory){
        building new_building = new building(newName,newLatitude,newLongitude);
        string memory id = didfactory.createDIDDocument(address(new_building));
        new_building.set_building_DID(id);
        array_building.push(id);
        return id;
    }
    
    function set_didfactory(address x) public{
        didfactory = DIDDocumentFactory(x);
    }

    event arrive (
        address indexed workerAddress,
        address indexed buildingAddress
    );

    event leave (
        address indexed workderAddress,
        address indexed buildingAddress
    );

    function _arrive(address workerAddress, address buildingAddress) public{
        emit arrive(workerAddress,buildingAddress);
    }

    function _leave(address workerAddress, address buildingAddress) public {
        // require(building(buildingAddress).)
        emit leave(workerAddress,buildingAddress);
    }
    
    function getBuildingAt(uint x) public view returns (string memory){
        return array_building[x];
    }
}

contract building {
    
    string public building_DID;
    string public name;
    string public latitude;
    string public longitude;
    // mapping(string=>bool) in; 
    constructor( string memory newName, string memory newLatitude, string memory newLongitude) public{
        name = newName;
        latitude = newLatitude;
        longitude = newLongitude;
    }
    
    function set_building_DID(string memory x) public {
        building_DID = x;
    }

    // function checkIn()
    // mapping(string=> boolean);
}



