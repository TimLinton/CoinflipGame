const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const { sendAuth, receiveAuth } = require("./helpers/authenticate");
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
