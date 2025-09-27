import { useMediaQuery } from '@mantine/hooks';
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
import Reviews from './Home/Reviews';
import PromoBanners from '../components/PromoBanner';

const Home = () => {
  const isMobile = useMediaQuery('(max-width: 640px)');

  return (
    <div className="w-full min-h-screen pb-16">
      <SmallHeader />
      <Header />
      <HomeBanner />
      {isMobile && <CategoriesHomeMobile />}
      <TopCategories />
      <CategorySlider />
      <PromoBanners/>
      <ShopBySize />
      <FindYourFitt />
      <Reviews/>
      {/* <Testimonials /> */}
      <FooterCourier />
      {/* <SubscriptionBanner /> */}
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
};

export default Home;
