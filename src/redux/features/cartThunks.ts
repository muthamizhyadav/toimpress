// redux/features/cartThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { API_ADD_TO_CART } from "../../api/api"; // define in api/api.ts

type RootState = any;

export type CartLineInput = {
  productId: string | number;
  size?: string | null;
  color?: string | null;  // normalized lowercase (from slice)
  qty: number;            // ABSOLUTE qty for this variant after the change
  price?: number;
  salePrice?: number;
  title?: string;
  image?: string;
  imageUrl?: string;
};

/**
 * Send ONLY ONE variant line to the server with its ABSOLUTE quantity.
 * Use this whenever a user increments/decrements a specific variant.
 */
export const addOrUpdateCartLine = createAsyncThunk<
  { ok: boolean },
  CartLineInput,
  { state: RootState }
>("cart/addOrUpdateCartLine", async (line, _thunkApi) => {
  // You can adapt shape if backend expects different keys
  const payload = {
    productId: line.productId,
    selectedSize: line.size ?? null,
    selectedColor: line.color ?? null,
    quantity: Number(line.qty ?? 0),
    price: line.price,
    salePrice: line.salePrice,
    title: line.title,
    image: line.image,
    imageUrl: line.imageUrl,
  };

  await axiosInstance.post(API_ADD_TO_CART, payload);
  return { ok: true };
});
