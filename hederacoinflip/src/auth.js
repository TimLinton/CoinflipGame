import { HashConnect } from "hashconnect";

const fetch = require("node-fetch");

let hashconnect = new HashConnect();

let appMetadata = {
  name: "coinflip",
  description: "a coinflip game with 2% fee",
  icon: "",
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
    authenticateUser();
  });
  return initData;
};

export const authenticateUser = async () => {
  const payload = {
    url: "localhost",
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
};

// This code is used to transfer HBAR from the user's account to the topic's account.

// export const transferHbar = async (_playerAddr, _hbarWon) => {
//   const transfer = hashconnect.transfer(
//     JSON.parse(window.localStorage.hashconnectData).topic,
//     _playerAddr,
//     _hbarWon
//   );
// };

export const disconnectWallet = async () => {
  const disconnect = hashconnect.disconnect(
    JSON.parse(window.localStorage.hashconnectData).topic
  );

  await disconnect;

  const accountId = document.getElementById("accountid");
  accountId.innerHTML = accountId[0];

  if (!accountId[0]) {
    accountId.innerHTML = "Disconnected Wallet";
  }

  console.log(accountId);
  console.log("accountId");

  console.log("wallet disconnected");
};
