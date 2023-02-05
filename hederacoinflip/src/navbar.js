import './App.css';

import * as React from 'react';
import AppBar from '@mui/material/AppBar';
// import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
// import Container from '@mui/material/Container';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
// import IconButton from '@mui/material/IconButton';
// import MenuIcon from '@mui/icons-material/Menu';
import Paper from '@mui/material/Paper';


function NavBar() {
    
  return (
<header className="App-header">
    <Paper elevation={5} className="topPaper">
{/* HEADER */}
      <Box sx={{ flexGrow: 1 }}>
        {/* // Top Bar */}
        <AppBar position="static">
          <Toolbar className="topBar">
          <Typography variant="h6" sx={{ flexGrow: 1 }} className="topBarText">
            CoinFlip 
            <p id='accountid'> </p>
          </Typography>
            <Button color="inherit">Account</Button> 
            <Button color="inherit" href='/stats.js'>Stats</Button>
          </Toolbar>
        {/* END // Top Bar */}
      </AppBar>
      </Box>
        {/* END // HEADER */}
    </Paper>
    </header>
  );
}
export default NavBar;
