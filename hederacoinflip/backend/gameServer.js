// const express = require("express");
// const bodyParser = require("body-parser");
// const Web3 = require("web3");

// app.use(bodyParser.json());
// const dotenv = require("dotenv");
// const {
//   Hbar,
//   Client,
//   AccountId,
//   PrivateKey,
//   ContractCreateTransaction,
//   ContractCreateFlow,
// } = require("@hashgraph/sdk");

// // configure dotenv to read the .env file
// dotenv.config();

// // create the express app
// const app = express();

// // use body-parser to parse JSON requests
// app.use(bodyParser.json());

// // initialize the Hedera client
// const operatorId = process.env.OPERATOR_ID;
// const operatorKey = process.env.OPERATOR_KEY;
// const client = new Client({
//   network: "testnet",
//   operator: {
//     account: AccountId.fromString(operatorId),
//     privateKey: PrivateKey.fromString(operatorKey),
//   },
// });

// // create the endpoint to deploy the contract
// app.post("/deploy-contract", async (req, res) => {
//   try {
//     // get the bytecode and constructor parameters from the request body
//     const { bytecode, constructorParams } = req.body;

//     // create the contract deploy transaction
//     const contractDeployTx = new ContractCreateTransaction()
//       .setBytecode(bytecode)
//       .setConstructorParams(constructorParams)
//       .setGas(20000)
//       .setMaxTransactionFee(new Hbar(1));

//     // sign and submit the transaction
//     const receipt = await new ContractCreateFlow(client).execute(
//       contractDeployTx
//     );

//     // return the contract ID to the client
//     res.json({ contractId: receipt.getContractId().toString() });
//   } catch (error) {
//     // return the error to the client
//     res.status(500).json({ error: error.toString() });
//   }
// });

// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:7545"));
// const contractAbi = require("./contractAbi.json");
// const contractAddress = "0x...."; // address of the deployed contract
// const contract = new web3.eth.Contract(contractAbi, contractAddress);

// app.post("/startgame", (req, res) => {
//   const playerGuess = req.body.playerGuess;
//   contract.methods
//     .startGame(playerGuess)
//     .send({ from: "0x...." })
//     .then(() => {
//       res.send({ message: "Transaction successful" });
//     })
//     .catch((error) => {
//       res.status(500).send({ message: "Error starting game", error });
//     });
// });

// app.listen(3000, () => {
//   console.log("Server started on port 3000");
// });
