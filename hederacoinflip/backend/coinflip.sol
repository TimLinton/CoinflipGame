// SPDX-License-Identifier: Apache-2.0

pragma solidity >=0.7.0 <0.9.0;

import "./helpers/HederaTokenService.sol";
import "./helpers/ExpiryHelper.sol";
import "./helpers/HederaResponseCodes.sol";
import "./helpers/IHederaTokenService.sol";
import "./helpers/KeyHelper.sol";
import "./helpers/FeeHelper.sol";

contract CoinFlip {
    bool public inProgress = false;
    address payable[] public players;
    address owner;
    bytes32 name = "CoinFlip"; // Initialize variable with a default value
    mapping(address => Player) public playerInfo;
    mapping(address => Game) public games;
    uint256 public totalSupply = 0; // Initialize variable with a default value
    struct Player {
        //tracks the player information organized by the player address
        address playerAddress;
        bool gameWonByPlayer;
        string playerGuess;
        string actualResult;
        uint256 betAmount;
        uint256 gamesPlayed;
        bytes32 accessToken;
    }

    //mapping for Game struct
    struct Game {
        //tracks the game information overall for the contract indexed by the player address
        string actualResult;
        uint256 totalGamesPlayed;
        uint256 totalHbarWagered;
        uint256 totalHbarWon;
    }

    constructor() {
        owner = msg.sender;
    }

    receive() external payable {}

    fallback() external payable {}

    function updatePlayerInfo(
        address _player,
        bool _gameWonByPlayer,
        string memory _playerGuess,
        string memory _actualResult,
        uint256 _betAmount,
        bytes32 _accessToken
    ) public {
        playerInfo[_player].playerAddress = _player;
        playerInfo[_player].gameWonByPlayer = _gameWonByPlayer;
        playerInfo[_player].playerGuess = _playerGuess;
        playerInfo[_player].actualResult = _actualResult;
        playerInfo[_player].betAmount = _betAmount;
        playerInfo[_player].accessToken = _accessToken;
        playerInfo[_player].gamesPlayed++;
    }

    function updateGameInfo(
        address _player,
        string memory _actualResult,
        uint256 _totalGamesPlayed,
        uint256 _totalHbarWagered,
        uint256 _totalHbarWon
    ) public {
        games[_player].actualResult = _actualResult;
        games[_player].totalGamesPlayed = _totalGamesPlayed;
        games[_player].totalHbarWagered = _totalHbarWagered;
        games[_player].totalHbarWon = _totalHbarWon;
    }

    // Return the game information for the specified player
    function getGameInfo(address _player) public view returns (Game memory) {
        return games[_player];
    }

    // Return the player information for the specified player
    function getPlayerInfo(address _player)
        public
        view
        returns (Player memory)
    {
        return playerInfo[_player];
    }

    function getGamesPlayed(address _player) public view returns (uint256) {
        // Return the number of games played by the specified player
        return playerInfo[_player].gamesPlayed;
    }

    function startGame(
        bool gameInProgress,
        address _player,
        string memory _playerGuess,
        uint256 _betAmount
    ) public {
        require(!inProgress, "Another function is already executing");
        inProgress = true; // acquire lock
        require(!gameInProgress, "Game already in progress");
        gameInProgress = true;
        playerInfo[_player].playerGuess = _playerGuess;
        playerInfo[_player].betAmount = _betAmount;
        playerInfo[_player].gamesPlayed++;
        inProgress = false; // release lock
    }

    //============================================
    // GETTING HBAR FROM THE CONTRACT
    //============================================
    function transferHbar(address payable _receiverAddress, uint256 _amount)
        public
        onlyOwner
    {
        _receiverAddress.transfer(_amount);
    }

    function withdrawWinnings(address payable _player) public payable {
        require(
            playerInfo[_player].gameWonByPlayer,
            "Player did not win the game"
        );

        require(
            playerInfo[_player].betAmount <= address(this).balance,
            "Insufficient funds in contract"
        );

        // Transfer the winnings to the player
        _player.transfer(playerInfo[_player].betAmount);

        // Update the game information for certain player
        games[_player].totalHbarWon += playerInfo[_player].betAmount;
        games[_player].totalHbarWagered += playerInfo[_player].betAmount;
        games[_player].totalGamesPlayed++;
    }

    //============================================
    // CHECKING THE HBAR BALANCE OF THE CONTRACT
    //============================================
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    //permission functions

    function changeName(bytes32 newName) public onlyOwner {
        // Only the owner can alter the name.
        // We compare the contract based on its
        // address which can be retrieved by
        // explicit conversion to address.
        if (msg.sender == address(owner)) name = newName;
    }

    //Permission Modifiers

    modifier preventReentrancy() {
        require(!inProgress, "Contract is already in progress");
        inProgress = true;
        _;
        inProgress = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    modifier notOwner() {
        require(msg.sender != owner);
        _;
    }
}


