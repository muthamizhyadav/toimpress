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
  color?: string; // normalized color stored on items
  // allow arbitrary extras (rating, originalPrice, etc.)
  [k: string]: any;
};

type AdjustPayload = {
  id: string | number;
  size?: string;
  color?: string;
  selectedColor?: string; // ✅ allow either color or selectedColor from callers
  silent?: boolean;
};

type AddPayload = CartItem & {
  silent?: boolean;
  selectedColor?: string; // ✅ allow selectedColor on add; we'll normalize into color
};

type CartState = { items: CartItem[]; isOpen: boolean };
const initialState: CartState = { items: [], isOpen: false };

/**
 * Exact variant match: same product id + same size + same color.
 * Accepts payloads that may specify either `color` or `selectedColor`.
 */
const sameVariant = (
  a: CartItem,
  b: { id: CartItem["id"]; size?: string; color?: string; selectedColor?: string }
) => {
  const bColor = (b.color ?? b.selectedColor ?? "") || "";
  return (
    a.id === b.id &&
    (a.size ?? "") === (b.size ?? "") &&
    (a.color ?? "") === bColor
  );
};

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

      // ✅ Normalize selectedColor into color for storage/lookup consistency
      const color = (p as any).selectedColor ?? p.color;
      const incoming: CartItem = {
        ...p,
        color,
        title: p.title ?? p.productName ?? "Product",
        qty: p.qty ?? 1,
      };

      // Find exact variant first (id + size + color)
      const exact = state.items.find((it) => sameVariant(it, incoming));
      if (exact) {
        exact.qty += incoming.qty ?? 1;
      } else {
        // No fallback merging by id anymore — push a new variant object
        state.items.push(incoming);
      }

      if (!silent) state.isOpen = true;
    },

    increaseQty(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const matchPayload = { ...p, color: p.color ?? p.selectedColor }; // ✅
      const it = state.items.find((x) => sameVariant(x, matchPayload));
      if (it) it.qty += 1;
      if (!silent) state.isOpen = true;
    },

    decreaseQty(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const matchPayload = { ...p, color: p.color ?? p.selectedColor }; // ✅
      const idx = state.items.findIndex((x) => sameVariant(x, matchPayload));
      if (idx >= 0) {
        const it = state.items[idx];
        if (it.qty > 1) it.qty -= 1;
        else state.items.splice(idx, 1);
      }
      if (!silent) state.isOpen = true;
    },

    removeFromCart(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const matchPayload = { ...p, color: p.color ?? p.selectedColor }; // ✅
      const idx = state.items.findIndex((x) => sameVariant(x, matchPayload));
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