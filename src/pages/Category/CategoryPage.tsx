// pages/CategoryPage.tsx
import React from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../../components/Header";
import ProductGrid, { Product } from "../../components/ProductGrid";
import SmallHeader from "../../components/SmallHeader";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import BraModel from "../../../src/assets/svg/braModel.svg";
import axiosInstance from "../../api/axiosInstance";
import { API_GET_CATEGORIES_PRODUCTS } from "../../api/api";

// Real API fetch function — expects categoryName as third argument
const fetchProducts = async (
  offset: number,
  limit: number,
  categoryName: string
): Promise<Product[]> => {
  try {
    const page = Math.max(1, Math.floor(offset / limit) + 1);
    const encodedName = encodeURIComponent(categoryName || "");
    const url = `${API_GET_CATEGORIES_PRODUCTS}${encodedName}?page=${page}&limit=${limit}`;

    const response = await axiosInstance.get(url);
    console.log(response, "responseresponseresponse")
    const fetchedProducts = response?.data?.data ?? [];

    return fetchedProducts.map((product: any, index: number) => ({
      id: product._id ?? index,
      title: product.productTitle,
      price: product.salePrice,
      originalPrice: product.price,
      imageUrl: product.images?.[0] || BraModel,
      isNew: product.isNew || false,
      discount:
        product.price && product.salePrice
          ? Math.round(((product.price - product.salePrice) / product.price) * 100)
          : 0,
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
};

export default function CategoryPage() {
  const [searchParams] = useSearchParams();

  // Prefer ?name= ; if not present, fall back to ?id=
  const rawName = searchParams.get("name");
  const rawId = searchParams.get("id");
  // decode name if present (handles encoded spaces)
  const categoryName = rawName ? decodeURIComponent(rawName) : rawId ? rawId : "";

  return (
    <>
      <SmallHeader />
      <Header />
      <ProductGrid fetchProducts={fetchProducts} categoryName={categoryName} />
      <Footer />
      <MobileBottomNavbar />
    </>
  );
}