// redux/features/cartThunks.ts
import { createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../api/axiosInstance";
import { API_ADD_TO_CART, COUPON_VALIDATE, COUPON_APPLY } from "../../api/api";

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

export type CouponValidateInput = {
  code: string;
  cartTotal: number;
  productIds: string[];
};

export type CouponApplyInput = {
  code: string;
  cartTotal: number;
  productIds: string[];
};

export type CouponResult = {
  couponCode: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
  originalAmount: number;
  finalAmount: number;
  savings: number;
};

export const validateCouponThunk = createAsyncThunk<
  CouponResult,
  CouponValidateInput,
  { state: RootState }
>("cart/validateCoupon", async (input, _thunkApi) => {
  const response = await axiosInstance.post(COUPON_VALIDATE, input);
  return response.data;
});

export const applyCouponThunk = createAsyncThunk<
  CouponResult,
  CouponApplyInput,
  { state: RootState }
>("cart/applyCoupon", async (input, _thunkApi) => {
  const response = await axiosInstance.post(COUPON_APPLY, input);
  return response.data;
});
