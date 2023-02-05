const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { sendAuth, receiveAuth } = require("./authenticate");
const { startGame } = require("./startGame");

const app = express();
const port = 8443;
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Server Live");
});

app.get("/sendAuth", (req, res) => {
  console.log("Sending auth");
  const signingData = sendAuth();
  res.send({ signingData });
});

app.post("/getAuth", async (req, res) => {
  const data = req.body;
  const { signingAccount, auth } = data;
  console.log(data);
  const authMessage = await receiveAuth(signingAccount, auth);
  res.send({ authMessage });
  console.log("received auth");
});

app.post("/startgame", async (req, res) => {
  const data = req.body;
  const { playerGuess, betAmount } = data;
  console.log(data);
  startGame(playerGuess, betAmount);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

app.post("/playgame", async (req, res) => {
  // Get the wallet token from the request body
  const { walletToken } = req.body;

  // Perform the authorization check using the receiveAuth function
  const result = await receiveAuth(walletToken, res);

  // If the authorization check was successful, proceed with the game
  if (result === "Authentication successful") {
    //TODO: add run game script
  } else {
    // If the authorization check failed, return an error
    res.status(401).json({ error: "Unauthorized" });
    res.send(401, { error: "Unauthorized" });
  }
});
