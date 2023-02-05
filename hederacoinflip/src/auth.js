import { HashConnect } from "hashconnect";

const fetch = require("node-fetch");

let hashconnect = new HashConnect();

let appMetadata = {
  name: "coinflip",
  description: "a coinflip game with 2% fee",
  icon: "",
};

// Add a new state variable to track the game state
let gameState = {
  phase: "Started",
  playerChoice: "",
  betAmount: 0,
  gameResult: "",
  walletConnected: false,
  walletToken: "",
  playerId: "",
  transferReceipt: "",
  gameWonByPlayer: false,
  actualResult: "",
};

export const pairHashpack = async () => {
  let initData = await hashconnect.init(appMetadata, "testnet", false);

  hashconnect.foundExtensionEvent.once((walletMetadata) => {
    hashconnect.connectToLocalWallet(initData.pairingString, walletMetadata);
  });

  hashconnect.pairingEvent.once((pairingData) => {
    console.log("wallet paired");
    console.log(pairingData);

    const accountId = document.getElementById("accountid");
    console.log(accountId);
    accountId.innerHTML = pairingData.accountIds[0];
    console.log(accountId.innerHTML);
    gameState.walletConnected = true;
    gameState.walletAccessToken = pairingData.token;
    gameState.playerId = pairingData.accountIds[0];
    authenticateUser();
  });
  return initData;
};

export const authenticateUser = async () => {
  const payload = {
    url: window.location.hostname,
    data: {
      token: "fufhr9e84hf9w8fehw9e8fhwo9e8fw938fw3o98fhjw3of",
    },
  };

  let hashconnectData = JSON.parse(window.localStorage.hashconnectData);
  console.log(hashconnectData);

  const res = await fetch("http://localhost:8443/sendAuth");
  const { signingData } = await res.json();

  const serverSigAsArr = Object.values(signingData.serverSignature);
  const serverSigAsBuffer = Buffer.from(serverSigAsArr);

  let auth = await hashconnect.authenticate(
    hashconnectData.topic,
    hashconnectData.pairingData[0].accountIds[0],
    signingData.serverSigningAccount,
    serverSigAsBuffer,
    payload
  );

  const receiveAuthData = {
    signingAccount: hashconnectData.pairingData[0].accountIds[0],
    auth,
  };

  const res2 = await fetch("http://localhost:8443/getAuth", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(receiveAuthData),
  });

  const { authMessage } = await res2.json();

  console.log(authMessage);
  gameState.phase = "Authenticated";
  console.log(gameState.phase);
};

// Update the game state to reflect that the user has been authenticated

export const disconnectWallet = async () => {
  const disconnect = hashconnect.disconnect(
    JSON.parse(window.localStorage.hashconnectData).topic
  );

  await disconnect;

  // Update the game state to reflect that the wallet has been disconnected
  gameState.walletConnected = false;
  gameState.walletAccessToken = "";
  gameState.playerId = "";
  gameState.phase = "Disconnected";

  console.log("wallet disconnected");
};

//play the game on the front end
export const startGame = async (_playerChoice, _betAmount) => {
  const startGameData = {
    playerGuess: _playerChoice,
    betAmount: _betAmount,
  };

  const res = await fetch("http://localhost:8443/startgame", {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(startGameData),
  });

  const { gameResult } = await res.json();

  console.log(gameResult);
};

//get encrypted private key from hashconnect wallet association in auth.js so the player can sign the transaction
export const getHashconnectWalletTokenAndPlayGame = async () => {
  const hashconnectData = JSON.parse(window.localStorage.hashconnectData);
  let walletToken = hashconnectData.pairingData[0].token;

  const response = await fetch("/api/playgame", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      walletToken,
    }),
  });
};
