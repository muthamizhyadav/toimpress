import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type CartItem = {
  id: string;
  title: string;
  price: number;
  salePrice?: number | null;
  image?: string;
  color?: string;
  size?: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean; // <— drawer UI state
};

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const key = (p: Pick<CartItem, "id" | "size" | "color">) =>
  `${p.id}_${p.size ?? ""}_${p.color ?? ""}`;

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // UI actions for drawer
    openCart: (state) => { state.isOpen = true; },
    closeCart: (state) => { state.isOpen = false; },
    toggleCart: (state) => { state.isOpen = !state.isOpen; },

    // cart actions
    addToCart: (
      state,
      action: PayloadAction<Omit<CartItem, "qty"> & { qty?: number }>
    ) => {
      const payload = { ...action.payload, qty: action.payload.qty ?? 1 };
      const k = key(payload);
      const existing = state.items.find((i) => key(i) === k);
      if (existing) existing.qty += payload.qty;
      else state.items.push({ ...payload });
      // optional: open the cart when item added
      state.isOpen = true;
    },
    increaseQty: (state, action: PayloadAction<{ id: string; size?: string; color?: string }>) => {
      const item = state.items.find((i) => key(i) === key(action.payload));
      if (item) item.qty += 1;
    },
    decreaseQty: (state, action: PayloadAction<{ id: string; size?: string; color?: string }>) => {
      const item = state.items.find((i) => key(i) === key(action.payload));
      if (item) item.qty = Math.max(1, item.qty - 1);
    },
    removeFromCart: (state, action: PayloadAction<{ id: string; size?: string; color?: string }>) => {
      state.items = state.items.filter((i) => key(i) !== key(action.payload));
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  openCart,
  closeCart,
  toggleCart,
  addToCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
