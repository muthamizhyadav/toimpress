// redux/features/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

const normalizeColor = (c?: string) => (c ?? "").toString().trim().toLowerCase();
const normId = (v: string | number | undefined) => String(v ?? "");

type CartItem = {
  id: string | number;         // productId in your app
  title: string;
  productName?: string;
  image?: string;
  imageUrl?: string;
  price?: number;
  salePrice?: number;
  qty: number;
  size?: string;
  color?: string;              // stored **normalized** (lowercase)
  [k: string]: any;
};

type AdjustPayload = {
  id: string | number;
  size?: string;
  color?: string;
  selectedColor?: string;      // callers can send either color or selectedColor
  silent?: boolean;
};

type AddPayload = CartItem & {
  silent?: boolean;
  selectedColor?: string;      // normalize into color
};

type CartState = { items: CartItem[]; isOpen: boolean };
const initialState: CartState = { items: [], isOpen: false };

/** Exact variant match: same product id + same size + same (normalized) color. */
const sameVariant = (
  a: CartItem,
  b: { id: CartItem["id"]; size?: string; color?: string; selectedColor?: string }
) => {
  const bColor = normalizeColor(b.color ?? b.selectedColor ?? "");
  return (
    normId(a.id) === normId(b.id) &&
    (a.size ?? "") === (b.size ?? "") &&
    normalizeColor(a.color) === bColor
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

      // Normalize
      const color = normalizeColor((p as any).selectedColor ?? p.color);
      const incoming: CartItem = {
        ...p,
        id: normId(p.id),
        color,
        title: p.title ?? p.productName ?? "Product",
        qty: Math.max(1, p.qty ?? 1),
      };

      // Merge by exact variant
      const exact = state.items.find((it) => sameVariant(it, incoming));
      if (exact) {
        exact.qty += incoming.qty;
      } else {
        state.items.push(incoming);
      }

      if (!silent) state.isOpen = true;
    },

    increaseQty(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const payload = { ...p, id: normId(p.id), color: normalizeColor(p.color ?? p.selectedColor) };
      const it = state.items.find((x) => sameVariant(x, payload));
      if (it) it.qty += 1;
      if (!silent) state.isOpen = true;
    },

    decreaseQty(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const payload = { ...p, id: normId(p.id), color: normalizeColor(p.color ?? p.selectedColor) };
      const idx = state.items.findIndex((x) => sameVariant(x, payload));
      if (idx >= 0) {
        const it = state.items[idx];
        if (it.qty > 1) it.qty -= 1;
        else state.items.splice(idx, 1);
      }
      if (!silent) state.isOpen = true;
    },

    removeFromCart(state, action: PayloadAction<AdjustPayload>) {
      const { silent, ...p } = action.payload;
      const payload = { ...p, id: normId(p.id), color: normalizeColor(p.color ?? p.selectedColor) };
      const idx = state.items.findIndex((x) => sameVariant(x, payload));
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