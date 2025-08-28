// src/components/Header.tsx or wherever profile button is used
import AuthModal from "../../components/AuthModal";
import SmallHeader from "../../components/SmallHeader";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import Header from "../../components/Header";
import ProfileCard from "../../components/ProfileCard";
import { useAuth } from "../../assets/hooks/useAuth";

export default function Profile() {

  const { isAuthenticated } = useAuth();

  return (
    <div >
      <SmallHeader />
      <Header />
      {/* { isAuthenticated ? <AuthModal  /> : <ProfileCard /> } */}
       <AuthModal  /> 
      <Footer />  
      <MobileBottomNavbar />
    </div>
  );
}
