// src/components/Header.tsx or wherever profile button is used
import { useState } from "react";
import { IconUser } from "@tabler/icons-react";
import AuthModal from "../../components/AuthModal";
import SmallHeader from "../../components/SmallHeader";
import Footer from "../Home/Footer";
import MobileBottomNavbar from "../MobileBottomBar";
import Header from "../../components/Header";

export default function Profile() {
  const [authModalOpened, setAuthModalOpened] = useState(false);
  const isLoggedIn = false; // Replace this with your actual auth logic

  const handleProfileClick = () => {
    if (isLoggedIn) {
      // show profile details
    } else {
      setAuthModalOpened(true);
    }
  };

  return (
    <div >
         <SmallHeader />
      <Header />
      <AuthModal opened={authModalOpened} onClose={() => setAuthModalOpened(false)} />
      <Footer />
      <MobileBottomNavbar />
    </div>
  );
}
