// src/components/Header.tsx or wherever profile button is used
import AuthModal from "../../components/AuthModal";
import SmallHeader from "../../components/SmallHeader";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import Header from "../../components/Header";

export default function Profile() {


  return (
    <div >
      <SmallHeader />
      <Header />
      <AuthModal  />
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
