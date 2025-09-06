// src/redux/store.ts
import { configureStore, combineReducers } from "@reduxjs/toolkit";
import cartReducer from "./features/cartSlice";
import authReducer from "./features/authSlice"; // <-- use your feature reducer
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

// ----- Root reducer -----
const rootReducer = combineReducers({
  auth: authReducer, // <-- now uses your features/authSlice reducer which implements saveAddress
  cart: cartReducer,
});

// ----- Persist config -----
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "cart"], // persist auth and cart
};

// Wrap rootReducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// ----- Store -----
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist actions
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