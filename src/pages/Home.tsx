import { useMediaQuery } from "@mantine/hooks";
import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { GET_HOME_BANNER } from "../api/api";
import CategoriesHomeMobile from "../components/CategoriesHomeMobile";
import Header from "../components/Header";
import SmallHeader from "../components/SmallHeader";
import CategorySlider from "./Home/CategorySlider";
import FindYourFitt from "./Home/FindYourFit";
import Footer from "./Home/Footer";
import FooterCourier from "./Home/FooterCourier";
import HomeBanner from "./Home/HomeBanner";
import ShopBySize from "./Home/ShopBySize";
import SubscriptionBanner from "./Home/SuscriptionBanner";
import Testimonials from "./Home/Testimonials";
import TopCategories from "./Home/TopCategories";
import MobileBottomNavbar from "./MobileBottomBar";
import Reviews from "./Home/Reviews";
import PromoBanners from "../components/PromoBanner";

const Home = () => {
  const isMobile = useMediaQuery("(max-width: 640px)");
  const [banners, setBanners] = useState([]);
  const [SecondaryBanner, setSecondaryBanners] = useState([]);
  const [ThirdBanner, setThirdBanner] = useState([]);

  const getAllBanners = async () => {
    try {
      const response = await axiosInstance.get(GET_HOME_BANNER);
      if (response?.data) {
        setBanners(response.data);
        const secondaryBanners = response.data.filter(
          (banner: any) => banner.pagePosition === "secondary"
        );
        const thirdBanners = response.data.filter(
          (banner: any) => banner.pagePosition === "third"
        );
        setThirdBanner(thirdBanners);
        setSecondaryBanners(secondaryBanners);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  useEffect(() => {
    getAllBanners();
  }, []);

  return (
    <div className="w-full min-h-screen pb-16">
      <SmallHeader />
      <Header />
      <HomeBanner banners={banners} />

      {isMobile && <CategoriesHomeMobile />}
      <TopCategories />
      <CategorySlider banners={SecondaryBanner} />
      <PromoBanners />
      <ShopBySize />
      <CategorySlider banners={ThirdBanner} />
      <FindYourFitt />
      <Reviews />
      {/* <Testimonials /> */}
      <FooterCourier />
      {/* <SubscriptionBanner /> */}
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
};

export default Home;
