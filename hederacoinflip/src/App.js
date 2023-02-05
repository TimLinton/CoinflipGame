import "./App.css";

import React, { useState } from "react";
// import AppBar from '@mui/material/AppBar';
// import CssBaseline from '@mui/material/CssBaseline';
import Box from "@mui/material/Box";
// import Container from '@mui/material/Container';
// import Toolbar from '@mui/material/Toolbar';
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
import Paper from "@mui/material/Paper";
import {
  pairHashpack,
  authenticateUser,
  disconnectWallet,
  startGame,
  getHashconnectWalletTokenAndPlayGame,
} from "./auth";
// import { startGame } from "./startGame";

function App() {
  const [pairingString, setPairingString] = useState("");
  const [betAmount, setBetAmount] = useState(0);
  const [playerChoice, setPlayerGuess] = useState("");
  const [result, setResult] = useState("");
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAccessToken, setWalletAccessToken] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [transferReceipt, setTransferReceipt] = useState("");
  const [gameWonByPlayer, setGameWonByPlayer] = useState(false);
  const [actualResult, setActualResult] = useState("");
  const [currentPhase, setCurrentPhase] = useState("Started");
  const [gamePhase, setGamePhase] = useState([
    "Started",
    "Bet Placed",
    "Coin Flip",
    "Game Over",
    "PayoutsProcessed",
    "Error",
  ]);

  return (
    <Paper elevation={5} className="middlePaper">
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          component="div"
          sx={{ flexGrow: 1 }}
          className="middleBarText"
        >
          <br />
          <h2>How to Play:</h2>
          <ol>
            <li>Securely Connect Hashpack wallet</li>
            <li>Choose your bet</li>
            <li>Flip the coin to try and double your money!</li>
            <li>All coin flips and results are 100% random.</li>
            <li>Fee of 2% for each flip.</li>
            <li>Flip the coin to try and double your money!</li>
          </ol>
          <Button variant="contained" onClick={pairHashpack}>
            Display Pairing Key
          </Button>
          <br />
          <br />
          <Button variant="contained" onClick={authenticateUser}>
            Connect Wallet
          </Button>
          {/* set pairing string */}
          <br />
          <br />
          <Button
            variant="contained"
            className="playGame"
            onClick={authenticateUser}
          >
            Authenticate User
          </Button>
          <br />
          <br />
          <Button
            variant="contained"
            className="disconnectWallet"
            onClick={disconnectWallet}
          >
            Disconnect Wallet
          </Button>
          <h2>Place your bet</h2>
          <Button variant="contained" onClick={() => setBetAmount(10)}>
            10
          </Button>
          <Button variant="contained" onClick={() => setBetAmount(20)}>
            20
          </Button>
          <Button variant="contained" onClick={() => setBetAmount(30)}>
            30
          </Button>
          <Button variant="contained" onClick={() => setBetAmount(40)}>
            40
          </Button>
          <Button variant="contained" onClick={() => setBetAmount(50)}>
            50
          </Button>
          <Button variant="contained" onClick={() => setBetAmount(100)}>
            100
          </Button>
          <br />
          <br />
          <h2>Pick heads or tails</h2>
          <Button variant="contained" onClick={() => setPlayerGuess("Heads")}>
            Heads
          </Button>
          <Button variant="contained" onClick={() => setPlayerGuess("Tails")}>
            Tails
          </Button>
          <h2>Results</h2>
          <br />
          <br />{" "}
          <Button
            variant="contained"
            onClick={() => startGame(playerChoice, betAmount).then(setResult)}
          >
            Start Game
          </Button>
          <br />
          {pairingString && (
            <div>
              <h4 className="pairString">
                Pairing string <br />
                {pairingString}
              </h4>
            </div>
          )}
          <br />
          <br />
          <br />
        </Typography>
      </Box>
    </Paper>
  );
}
export default App;

// Make an API call to your backend to send the wallet token
