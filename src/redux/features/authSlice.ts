import { createSlice } from "@reduxjs/toolkit";

function safeParse(key: string, fallback: any) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

const initialState = {
  user: safeParse("user", null),
  token: localStorage.getItem("token") || null,
  refreshToken: localStorage.getItem("refreshToken") || null,
  userAddress: safeParse("userAddress", {
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
    phone: "",
    landmark: "",
  }),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.user = action.payload.user;
      state.token = action.payload.tokens.access.token;
      state.refreshToken = action.payload.tokens.refresh.token;

      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.tokens.access.token);
      localStorage.setItem("refreshToken", action.payload.tokens.refresh.token);
    },
    logout(state) {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.userAddress = {
        line1: "",
        line2: "",
        city: "",
        state: "",
        country: "India",
        pincode: "",
        phone: "",
        landmark: "",
      };

      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("userAddress");
    },
    saveAddress(state, action) {
      state.userAddress = { ...state.userAddress, ...action.payload };
      localStorage.setItem("userAddress", JSON.stringify(state.userAddress));
    },
  },
});

export const { login, logout, saveAddress } = authSlice.actions;
export default authSlice.reducer;