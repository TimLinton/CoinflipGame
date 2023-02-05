const {
  setGamePhase,
  setPlayerGuess,
  setBetAmount,
  setGameWonByPlayer,
  setActualResult,
  setWalletConnected,
  setReceipt,
  placeBet,
  checkWallet,
  flipCoin,
  runRandomNumber,
  setPlayerId,
  payOut,
} = "./contract";

const startGame = async (_playerChoice, _betAmount) => {
  setGamePhase("Started");

  // Ensure that the wallet is connected and the user has an account ID and access token
  const walletInfo = await checkWallet();
  if (!walletInfo) {
    console.error("Please connect to a wallet before playing the game.");
    return;
  }
  setWalletConnected(walletInfo.isConnected, walletInfo.token);

  // Get the user's account ID and encrypted access token
  // Check that the player has provided a valid choice (heads or tails)
  if (_playerChoice !== "Heads" && _playerChoice !== "Tails") {
    console.error("Invalid choice. Please choose Heads or Tails.");
    return;
  }
  setPlayerGuess(_playerChoice);
  // Place the bet and check for any errors

  // Check that the player has provided a valid bet amount (positive integer)
  if (!Number.isInteger(_betAmount) || _betAmount <= 0) {
    console.error("Invalid bet amount. Please enter a positive integer.");
    return;
  }
  await placeBet(_betAmount);

  // Set the player's guess and the game state

  setBetAmount(_betAmount);
  setGamePhase("Bet Placed");

  // Proceed to the next phase of the game (Coin Flip)
  setGamePhase("Coin Flip");

  // Generate a random result (heads or tails) using the Hedera Hashgraph platform's PrngTransaction
  let coinFlipResult;

  try {
    coinFlipResult = await flipCoin();
  } catch (error) {
    console.error(error);
  }

  // Determine if the player won or lost the game
  if (coinFlipResult === _playerChoice) {
    setGameWonByPlayer(true);
  } else {
    setGameWonByPlayer(false);
  }

  // Proceed to the next phase of the game (Game Over)
  setGamePhase("Game Over");

  // Pay out to the player or the contract based on the outcome of the game
  payOut();
  // recordUserData();
};

module.exports = { startGame };
