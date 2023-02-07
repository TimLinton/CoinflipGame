const fs = require("fs");
const fetch = require("node-fetch");
const {
  AccountId,
  PrivateKey,
  Client,
  AccountBalanceQuery,
  ContractCreateFlow,
  ContractUpdateTransaction,
} = require("@hashgraph/sdk");
require("dotenv").config();

const permissionsBytecode = fs.readFileSync(
  "/home/goodchoice/Documents/Website2/hederacoinflip/backend/gameServer/helpers/Permissions_sol_Permissions.bin"
);
const treasuryBytecode = fs.readFileSync(
  "/home/goodchoice/Documents/Website2/hederacoinflip/backend/gameServer/helpers/Treasury_sol_Treasury.bin"
);

const relayBytecode = fs.readFileSync(
  "/home/goodchoice/Documents/Website2/hederacoinflip/backend/gameServer/helpers/Relay_sol_Relay.bin"
);

const playerStatsBytecode = fs.readFileSync(
  "/home/goodchoice/Documents/Website2/hederacoinflip/backend/gameServer/helpers/PlayerStats_sol_PlayerStats.bin"
);

const nftCreatorBytecode = fs.readFileSync(
  "/home/goodchoice/Documents/Website2/hederacoinflip/backend/gameServer/helpers/Treasury_sol_NFTCreator.bin"
);

//variables for contract IDs
let permissionContractId;
let treasuryContractId;
let relayContractId;
let playerStatsContractId;
let nftCreatorContractId;

const MAINOWNER = AccountId.fromString(process.env.MY_TEST_ACCOUNT_ID);
const MAINOWNER_KEY = PrivateKey.fromString(process.env.MY_TEST_PRIVATE_KEY);

if (!MAINOWNER_KEY || !MAINOWNER) {
  throw new Error(
    "Operator key and operator ID must be set in the environment"
  );
}

const client = Client.forTestnet().setOperator(MAINOWNER, MAINOWNER_KEY);

// debug
console.log(`OwnerID: ${MAINOWNER}`);
console.log(`OwnerKey:  ${MAINOWNER_KEY}`);

//add all bytecodes to the testnet and get the contract IDs contractcreateflow();

// This function takes an array of numbers, each number corresponds to a function
// in the contractFunctions array. The function will call the functions in the
// contractFunctions array that correspond to the number in the array
// contractsToCreate. For example, if the array contains the number 0, the function
// will call the first function in the contractFunctions array.
// If the array is empty, the function will call all functions in the
// contractFunctions array.

//create an array with contract memo data and the bytecode and update the contractID

const contractMemo = [
  {
    memo: "Permissions Contract",
    bytecode: permissionsBytecode,
    contractId: permissionContractId,
  },
  {
    memo: "Treasury Contract",
    bytecode: treasuryBytecode,
    contractId: treasuryContractId,
  },
  {
    memo: "Relay Contract",
    bytecode: relayBytecode,
    contractId: relayContractId,
  },
  {
    memo: "Player Stats Contract",
    bytecode: playerStatsBytecode,
    contractId: playerStatsContractId,
  },

  {
    memo: "NFT Creator Contract",
    bytecode: nftCreatorBytecode,
    contractId: nftCreatorContractId,
  },
];

//loop through the contractmemory array and create the contracts with contractcreateflow, save the Id for metadata

async function createContracts() {
  try {
    for (let i = 0; i < contractMemo.length; i++) {
      const contractFlow = new ContractCreateFlow()

        .setContractMemo(contractMemo[i].memo)
        .setGas(1000000)
        .setBytecode(contractMemo[i].bytecode)
        .setAdminKey(MAINOWNER_KEY);

      const executeFlow = await contractFlow.execute(client);

      const createRx = await executeFlow.getReceipt(client);

      contractMemo[i].contractId = await createRx.contractId;

      console.log(`Contract ID: ${executeFlow}`);
      console.log("contractId", contractMemo[i].contractId);
    }
  } catch (error) {
    console.error(`Error creating contract: ${error.message}`);
  }
}

//for updating the contracts and metadata after they have already been executed to the hashgraph mainnet or testnet
async function updateSmartContract(operatorAccount, contractId, newBytecode) {
  try {
    for (let i = 0; i < contractMemo.length; i++) {
      // Create a new client instance with the operator account ID and private key
      const client = Client.forTestnet();
      client.setOperator(operatorAccount.id, operatorAccount.privateKey);

      // Update the smart contract on the network
      const transactionId = await new ContractUpdateTransaction()
        .setContractId(contractId)
        .setBytecode(newBytecode)
        .setGas(1000000)
        .execute(client);

      // Get the receipt of the transaction
      const receipt = await transactionId.getReceipt(client);

      // Get the contract ID of the new smart contract instance
      const newContractId = receipt.getContractId();

      console.log(
        `The contract instance has been updated with ID ${newContractId}`
      );

      return newContractId;
    }
  } catch (error) {
    console.error(`Error updating smart contract: ${error.message}`);
  }
}
//if all contracts are created, get the balance of the main owner account and output success message
if (
  (await permissionContractId) &&
  (await treasuryContractId) &&
  (await relayContractId) &&
  (await playerStatsContractId) &&
  (await nftCreatorContractId)
) {
  getBalance();
  console.log("Contracts deployed successfully");
} else {
  console.log("Contracts failed to deploy");
  //list contracts that did not deploy
  if (!(await permissionContractId)) {
    console.log("Permissions contract failed to deploy");
  }
  if (!(await treasuryContractId)) {
    console.log("Treasury contract failed to deploy");
  }
  if (!(await relayContractId)) {
    console.log("Relay contract failed to deploy");
  }
  if (!(await playerStatsContractId)) {
    console.log("Player Stats contract failed to deploy");
  }
  if (!(await nftCreatorContractId)) {
    console.log("NFT Creator contract failed to deploy");
  }
}

async function getBalance() {
  try {
    const accountBalanceQuery = new AccountBalanceQuery().setAccountId(
      MAINOWNER
    );
    const balance = await accountBalanceQuery.execute(client);
    console.log(`Account balance: ${balance}`);
  } catch (error) {
    console.error(`Error getting account balance: ${error.message}`);
  }
}

//Old Code:

// const createallcontracts = async (contractstocreate = []) => {
//   const contractfunctions = [
//     createPermissionContract,
//     createTreasuryContract,
//     createRelayContract,
//     createPlayerStatsContract,
//     createNFTCreatorContract,
//   ];
//   if (contractstocreate.length === 0) {
//     for (const contractfunction of contractfunctions) {
//       await contractfunction();
//     }
//   } else {
//     for (let i = 0; i < contractfunctions.length; i++) {
//       if (contractstocreate.includes(i)) {
//         await contractfunctions[i]();
//       }
//     }
//   }
// };

// async function createPermissionContract() {
//   try {
//     const permissionContractFlow = new ContractCreateFlow()

//       .setContractMemo("Permissions Contract")
//       .setGas(1000000)
//       .setBytecode(permissionsBytecode)
//       .setAdminKey(MAINOWNER_KEY);

//     const executePermissionFlow = await permissionContractFlow.execute(client);

//     const perRx = await executePermissionFlow.getReceipt(client);

//     permissionContractId = await perRx.contractId;

//     console.log(`Permission Contract ID: ${executePermissionFlow}`);
//     console.log("permissionContractId", permissionContractId);
//   } catch (error) {
//     console.error(`Error creating permission contract: ${error.message}`);
//   }
// }

// async function createTreasuryContract() {
//   try {
//     const treasuryContractFlow = new ContractCreateFlow()

//       .setContractMemo("Treasury Contract")
//       .setGas(1000000)
//       .setBytecode(treasuryBytecode)
//       .setAdminKey(MAINOWNER_KEY);

//     const executeTreasuryFlow = await treasuryContractFlow.execute(client);
//     console.log(`Treasury Contract ID: ${executeTreasuryFlow}`);
//     const treasuryRx = await executeTreasuryFlow.getReceipt(client);
//     treasuryContractId = await treasuryRx.contractId;
//     console.log("treasuryContractId", treasuryContractId);
//   } catch (error) {
//     console.error(`Error creating treasury contract: ${error.message}`);
//   }
// }

// async function createPlayerStatsContract() {
//   try {
//     const playerStatsContractFlow = new ContractCreateFlow()

//       .setContractMemo("Player Stats Contract")
//       .setGas(1000000)
//       .setBytecode(playerStatsBytecode)
//       .setAdminKey(MAINOWNER_KEY);

//     const executePlayerStatsFlow = await playerStatsContractFlow.execute(
//       client
//     );
//     console.log(`Player Stats Contract ID: ${executePlayerStatsFlow}`);
//     const playerStatsRx = await executePlayerStatsFlow.getReceipt(client);
//     playerStatsContractId = await playerStatsRx.contractId;
//     console.log("playerStatsContractId", playerStatsContractId);
//   } catch (error) {
//     console.error(`Error creating player stats contract: ${error.message}`);
//   }
// }

// async function createRelayContract() {
//   try {
//     const relayContractFlow = new ContractCreateFlow()

//       .setContractMemo("Relay Contract")
//       .setGas(1000000)
//       .setBytecode(relayBytecode)
//       .setAdminKey(MAINOWNER_KEY);

//     const executeRelayContract = await relayContractFlow.execute(client);
//     console.log(`Relay Contract ID: ${executeRelayContract}`);
//     const relayRx = await executeRelayContract.getReceipt(client);
//     relayContractId = await relayRx.contractId;

//     console.log("relayContractId", relayContractId);
//   } catch (error) {
//     console.error(`Error creating relay contract: ${error.message}`);
//     //elaborate on error

//     if (error.message.includes("CONTRACT_REVERT_EXECUTED")) {
//       console.log("Contract Revert Executed");
//     }
//   }
// }

// async function createNFTCreatorContract() {
//   try {
//     const nftCreatorContractFlow = new ContractCreateFlow()

//       .setContractMemo("NFT Creator Contract")
//       .setGas(1000000)
//       .setBytecode(nftCreatorBytecode)
//       .setAdminKey(MAINOWNER_KEY);

//     const executeNFTCreatorContract = await nftCreatorContractFlow.execute(
//       client
//     );
//     console.log(`NFT Creator Contract ID: ${executeNFTCreatorContract}`);
//     const nftCreatorRx = await executeNFTCreatorContract.getReceipt(client);
//     nftCreatorContractId = await nftCreatorRx.contractId;

//     console.log("nftCreatorContractId", nftCreatorContractId);
//   } catch (error) {
//     console.error(`Error creating NFT Creator contract: ${error.message}`);
//   }
// }
