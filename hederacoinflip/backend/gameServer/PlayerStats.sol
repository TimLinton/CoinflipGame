//SPDX-License-Identifier: UNLICENSED

pragma solidity >=0.7.0 <0.9.0;

//log player stats from events relayed from the game contract
//allow player to see stats
//export receipt to csv on request from player
//receive states from the game contract and log them to the blockchain
// stats are organized by player address and game id
//Stats are sent to the Logger contract from the game JS file

contract PlayerStats {
    //variables

    uint256 public gameID;
    uint256 public gamesCount = 0;
    mapping(address => Player) public players;
    mapping(bytes32 => Game) public games;
    struct Player {
        address playerAddress;
        bool gameWonByPlayer;
        string playerGuess;
        string actualResult;
        uint256 betAmount;
        uint256 gamesPlayed;
        bytes32 accessToken;
        bool isGameActive;
        uint256 gameID;
    }

    event LogPlayerData(
        address indexed playerAddress,
        bool gameWonByPlayer,
        string playerGuess,
        string actualResult,
        uint256 betAmount,
        uint256 gamesPlayed,
        bytes32 accessToken,
        uint256 gameID,
        bool isGameActive
    );

    function logPlayerData(
        address _playerAddress,
        bool _gameWonByPlayer,
        string memory _playerGuess,
        string memory _actualResult,
        uint256 _betAmount,
        uint256 _gamesPlayed,
        bytes32 _accessToken,
        bool _isGameActive
    ) public {
        //update player data
        gamesCount++;
        gameID = gamesCount;

        Player storage player = players[_playerAddress];
        player.gameWonByPlayer = _gameWonByPlayer;
        player.playerGuess = _playerGuess;
        player.actualResult = _actualResult;
        player.betAmount = _betAmount;
        player.gamesPlayed = _gamesPlayed;
        player.accessToken = _accessToken;
        player.isGameActive = _isGameActive;
        player.gameID = gamesCount;

        emit LogPlayerData(
            _playerAddress,
            _gameWonByPlayer,
            _playerGuess,
            _actualResult,
            _betAmount,
            _gamesPlayed,
            _accessToken,
            gamesCount,
            _isGameActive
        );
    }

    struct Game {
        uint256 gameID;
        string actualResult;
        uint256 totalGamesPlayed;
        uint256 totalHbarWagered;
        uint256 totalHbarWon;
    }
    event LogGameData(
        uint256 indexed gameID,
        string actualResult,
        uint256 totalGamesPlayed,
        uint256 totalHbarWagered,
        uint256 totalHbarWon
    );

    function logGameData(
        uint256 _gameID,
        string memory _actualResult,
        uint256 _totalGamesPlayed,
        uint256 _totalHbarWagered,
        uint256 _totalHbarWon
    ) public {
        //update game data
        Game storage game = games[bytes32(_gameID)];
        game.actualResult = _actualResult;
        game.totalGamesPlayed = _totalGamesPlayed;
        game.totalHbarWagered = _totalHbarWagered;
        game.totalHbarWon = _totalHbarWon;

        emit LogGameData(
            _gameID,
            _actualResult,
            _totalGamesPlayed,
            _totalHbarWagered,
            _totalHbarWon
        );
    }

    //verify that the player won a game and has an amount to withdraw above 0 as a bool
    function isAuthorized() public view returns (bool) {
        if (players[msg.sender].gameWonByPlayer == true) {
            return true;
        } else {
            return false;
        }
    }

    //get gameID
    function getGameID() public view returns (uint256) {
        return gameID;
    }
}
