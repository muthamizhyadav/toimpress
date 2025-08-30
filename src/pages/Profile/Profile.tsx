// src/pages/Profile.tsx
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // full height of viewport
      }}
    >
      <SmallHeader />
      <Header />

      {/* Content area grows to push footer down */}
      <div style={{ flex: 1 }}>
        {isAuthenticated ? <ProfileCard /> : <AuthModal />}
      </div>

      {/* Footer stays at the bottom */}
      <Footer />

      {/* Mobile nav stays fixed at bottom of viewport */}
      <MobileBottomNavbar />
    </div>
  );
}