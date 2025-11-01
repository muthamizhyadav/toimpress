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
import {
  API_GET_CATEGORIES_PRODUCTS,
  API_GET_CATEGORIES_PRODUCTS_BYSIZE,
} from "../../api/api";

// Real API fetch function
const fetchProducts = async (
  offset: number,
  limit: number,
  categoryName: string,
  size?: string,
  price?:string | any
): Promise<Product[]> => {
  try {
    const page = Math.max(1, Math.floor(offset / limit) + 1);

    let url = "";

    if(price){
      const encodedPrice= encodeURIComponent(price);
      const encodedName = encodeURIComponent(categoryName || "");
      url = `${API_GET_CATEGORIES_PRODUCTS}${encodedName}?price=${encodedPrice}&page=${page}&limit=${limit}`;
    }else if (size) {
      const encodedSize = encodeURIComponent(size);
      const encodedPrice= encodeURIComponent(price);
      url = `${API_GET_CATEGORIES_PRODUCTS_BYSIZE}?size=${encodedSize}&price=${encodedPrice}&page=${page}&limit=${limit}`;
    } else {
      const encodedName = encodeURIComponent(categoryName || "");
      url = `${API_GET_CATEGORIES_PRODUCTS}${encodedName}?&page=${page}&limit=${limit}`;
    }

    const response = await axiosInstance.get(url);
    const fetchedProducts = response?.data?.data ?? [];
    const pagination = response?.data?.pagination ?? null; // ✅ read pagination

    // If API indicates no further pages and we somehow got called beyond,
    // just return empty (lets the grid stop requesting more).
    if (pagination && page > (pagination?.totalPages ?? page) && !pagination?.hasNextPage) {
      return [];
    }    
    return fetchedProducts.map((product: any, index: number) => ({
      id: product._id ?? index,
      title: product.productTitle,
      price: product.salePrice,
      originalPrice: product.price,
      category: product.category,
      imageUrl: product.images?.[0] || BraModel,
      isNew: product.isNew || false,
      size:product.selectedSizes,
      discount:
        product.price && product.salePrice
          ? Math.round(
              ((product.price - product.salePrice) / product.price) * 100
            )
          : 0,
    }));
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
};

export default function CategoryPage() {
  const [searchParams] = useSearchParams();

  // Read params
  const rawName = searchParams.get("name");
  const rawId = searchParams.get("id");
  const rawSize = searchParams.get("size");

  // decode category name
  const categoryName = rawName
    ? decodeURIComponent(rawName)
    : rawId
    ? rawId
    : "";

  return (
    <>
      <SmallHeader />
      <Header />
      {/* ✅ pass size to ProductGrid */}
      <ProductGrid
        fetchProducts={fetchProducts}
        categoryName={categoryName}
        size={rawSize || undefined}
        price={searchParams.get("price") || undefined}
      />
      <Footer />
      <MobileBottomNavbar />
    </>
  );
}