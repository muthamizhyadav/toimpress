import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  id: string | number;
  title?: string;
  price?: number;
  salePrice?: number;
  image?: string;
  size?: string | number;
  color?: string;
  qty: number;
  category?:string;
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const normalize = (v?: string | number) =>
  v ? v.toString().trim().toLowerCase() : "";

export const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      console.log(item,'reduxItem');
      
      const existing = state.items.find(
        (i) =>
          normalize(i.id) === normalize(item.id) &&
          normalize(i.size) === normalize(item.size) &&
          normalize(i.color) === normalize(item.color) &&
          normalize((i as any).category) === normalize((item as any).category)
      );

      if (existing) {
        existing.qty += item.qty;
      } else {
        state.items.push({ ...item });
      }
    },

    removeFromCart: (
      state,
      action: PayloadAction<{ id: string | number; size?: string | number; color?: string }>
    ) => {
      const { id, size, color } = action.payload;

      state.items = state.items.filter(
        (item) =>
          !(
            normalize(item.id) === normalize(id) &&
            normalize(item.size) === normalize(size) &&
            normalize(item.color) === normalize(color)
          )
      );
    },

    updateCartItemQuantity: (
      state,
      action: PayloadAction<{ id: string | number; size?: string | number; color?: string; qty: number; category?:string }>
    ) => {
      const { id, size, color, qty, category } = action.payload;

      const item = state.items.find(
        (i) =>
          normalize(i.id) === normalize(id) &&
          normalize(i.size) === normalize(size) &&
          normalize(i.color) === normalize(color) && 
          normalize((i as any).category) === normalize(category)
      );

      if (item) {
        item.qty = qty;
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateCartItemQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
