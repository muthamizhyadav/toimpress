import ProductPage from "./ProductSingle";
import SmallHeader from "../../components/SmallHeader";
import Header from "../../components/Header";
import Footer from "../Home/Footer";
import FooterCourier from "../Home/FooterCourier";
import SubscriptionBanner from "../Home/SuscriptionBanner";
import MobileBottomNavbar from "../MobileBottomBar";

const Product = () => {
  return (
    <div className="w-full h-[100vh]">
      <SmallHeader />
      <Header />
      <ProductPage />
      <FooterCourier />
      <SubscriptionBanner />
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
};

export default Product;
