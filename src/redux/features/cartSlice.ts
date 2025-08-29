// redux/features/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  id: string | number;
  title: string;
  productName?: string;
  image?: string;
  imageUrl?: string;
  price?: number;
  salePrice?: number;
  qty: number;
  size?: string;
  color?: string;
};

type AdjustPayload = { id: string | number; size?: string; color?: string; silent?: boolean };
type AddPayload = CartItem & { silent?: boolean };

type CartState = { items: CartItem[]; isOpen: boolean };
const initialState: CartState = { items: [], isOpen: false };

const sameVariant = (a: CartItem, b: { id: CartItem["id"]; size?: string; color?: string }) =>
  a.id === b.id && (a.size ?? "") === (b.size ?? "") && (a.color ?? "") === (b.color ?? "");

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    openCart(state) { state.isOpen = true; },
    closeCart(state) { state.isOpen = false; },

    addToCart(state, action: PayloadAction<AddPayload>) {
      const { silent, ...p } = action.payload;
      const existing = state.items.find((it) => sameVariant(it, p));
      if (existing) existing.qty += p.qty ?? 1;
      else state.items.push({ ...p, title: p.title ?? p.productName ?? "Product", qty: p.qty ?? 1 });
      if (!silent) state.isOpen = true;              // ← respect silent
    },

    increaseQty(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const it = state.items.find((x) => sameVariant(x, p));
      if (it) it.qty += 1;
      if (!silent) state.isOpen = true;              // ← respect silent
    },

    decreaseQty(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const idx = state.items.findIndex((x) => sameVariant(x, p));
      if (idx >= 0) {
        const it = state.items[idx];
        if (it.qty > 1) it.qty -= 1;
        else state.items.splice(idx, 1);
      }
      if (!silent) state.isOpen = true;              // ← respect silent
    },

    removeFromCart(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const idx = state.items.findIndex((x) => sameVariant(x, p));
      if (idx >= 0) state.items.splice(idx, 1);
      if (!silent) state.isOpen = true;              // ← respect silent
    },
    clearCart(state) { state.items = []; },
  },
});

export const { openCart, closeCart, addToCart, increaseQty, decreaseQty, removeFromCart, clearCart } = cartSlice.actions;
export default cartSlice.reducer;