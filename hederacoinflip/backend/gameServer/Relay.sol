//SPDX-License-Identifier: Unlicensed
pragma solidity ^0.8.0;

import "./Permissions.sol";
import "./Treasury.sol";
import "./PlayerStats.sol";

contract Relay {
    Treasury public treasury;
    Permissions public permissions;
    PlayerStats public playerStats;
    uint256 gameId;

    constructor() {}

    //get the contract ID codes for treasury, permissions and playerstats

    function setContracts(
        address _treasury,
        address _permissions,
        address _playerStats
    ) public {
        treasury = Treasury(_treasury);
        permissions = Permissions(_permissions);
        playerStats = PlayerStats(_playerStats);
    }

    function requestPlayerWithdrawal(address playerAddress, uint256 amount)
        public
    {
        require(
            playerStats.isAuthorized(),
            "Player is not authorized to make a withdrawal"
        );
        require(
            treasury.getBalance(playerAddress) >= amount,
            "Insufficient balance in Treasury"
        );

        treasury.withdrawPlayerWinnings();
    }

    function relayAllData(
        address _playerAddress,
        bool _gameWonByPlayer,
        string memory _playerGuess,
        string memory _actualResult,
        uint256 _betAmount,
        uint256 _gamesPlayed,
        bytes32 _accessToken,
        uint256 _totalGamesPlayed,
        uint256 _totalHbarWagered,
        uint256 _totalHbarWon
    ) public {
        if (bytes(_actualResult).length > 0 && _betAmount > 0) {
            bool isGameActive = false;
            relayPlayerData(
                _playerAddress,
                _gameWonByPlayer,
                _playerGuess,
                _actualResult,
                _betAmount,
                _gamesPlayed,
                _accessToken,
                isGameActive
            );
            relayGameData(
                gameId,
                _actualResult,
                _totalGamesPlayed,
                _totalHbarWagered,
                _totalHbarWon
            );
        }
        //calculate and get the gameID
    }

    function relayPlayerData(
        address _playerAddress,
        bool _gameWonByPlayer,
        string memory _playerGuess,
        string memory _actualResult,
        uint256 _betAmount,
        uint256 _gamesPlayed,
        bytes32 _accessToken,
        bool _isGameActive
    ) public {
        playerStats.logPlayerData(
            _playerAddress,
            _gameWonByPlayer,
            _playerGuess,
            _actualResult,
            _betAmount,
            _gamesPlayed,
            _accessToken,
            _isGameActive
        );
    }

    function relayGameData(
        uint256 _gameId,
        string memory _actualResult,
        uint256 _totalGamesPlayed,
        uint256 _totalHbarWagered,
        uint256 _totalHbarWon
    ) public {
        playerStats.logGameData(
            _gameId,
            _actualResult,
            _totalGamesPlayed,
            _totalHbarWagered,
            _totalHbarWon
        );
    }
}
