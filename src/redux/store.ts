// src/redux/store.ts
import { configureStore, createSlice, PayloadAction, combineReducers } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // defaults to localStorage

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

// ----- Root reducer -----
const rootReducer = combineReducers({
  auth: authSlice.reducer,
  cart: cartReducer,
});

// ----- Persist config -----
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "cart"], // ✅ persist both
};

// Wrap rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ----- Store -----
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// create persistor
export const persistor = persistStore(store);

// ----- Types -----
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;