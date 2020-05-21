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

contract BuildingFactory{
    string[] public array_building;
    DIDDocumentFactory public didfactory;
    mapping(address=>address) public inBuilding;

    function createBuilding( string memory newName, string memory newLatitude, string memory newLongitude) public returns(string memory){
        Building new_building = new Building(newName,newLatitude,newLongitude);
        string memory id = didfactory.createDIDDocument(address(new_building));
        new_building.set_building_DID(id);
        array_building.push(id);
        return id;
    }
    
    function set_didfactory(address x) public{
        didfactory = DIDDocumentFactory(x);
    }

    event enter (
        address indexed workerAddress,
        address indexed buildingAddress,
        string longitude,
        string latitude
    );

    event leave (
        address indexed workerAddress,
        address indexed buildingAddress,
        string longitude,
        string lattitude
    );

    function _enter(address workerAddress, address buildingAddress) public{
        require(inBuilding[workerAddress]==address(0),
        "You have entered another building");
        Building b = Building(buildingAddress);
        emit enter(workerAddress,buildingAddress,b.longitude(),b.latitude());
        inBuilding[workerAddress] = buildingAddress;
    }

    function _leave(address workerAddress, address buildingAddress) public {
        // require(building(buildingAddress).)
        require(inBuilding[workerAddress]==buildingAddress,
        "You have not entered this building");
        Building b = Building(buildingAddress);
        emit leave(workerAddress,buildingAddress,b.longitude(),b.latitude());
        inBuilding[workerAddress] = address(0);
    }
    
    function getBuildingAt(uint x) public view returns (string memory){
        return array_building[x];
    }
}

contract Building {
    
    string public building_DID;
    string public name;
    string public latitude;
    string public longitude;
    mapping(string=>bool) public companyOwner;
    // mapping(address=>uint) public inBuilding;
    // mapping(string=>bool) in; 
    constructor( string memory newName, string memory newLatitude, string memory newLongitude) public{
        name = newName;
        latitude = newLatitude;
        longitude = newLongitude;
    }
    
    function set_building_DID(string memory x) public {
        building_DID = x;
    }

    function add_company(string memory x) public {
        companyOwner[x] = true;
    }

    function check_companyOwner(string memory x) public view returns (bool) {
        return companyOwner[x];
    } 
    
    function set_companyOwner(string memory x) public {
        companyOwner[x] = true;
    }
    // function check_in_building(address x) public view returns(uint){
    //     return inBuilding[x];
    // }

    // function set_in_building(address x, uint status) public {
    //     inBuilding[x] = status;
    // }
    // function checkIn()
    // mapping(string=> boolean);
}




