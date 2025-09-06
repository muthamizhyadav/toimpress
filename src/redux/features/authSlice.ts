// src/redux/features/authSlice.ts
import { createSlice } from "@reduxjs/toolkit";

function safeParse(key: string, fallback: any) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

/** Normalize stored address: if an array is stored, return its first element */
function normalizeStoredAddress(val: any) {
  if (!val) return null;
  return Array.isArray(val) ? val[0] ?? null : val;
}

const tokenFromStorage = localStorage.getItem("token") || null;
const refreshTokenFromStorage = localStorage.getItem("refreshToken") || null;

// read and normalize userAddress from localStorage so it's always an object or null
const storedUserAddress = safeParse("userAddress", null);
const normalizedUserAddress = normalizeStoredAddress(storedUserAddress);

const initialState = {
  // whether user is authenticated
  isAuthenticated: !!tokenFromStorage,
  // user object (or null)
  user: safeParse("user", null),
  // tokens
  token: tokenFromStorage,
  refreshToken: refreshTokenFromStorage,
  // userAddress (normalized to object or null)
  userAddress: normalizedUserAddress,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /**
     * login payload expected shape:
     * { user, tokens } OR { user, token, refreshToken }
     */
    login(state, action) {
      const payload = action.payload || {};
      state.user = payload.user ?? state.user;

      // Try to support multiple token shapes
      const accessToken =
        payload.tokens?.access?.token ?? payload.token ?? payload.tokens?.accessToken ?? null;
      const refreshToken =
        payload.tokens?.refresh?.token ?? payload.refreshToken ?? payload.tokens?.refreshToken ?? null;

      state.token = accessToken ?? state.token;
      state.refreshToken = refreshToken ?? state.refreshToken;

      state.isAuthenticated = true;

      try {
        if (state.user) localStorage.setItem("user", JSON.stringify(state.user));
        if (state.token) localStorage.setItem("token", state.token);
        if (state.refreshToken) localStorage.setItem("refreshToken", state.refreshToken);
      } catch {
        // ignore localStorage write errors
      }
    },

    /**
     * logout: clear everything related to auth in-memory and in localStorage.
     * Note: redux-persist state (persist:root) can be purged by caller (component) to fully remove persisted store.
     */
    logout(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.userAddress = null;

      try {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userAddress");
      } catch {
        // ignore localStorage errors
      }
    },

    /**
     * saveAddress accepts object or array (picks first). Stores a flat object into state.userAddress.
     */
    saveAddress(state, action) {
      const payload = action.payload;
      // if payload is array, pick first; if null/undefined, set null
      const addressCandidate = Array.isArray(payload) ? payload[0] : payload;
      const address = addressCandidate ?? null;
      state.userAddress = address;
      try {
        // always store as an object (not an array)
        if (address === null) {
          localStorage.removeItem("userAddress");
        } else {
          localStorage.setItem("userAddress", JSON.stringify(address));
        }
      } catch {
        // ignore localStorage errors
      }
    },
  },
});

export const { login, logout, saveAddress } = authSlice.actions;
export default authSlice.reducer;