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
  FileCreateTransaction,
  FileId,
  ContractFunctionParameters,
  ContractExecuteTransaction,
  ContractCallQuery,
  ContractId,
} = require("@hashgraph/sdk");

const fs = require("fs");

const fetch = require("node-fetch");

const dotenv = require("dotenv");

const result = dotenv.config({
  path: "/home/goodchoice/Documents/Website2/hederacoinflip/backend/.env",
});

if (result.error) {
  throw result.error;
}

console.log(result.parsed);

// const defineAcc = process.env.OPERATOR_ID;
// const defineKey = process.env.OPERATOR_KEY;

const operatorAcc = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

//bytecode in /home/goodchoice/Documents/Website2/hederacoinflip/backend/coinflip_sol_CoinFlip.bin
const byteString = fs.readFileSync(
  "/home/goodchoice/Documents/Website2/hederacoinflip/backend/coinflip_sol_CoinFlip.bin"
);

const client = Client.forTestnet();
client.setOperator(operatorAcc, operatorKey);
// const mainTestNetAcc = process.env.MY_TEST_ACCOUNT_ID;
// const MainTestNetKey = process.env.MY_TEST_PRIVATE_KEY;
let playerId;
let walletAccessToken;

// const playerAcc = process.env.PLAYER_ID;
// const playerKey = process.env.PLAYER_PRIVATE_KEY;

// const treasuryAcc = process.env.TREASURY_ID;
// const treasuryKey = process.env.TREASURY_PRIVATE_KEY;
async function main() {
  //Create the transaction
  const gameContract = new ContractCreateFlow()
    .setGas(1000000)
    .setBytecode(byteString);

  //Sign the transaction with the client operator key and submit to a Hedera network
  const txResponse = await gameContract.execute(client);

  //Get the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  //Get the new contract ID
  const contractId = await receipt.contractId;
  // const contractAddress = contractId.toSolidityAddress();

  console.log("The new contract ID is " + contractId);
  setContractId(contractId);
  // console.log("The new contract address is " + contractAddress);

  //check to make sure the wallet is connected, the wallet has an acount ID, and the wallet has a token'/;
  //return the wallet token if all conditions are met so they can play the game
}

main();

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
  contractIdentity: "",
};
const setGamePhase = (_nextPhase) => {
  let currentPhaseIndex = appState.gamePhase.indexOf(appState.currentPhase);
  let nextPhaseIndex = appState.gamePhase.indexOf(_nextPhase);
  if (nextPhaseIndex > -1 && nextPhaseIndex > currentPhaseIndex) {
    appState.currentPhase = _nextPhase;
  }
};

const setContractId = async (_id) => {
  appState.contractIdentity = _id;
};

const setGameWonByPlayer = async (_isWon) => {
  appState.gameWonByPlayer = _isWon;
};
const setActualResult = async (_result) => {
  appState.actualResult = _result;
};
const contractIdentity = async () => {
  return appState.contractIdentity;
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

playerId = window.hashconnect.walletMetadata.accountIds[0];
// walletAccessToken = window.hashconnect.walletMetadata.accessToken;
// setWalletConnected(true, walletAccessToken);
// setPlayerId(playerId);

const setPlayerId = async (id) => {
  //must be an hbar address 0.0.123456
  if (!id.match(/^[0-9]+\.[0-9]+\.[0-9]+$/)) {
    throw new Error("Invalid input. Only a valid hbar address is allowed.");
  }
  trackPlayer.playerId = id;
};

const setPlayerGuess = async (_guess) => {
  trackPlayer.playerGuess = _guess;
};

const setWalletConnected = (_isConnected, _token) => {
  if (typeof _isConnected !== Boolean) {
    throw new Error("Invalid input. Only a boolean value is allowed.");
  }
  appState.walletConnected = _isConnected;
  trackPlayer.walletConnected = _isConnected;
  trackPlayer.walletAccessToken = _token;
  playerId = window.hashconnect.walletMetadata.accountIds[0];
  walletAccessToken = window.hashconnect.walletMetadata.accessToken;
};

const setReceipt = async (_receipt) => {
  appState.transferReceipt = _receipt;
  trackPlayer.transferReceipt = _receipt;
};

const getWalletToken = () => {
  return trackPlayer.walletAccessToken;
};

const setBetAmount = async (amount) => {
  appState.betAmouont = amount;
};

////////////////
///Global error state object
////////////////
const globalErrorState = {
  hasError: false,
  message: "",
};

// Global error handler function
const handleError = () => {
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
const flipCoin = async () => {
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
//Contract functions
///////////execute the contract onto the hedera blockchain

/////////
//check that the wallets have enough hbar
///////////
const placeBet = async (_betAmount) => {
  try {
    const playerBalance = await client.accountInfo(playerId);
    const contractBalance = await client.accountInfo(appState.contractIdentity);

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
const payOut = async () => {
  let playerTransfer = 0;
  let contractTransfer = 0;
  let accessToken;
  const cid = await contractIdentity();
  if (appState.gameWonByPlayer) {
    accessToken = await getWalletToken();
    //player won so deduct from contract
    playerTransfer = appState.betAmount;
    contractTransfer = -appState.betAmount;
  } else {
    accessToken = await getWalletToken();
    //player lost so deduct from player
    playerTransfer = -appState.betAmount;
    contractTransfer = appState.betAmount;
    //access token is equal to contract
  } //key to allow contract to transfer
  //funds to player
  const transferTx = await new TransferTransaction()
    .addHbarTransfer(playerId, playerTransfer)
    .addHbarTransfer(cid, contractTransfer)
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
    .setContractId(appState.contractIdentity)
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

//solidity functions that create the contract and executue the contract from solidity code in ./coinflip.sol

// const playGameSolidity = async () => {
//   //create the contract
//   const contractCreateTx = new ContractCreateTransaction()
//     .setBytecode(byteString)
//     .setGas(20000)
//     .setNodeAccountIds(["0.0.3"]);

//   const contractCreateFlow = new ContractCreateFlow(contractCreateTx, client);
//   const contractId = contractCreateFlow.execute();

//   //execute a function from the contract
//   const contractExecuteTx = new ContractExecuteTransaction()
//     .setContractId(contractId)
//     .setGas(20000)
//     .setFunction("startGame")
//     .setFunctionParameters({
//       playerGuess: appState.playerGuess,
//       betAmount: appState.betAmount,
//     })
//     .execute(client);
//   const contractExecuteReceipt = await contractExecuteTx.getReceipt(client);
//   console.log("Contract execute receipt: ", contractExecuteReceipt);
// };

//export all functions

module.exports = {
  recordUserData,
  setGamePhase,
  flipCoin,
  runRandomNumber,
  placeBet,
  setPlayerId,
  setBetAmount,
  setPlayerGuess,
  setGameWonByPlayer,
  setActualResult,
  setWalletConnected,
  payOut,
};
