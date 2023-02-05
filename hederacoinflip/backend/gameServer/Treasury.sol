//SPDX-License-Identifier: Unlicensed

pragma solidity >=0.5.0 <0.9.0;

import "./Permissions.sol";
import "./helpers/HederaTokenService.sol";
import "./helpers/IHederaTokenService.sol";
import "./helpers/ExpiryHelper.sol";
import "./helpers/KeyHelper.sol";
import "./helpers/HederaResponseCodes.sol";

contract Treasury is ExpiryHelper, KeyHelper, HederaTokenService, Permissions {
    // Mapping to store the balances of each address
    mapping(address => uint256) public balances;

    HederaTokenService tokenService;

    // Contract constructor
    constructor() {
        owner = msg.sender;
    }

    // Function to deposit funds into the contract
    function deposit() public payable {
        // Check if the deposit amount is greater than zero
        require(msg.value > 0, "Cannot deposit zero or negative value");

        // Increase the balance of the depositing address
        balances[msg.sender] += msg.value;
    }

    // Function to allow a player to withdraw their winnings via the relay contract which will call this function from the front end page requesting funs
    function withdrawPlayerWinnings() public onlyRelay {
        // Check if the player has a positive balance
        require(
            balances[msg.sender] > 0,
            "Cannot withdraw zero or negative value"
        );

        // Transfer the balance to the player
        address payable sender = payable(msg.sender);
        sender.transfer(balances[sender]);

        // Set the balance of the player to zero
        balances[sender] = 0;
    }

    // Function to allow the owner to withdraw funds from the contract
    function withdraw(address payable _recipient, uint256 _amount)
        public
        onlyRelay
        onlyOwner
    {
        // Check if the caller is the owner of the contract
        require(msg.sender == owner, "Only owner can initiate a withdrawal");

        // Check if the withdrawal amount is greater than zero
        require(_amount > 0, "Withdrawal amount must be greater than 0");

        // Check if the transaction to the recipient is successful
        require(_recipient.send(_amount), "Transaction failed");

        // Decrease the balance of the owner by the withdrawal amount
        balances[msg.sender] -= _amount;
    }

    // Function to retrieve the balance of a given account
    function getBalance(address account) public view returns (uint256) {
        return balances[account];
    }
}

//NFT creator Contract. This contract is used to create NFTs and mint them. Only the Owner and the Relay can call this contract function

contract NFTCreator is
    ExpiryHelper,
    KeyHelper,
    HederaTokenService,
    Permissions
{
    function createNft(
        string memory name,
        string memory symbol,
        string memory memo,
        int64 maxSupply,
        uint32 autoRenewPeriod
    ) external payable onlyOwner onlyRelay returns (address) {
        IHederaTokenService.TokenKey[]
            memory keys = new IHederaTokenService.TokenKey[](1);
        // Set this contract as supply
        keys[0] = getSingleKey(
            KeyType.SUPPLY,
            KeyValueType.CONTRACT_ID,
            address(this)
        );

        IHederaTokenService.HederaToken memory token;
        token.name = name;
        token.symbol = symbol;
        token.memo = memo;
        token.treasury = address(this);
        token.tokenSupplyType = true; // set supply to FINITE
        token.maxSupply = maxSupply;
        token.tokenKeys = keys;
        token.freezeDefault = false;
        token.expiry = createAutoRenewExpiry(address(this), autoRenewPeriod); // Contract automatically renew by himself

        (int256 responseCode, address createdToken) = HederaTokenService
            .createNonFungibleToken(token);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            //revert("Failed to create non-fungible token");
        }
        return createdToken;
    }

    function mintNft(address token, bytes[] memory metadata)
        external
        returns (int64)
    {
        (int256 response, , int64[] memory serial) = HederaTokenService
            .mintToken(token, 0, metadata);

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Failed to mint non-fungible token");
        }

        return serial[0];
    }

    function transferNft(
        address token,
        address receiver,
        int64 serial
    ) external onlyOwner onlyRelay returns (int256) {
        HederaTokenService.associateToken(receiver, token);
        int256 response = HederaTokenService.transferNFT(
            token,
            address(this),
            receiver,
            serial
        );

        if (response != HederaResponseCodes.SUCCESS) {
            revert("Failed to transfer non-fungible token");
        }

        return response;
    }
}
