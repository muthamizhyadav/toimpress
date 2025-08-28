// src/components/Header.tsx or wherever profile button is used
import SmallHeader from "../../components/SmallHeader";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import Header from "../../components/Header";
import AboutUs from "./AboutUs";

export default function AboutUsHome() {
 
  return (
    <div >
      <SmallHeader />
      <Header />
      <AboutUs/>
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
