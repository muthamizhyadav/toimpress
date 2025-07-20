// src/components/Header.tsx or wherever profile button is used
import SmallHeader from "../../components/SmallHeader";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import Header from "../../components/Header";
import SizeCalculator from "./SizeCalculator";

export default function FindYourFitPage() {
 
  return (
    <div >
      <SmallHeader />
      <Header />
      <SizeCalculator/>
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
