// src/components/Header.tsx or wherever profile button is used
import SmallHeader from "../../components/SmallHeader";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import Header from "../../components/Header";
import ContactUsContent from "./ContactUsContent";

export default function ContactUs() {
 
  return (
    <div >
      <SmallHeader />
      <Header />
      <ContactUsContent/>
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
