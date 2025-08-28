// src/redux/store.ts
import { configureStore, createSlice, PayloadAction } from "@reduxjs/toolkit";
import cartReducer from "./features/CartSlice"; // <-- filename should be cartSlice.ts

// ----- Auth slice -----
interface AuthState {
  isAuthenticated: boolean;
  user: string | null;
  tokens: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  tokens: null,
};

interface AuthPayload {
  user: string;
  tokens: string;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action: PayloadAction<AuthPayload>) {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.tokens = null;
    },
  },
});

export const { login, logout } = authSlice.actions;

// ----- Store -----
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    cart: cartReducer,
  },
});

// ----- Types -----
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;