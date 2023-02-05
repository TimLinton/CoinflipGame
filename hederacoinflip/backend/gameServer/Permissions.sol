//SPDX-License-Identifier: UNLICENSED
//@title A title that should describe the contract/interface
/// @author Tim
/// @notice Permissions contracts defines the roles for the different contracts and users
/// @dev    This contract is used to define the roles for the different contracts and users

pragma solidity ^0.8.0;

contract Permissions {
    mapping(address => uint8) public roles;

    // Defines constants for different roles
    // Players do not have a role and are not assigned a role

    // OWNER ROLE
    uint8 public constant ROLE_OWNER = 1;
    // Owner of Permissions, Treasury, Game Contract, and PlayerStats

    // TREASURER ROLE
    uint8 public constant ROLE_TREASURER = 2;
    // Treasurer handles the treasury contract only

    // OTHER ROLE
    uint8 public constant ROLE_OTHER = 3;
    // Role applied when all other roles removed

    // RELAY ROLE
    uint8 public constant ROLE_RELAY = 4;
    // Contract address for the relay contract

    //owner address
    address public owner;

    //relay contract address
    address public relayContract;

    constructor() {
        owner = msg.sender;
        roles[owner] = ROLE_OWNER;
        roles[relayContract] = ROLE_RELAY;
    }

    //modifier to check if the sender has the owner role
    modifier onlyOwner() {
        require(roles[msg.sender] == ROLE_OWNER, "Sender must have owner role");
        _;
    }

    //modifier to check if the sender has the treasurer role
    modifier onlyTreasurer() {
        require(
            roles[msg.sender] == ROLE_TREASURER,
            "Sender must have treasurer role"
        );
        _;
    }

    //modifier to check if the sender is not the owner
    modifier notOwner() {
        require(msg.sender != owner, "Sender must not be the owner");
        _;
    }

    //Check for valid address and transfer
    modifier validHbarAddress(address _address) {
        require(_address != address(0), "Invalid address");
        _;
    }

    modifier validHbarTransfer(address _from, address _to) {
        require(_from != address(0), "Invalid from address");
        require(_to != address(0), "Invalid to address");
        _;
    }

    //modifier to check if the sender has the relay role
    modifier onlyRelay() {
        require(roles[msg.sender] == ROLE_RELAY, "Sender must have relay role");
        _;
    }

    //modifier to lock two functions so that they are only called once per game instance per player address and
    //to keep track of game instance and ensure both functions are called in the same game instance at the same time to log player stats
    //logGameData and logPlayerStats
    modifier onlyOncePerGameInstance(address _playerAddress) {
        _;
    }

    //function to assign roles
    function assignRole(address _address, uint8 _role) public onlyOwner {
        roles[_address] = _role;
    }

    //function to revoke roles
    function revokeRole(address _address) public onlyOwner {
        roles[_address] = ROLE_OTHER;
    }
}
