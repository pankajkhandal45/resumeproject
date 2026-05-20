// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ResumeRegistry {
    address public admin;

    struct Certificate {
        string hash;
        address issuer;
        uint256 timestamp;
        bool isValid;
    }

    struct Issuer {
        string name;
        address walletAddress;
        bool isRegistered;
    }

    mapping(address => Issuer) public issuers;
    mapping(string => Certificate) public certificates;

    event IssuerRegistered(address issuerAddress, string name);
    event CertificateAdded(string hash, address issuer);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyRegisteredIssuer() {
        require(issuers[msg.sender].isRegistered, "Only registered issuer can perform this action");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    function registerIssuer(address _issuerAddress, string memory _name) public onlyAdmin {
        require(!issuers[_issuerAddress].isRegistered, "Issuer already registered");
        issuers[_issuerAddress] = Issuer(_name, _issuerAddress, true);
        emit IssuerRegistered(_issuerAddress, _name);
    }

    function addCertificateHash(string memory _hash) public onlyRegisteredIssuer {
        require(!certificates[_hash].isValid, "Certificate hash already exists");
        
        certificates[_hash] = Certificate({
            hash: _hash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            isValid: true
        });

        emit CertificateAdded(_hash, msg.sender);
    }

    function verifyCertificate(string memory _hash) public view returns (bool, string memory, uint256) {
        if (!certificates[_hash].isValid) {
            return (false, "", 0);
        }
        
        Certificate memory cert = certificates[_hash];
        Issuer memory issuer = issuers[cert.issuer];
        
        return (true, issuer.name, cert.timestamp);
    }
}
