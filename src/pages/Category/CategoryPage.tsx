import Header from "../../components/Header";
import ProductGrid, { Product } from "../../components/ProductGrid";
import SmallHeader from "../../components/SmallHeader";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import BraModel from "../../../src/assets/svg/braModel.svg";
import axiosInstance from "../../api/axiosInstance";
import { GET_PRODUCTS } from "../../api/api";

// Real API fetch function
const fetchProducts = async (
  offset: number,
  limit: number,
  categoryId: string
): Promise<Product[]> => {
  try {
    const response = await axiosInstance.get(
      `${GET_PRODUCTS}${categoryId}?page=${offset / limit + 1}&limit=${limit}`
    );
    const fetchedProducts = response.data.data;

    // Map the API response to ProductGrid's expected Product[] shape
    return fetchedProducts.map((product: any, index: number) => ({
      id: product._id || index,
      title: product.productTitle,
      price: product.salePrice,
      originalPrice: product.price,
      imageUrl: product.images?.[0] || BraModel,
      isNew: product.isNew || false,
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
  return (
    <>
      <SmallHeader />
      <Header />
      <ProductGrid fetchProducts={fetchProducts} />
      <Footer />
      <MobileBottomNavbar />
    </>
  );
}
