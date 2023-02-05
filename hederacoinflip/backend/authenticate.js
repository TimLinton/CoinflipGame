const { AccountId, PrivateKey, PublicKey } = require("@hashgraph/sdk");

require("node-fetch");
require("dotenv").config();

const dotenv = require("dotenv");

const result = dotenv.config({
  path: "/home/goodchoice/Documents/Website2/hederacoinflip/backend/.env",
});

if (result.error) {
  throw result.error;
}
const operatorAcc = AccountId.fromString(process.env.OPERATOR_ID);
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_KEY);

console.log(result.parsed);

const sendAuth = () => {
  let payload = {
    url: "localhost",
    data: {
      token: "fufhr9e84hf9w8fehw9e8fhwo9e8fw938fw3o98fhjw3of",
    },
  };

  const bytes = new Uint8Array(Buffer.from(JSON.stringify(payload)));
  const signature = operatorKey.sign(bytes);

  return {
    serverSignature: signature,
    serverSigningAccount: operatorAcc,
  };
};

const receiveAuth = async (signingAccount, res) => {
  const publicKey = operatorKey.publicKey;
  const url =
    "https://testnet.mirrornode.hedera.com/api/v1/accounts/" + signingAccount;

  const accountInfoResponse = await fetch(url, { method: "GET" });

  if (accountInfoResponse.ok) {
    let data = await accountInfoResponse.json();

    if (!res.signedPayload) return;

    const serverSigArr = Object.values(res.signedPayload.serverSignature);
    const serverSigBuffer = Object.values(serverSigArr);

    const userSigArr = Object.values(res.userSignature);
    const userSigBuffer = Buffer.from(userSigArr);

    let server_key_verified = verifyData(
      res.signedPayload.originalPayload,
      publicKey.toString(),
      serverSigBuffer
    );
    let user_key_verified = verifyData(
      res.signedPayload,
      data.key.key,
      userSigBuffer
    );

    if (server_key_verified && user_key_verified) {
      return "Authentication successful";
    } else {
      return "Authentication failed";
    }
  } else {
    alert("Error getting public Key");
  }
};




const verifyData = (_data, _publicKey, _signature) => {
  const pubKey = PublicKey.fromString(_publicKey);
  let bytes = new Uint8Array(Buffer.from(JSON.stringify(_data)));
  let signatureV = new Uint8Array(Buffer.from(_signature));
  let verify = pubKey.verify(bytes, signatureV);
  return verify;
};

module.exports = { sendAuth, receiveAuth };
