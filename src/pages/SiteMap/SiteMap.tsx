// src/components/Header.tsx or wherever profile button is used
import SmallHeader from "../../components/SmallHeader";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import Header from "../../components/Header";
import SiteMapContent from "./SiteMapContent";


export default function SiteMapPage() {
 
  return (
    <div >
      <SmallHeader />
      <Header />
      <SiteMapContent/>
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
