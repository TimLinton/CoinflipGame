// const coinflip = require("./coinflip");

const {
  Client,
  PrngTransaction,
  PublicKey,
  PrivateKey,
  TransferTransaction,
  Hbar,
  ContractCreateFlow,
  AccountId,
  ContractCreateTransaction,
  // FileCreateTransaction,
  ContractExecuteTransaction,
} = "@hashgraph/sdk";

const Dotenv = require("dotenv");
Dotenv.config();
const operatorAcc = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);
const bytecode = process.env.BYTECODE;
const client = Client.forTestnet();
client.setOperator(operatorAcc, operatorKey);
// const mainTestNetAcc = process.env.MY_TEST_ACCOUNT_ID;
// const MainTestNetKey = process.env.MY_TEST_PRIVATE_KEY;
let playerId;
let walletAccessToken;

const playerAcc = process.env.PLAYER_ID;
const playerKey = process.env.PLAYER_PRIVATE_KEY;

// const treasuryAcc = process.env.TREASURY_ID;
// const treasuryKey = process.env.TREASURY_PRIVATE_KEY;

//check to make sure the wallet is connected, the wallet has an acount ID, and the wallet has a token
//return the wallet token if all conditions are met so they can play the game

//Grab the account ID and private key of the operator account from the .env file

//Set the operator with the operator ID and operator key

export const checkWallet = () => {
  try {
    if (!window.hashconnect) {
      throw new Error("Cannot connect to wallet");
    }
    if (!window.hashconnect.walletMetadata) {
      throw new Error("Error accessing wallet metadata");
    }
    if (!window.hashconnect.walletMetadata.accountIds) {
      throw new Error("Error accessing account IDs");
    }
    playerId = window.hashconnect.walletMetadata.accountIds[0];
    walletAccessToken = window.hashconnect.walletMetadata.accessToken;
    setWalletConnected(true, walletAccessToken);
    setPlayerId(playerId);
  } catch (error) {
    console.error("Error accessing wallet: ", error.message);
    return error;
  }
};

////////////////////
///App State Functions
///////////////////
const appState = {
  gamePhase: [
    "Started",
    "Bet Placed",
    "Coin Flip",
    "Game Over",
    "PayoutsProcessed",
    "Error",
  ],
  gameWonByPlayer: false,
  actualResult: "",
  walletConnected: false,
  transferReceipt: "",
};
export const setGamePhase = (_nextPhase) => {
  let currentPhaseIndex = appState.gamePhase.indexOf(appState.currentPhase);
  let nextPhaseIndex = appState.gamePhase.indexOf(_nextPhase);
  if (nextPhaseIndex > -1 && nextPhaseIndex > currentPhaseIndex) {
    appState.currentPhase = _nextPhase;
  }
};

export const setGameWonByPlayer = async (_isWon) => {
  appState.gameWonByPlayer = _isWon;
};
export const setActualResult = async (_result) => {
  appState.actualResult = _result;
};

////////////////////
// player State Functions
///////////////////
const trackPlayer = {
  playerId,
  playerGuess: "",
  betAmount: 0,
  walletConnected: false,
  walletAccessToken,
  transferReceipt: "",
};

const setPlayerId = async (id) => {
  //must be an hbar address 0.0.123456
  if (!id.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
    throw new Error("Invalid input. Only a valid hbar address is allowed.");
  }
  trackPlayer.playerId = id;
};

export const setPlayerGuess = async (_guess) => {
  trackPlayer.playerGuess = _guess;
};

export const setWalletConnected = (_isConnected, _token) => {
  if (typeof isConnected !== "boolean") {
    throw new Error("Invalid input. Only a boolean value is allowed.");
  }
  appState.walletConnected = _isConnected;
  trackPlayer.walletConnected = _isConnected;
  trackPlayer.walletAccessToken = _token;
};

export const setReceipt = async (_receipt) => {
  appState.transferReceipt = _receipt;
  trackPlayer.transferReceipt = _receipt;
};

export const getWalletToken = () => {
  return trackPlayer.walletAccessToken;
};

////////////////
///Global error state object
////////////////
const globalErrorState = {
  hasError: false,
  message: "",
};

// Global error handler function
export const handleError = () => {
  if (globalErrorState.hasError) {
    console.log("An error occurred: " + globalErrorState.message);
    setGamePhase("Error");
    globalErrorState.hasError = true;

    // Clear the error state
    globalErrorState.hasError = false;
    globalErrorState.message = "";
  }
};

//output all app and game states to the console
console.log("App State: ", appState.gamePhase);
console.log("Game State: ", appState);

//plays game and follows game phases

//flip the coin
export const flipCoin = async () => {
  const randomNumber = await runRandomNumber();
  if (randomNumber === 1) {
    setActualResult("Heads");
    return "Heads";
  } else {
    setActualResult("Tails");
    return "Tails";
  }
};
///////////
//Blockchain functions
///////////
export const runRandomNumber = async () => {
  try {
    //Create the transaction with range set
    const transaction = await new PrngTransaction()
      //Set the range
      .setRange(1)
      .execute(client);

    //Get the record
    const transactionRecord = await transaction.getRecord(client);

    //Get the number
    const randomNumber = transactionRecord.prngNumber;
    // Set the actual result of the coin flip

    //heads = 1, tails = 0
    return randomNumber;
  } catch (error) {
    console.error(error);
  }
};

///////////
//Contract functions
///////////
const contractCreateTx = new ContractCreateTransaction()
  .setBytecode(bytecode)
  .setGas(20000)
  .setNodeAccountIds(["0.0.3"]);

const contractCreateFlow = new ContractCreateFlow(contractCreateTx, client);
const contractId = contractCreateFlow.execute();

export const setBetAmount = async (amount) => {
  appState.betAmouont = amount;
};

///////////
//check that the wallets have enough hbar
///////////
export const placeBet = async (_betAmount) => {
  try {
    const playerBalance = await client.accountInfo(playerId);
    const contractBalance = await client.accountInfo(contractId);

    if (playerBalance < _betAmount) {
      throw new Error("Insufficient balance to place bet");
    }
    if (contractBalance < _betAmount) {
      throw new Error(
        "Contract does not have sufficient balance to pay out bet"
      );
    }
    appState.betAmount = _betAmount;
  } catch (error) {
    globalErrorState.hasError = true;
    globalErrorState.message = error.message;
    handleError(globalErrorState);
  }
};

///////////
///Transfer funds to the player or the contract based on the outcome of the game
///////////
export const payOut = async () => {
  let playerTransfer = 0;
  let contractTransfer = 0;
  let accessToken;
  if (appState.gameWonByPlayer) {
    //player won so deduct from contract
    playerTransfer = appState.betAmount;
    contractTransfer = -appState.betAmount;
    accessToken = await getWalletToken();
  } else {
    //player lost so deduct from player
    playerTransfer = -appState.betAmount;
    contractTransfer = appState.betAmount;
    accessToken = await getWalletToken(); //access token is equal to contract
  } //key to allow contract to transfer
  //funds to player
  const transferTx = await new TransferTransaction()
    .addHbarTransfer(playerAcc, Hbar.fromTinybars(playerTransfer))
    .addHbarTransfer(contractId, Hbar.fromTinybars(contractTransfer))
    .setAccessToken(accessToken)
    .execute(client);
  const transferReceipt = await transferTx.getReceipt(client);
  console.log("Transfer receipt: ", transferReceipt);
  setReceipt(transferReceipt);
};

///////////
//recording user data to the blockchain after the game is over
///////////

const recordUserData = async () => {
  const recordTx = await new ContractExecuteTransaction()
    .setContractId(contractId)
    .setGas(20000)
    .setFunction("recordUserData")
    .setFunctionParameters({
      playerGuess: appState.playerGuess,
      actualResult: appState.actualResult,
      gameWonByPlayer: appState.gameWonByPlayer,
      betAmount: appState.betAmount,
      transferReceipt: appState.transferReceipt,
    })
    .execute(client);
  const recordReceipt = await recordTx.getReceipt(client);
  console.log("Record receipt: ", recordReceipt);
};

module.export = {
  flipCoin,
  runRandomNumber,
  placeBet,
  setPlayerId,
  setBetAmount,
  setPlayerGuess,
  setGameWonByPlayer,
  setActualResult,
  setGamePhase,
};
