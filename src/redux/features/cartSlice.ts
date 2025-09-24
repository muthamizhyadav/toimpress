// redux/features/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type CartItem = {
  id: any;
  title: string;
  productName?: string;
  image?: string;
  imageUrl?: string;
  price?: number;
  salePrice?: number;
  qty: number;
  size?: string;
  color?: string;
  // allow arbitrary extras (rating, originalPrice, etc.)
  [k: string]: any;
};

type AdjustPayload = {
  id: string | number;
  size?: string;
  color?: string;
  silent?: boolean;
};
type AddPayload = CartItem & { silent?: boolean };

type CartState = { items: CartItem[]; isOpen: boolean };
const initialState: CartState = { items: [], isOpen: false };

/**
 * Exact variant match: same product id + same size + same color.
 */
const sameVariant = (
  a: CartItem,
  b: { id: CartItem["id"]; size?: string; color?: string }
) =>
  a.id === b.id &&
  (a.size ?? "") === (b.size ?? "") &&
  (a.color ?? "") === (b.color ?? "");

/**
 * Behavior:
 * - addToCart: only matches exact variant (id+size+color). If exact exists -> increment qty.
 *             Otherwise push a new item (do NOT fallback/merge by id).
 * - increaseQty/decreaseQty/removeFromCart: operate on exact variant.
 */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    openCart(state) {
      state.isOpen = true;
    },
    closeCart(state) {
      state.isOpen = false;
    },

    addToCart(state, action: PayloadAction<AddPayload>) {
      const { silent, ...p } = action.payload;
      // Find exact variant first (id + size + color)
      const exact = state.items.find((it) => sameVariant(it, p));
      if (exact) {
        exact.qty += p.qty ?? 1;
      } else {
        // No fallback merging by id anymore — push a new variant object
        state.items.push({
          ...p,
          title: p.title ?? p.productName ?? "Product",
          qty: p.qty ?? 1,
        });
      }

      if (!silent) state.isOpen = true;
    },

    increaseQty(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const it = state.items.find((x) => sameVariant(x, p));
      if (it) it.qty += 1;
      if (!silent) state.isOpen = true;
    },

    decreaseQty(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const idx = state.items.findIndex((x) => sameVariant(x, p));
      if (idx >= 0) {
        const it = state.items[idx];
        if (it.qty > 1) it.qty -= 1;
        else state.items.splice(idx, 1);
      }
      if (!silent) state.isOpen = true;
    },

    removeFromCart(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const idx = state.items.findIndex((x) => sameVariant(x, p));
      if (idx >= 0) state.items.splice(idx, 1);
      if (!silent) state.isOpen = true;
    },

    clearCart(state) {
      state.items = [];
    },
  },
});

export const {
  openCart,
  closeCart,
  addToCart,
  increaseQty,
  decreaseQty,
  removeFromCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;