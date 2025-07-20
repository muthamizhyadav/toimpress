// src/components/Header.tsx or wherever profile button is used
import SmallHeader from "../../components/SmallHeader";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import Header from "../../components/Header";
import OrderList from "./OrderList";

export default function Orders() {
 
  return (
    <div >
      <SmallHeader />
      <Header />
      <OrderList/>
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
