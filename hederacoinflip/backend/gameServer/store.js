import { configureStore } from "@reduxjs/toolkit";

const initialState = {
  phase: ["init", "bet", "flip", "payouts", "end"],
  winner: null,
  outcome: null,
  wallet: {
    connected: false,
    receipt: null,
  },

  player: {
    id: null,
    guess: null,
    bet: 0,
    wallet: {
      connected: false,
      accessToken: null,
      receipt: null,
    },
  },
};

const gameReducer = (state = initialState, action) => {
  switch (action.type) {
    case "SET_PHASE":
      return { ...state, phase: action.payload };
    case "SET_WINNER":
      return { ...state, winner: action.payload };
    case "SET_OUTCOME":
      return { ...state, outcome: action.payload };
    case "SET_WALLET_CONNECTED":
      return {
        ...state,
        wallet: { ...state.wallet, connected: action.payload },
      };
    case "SET_WALLET_RECEIPT":
      return { ...state, wallet: { ...state.wallet, receipt: action.payload } };
    case "SET_PLAYER_ID":
      return { ...state, player: { ...state.player, id: action.payload } };
    case "SET_PLAYER_GUESS":
      return { ...state, player: { ...state.player, guess: action.payload } };
    case "SET_PLAYER_BET":
      return { ...state, player: { ...state.player, bet: action.payload } };
    case "SET_PLAYER_WALLET_CONNECTED":
      return {
        ...state,
        player: {
          ...state.player,
          wallet: { ...state.player.wallet, connected: action.payload },
        },
      };
    case "SET_PLAYER_WALLET_ACCESS_TOKEN":
      return {
        ...state,
        player: {
          ...state.player,
          wallet: { ...state.player.wallet, accessToken: action.payload },
        },
      };
    case "SET_PLAYER_WALLET_RECEIPT":
      return {
        ...state,
        player: {
          ...state.player,
          wallet: { ...state.player.wallet, receipt: action.payload },
        },
      };
    default: {
      return state;
    }
  }
};

const store = configureStore({
  reducer: gameReducer,
  preloadedState: initialState,
});

export default store;
