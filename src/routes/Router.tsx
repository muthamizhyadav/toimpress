import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";
import { motion } from "framer-motion";

import Maintenance from "../pages/Maintenance";
import Product from "../pages/Product/Product";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login/login";
import Profile from "../pages/Profile/Profile";
import Orders from "../pages/Orders/Orders";
import FindYourFitPage from "../pages/FindYourFit/FindYourFit";
import CategoryPage from "../pages/Category/CategoryPage";
import TermsAndConditions from "../pages/TermsAndConditions";
import PrivacyPolicy from "../pages/PrivacyPolicy";

import { AuthProvider } from "../pages/AuthContext";
import ScrollToTop from "../components/ScrollToTop";
import AboutUsHome from "../pages/About/AboutUsHome";
import SiteMapPage from "../pages/SiteMap/SiteMap";
import ContactUs from "../pages/ContactUs/ContactUs";
import Checkout from "../pages/Checkout/Checkout";
import Home from "../pages/Home";
import OrderSuccess from "../pages/Checkout/OrderSuccess";


// Custom theme
const customTheme = createTheme({
  colors: {
    darkGreen: [
      "#e0e4e0",
      "#c2c9c2",
      "#a3ad9f",
      "#859280",
      "#667764",
      "#475b47",
      "#29402a",
      "#1e351f",
      "#152916",
      "#133215",
    ],
    lightGreen: [
      "#f0f5ec",
      "#e0eadd",
      "#d1e0ce",
      "#c1d6bf",
      "#b2ccb0",
      "#a3c1a1",
      "#92b775",
      "#7aa15f",
      "#638b49",
      "#4c7533",
    ],
  },
});

const pageVariants = {
  initial: {
    opacity: 0,
    y: 50,
  },
  in: {
    opacity: 1,
    y: 0,
  },
  out: {
    opacity: 0,
    y: -50,
  },
};

const pageTransition = {
  type: "spring",
  stiffness: 50,
  damping: 20,
};

// Wrap routes with motion.div for animations
const AnimatedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition as any} // Temporary fix for type mismatch
  >
    {children}
  </motion.div>
);

const AppRoutes = () => {
  return (
    <MantineProvider theme={customTheme} defaultColorScheme="light">
      <Notifications position="top-center"  />
      <ModalsProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<Login />} />
              {/* <Route
                path="/"
                element={
                  <AnimatedRoute>
                    <Maintenance />
                  </AnimatedRoute>
                }
              /> */}
               <Route
                path="/"
                element={
                  <AnimatedRoute>
                    <Home />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/product"
                element={
                  <AnimatedRoute>
                    <Product />
                  </AnimatedRoute>
                }
              />
               <Route
                path="/about"
                element={
                  <AnimatedRoute>
                    <AboutUsHome />
                  </AnimatedRoute>
                }
              />

               <Route
                path="/sitemap"
                element={
                  <AnimatedRoute>
                    <SiteMapPage />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <AnimatedRoute>
                    <Profile />
                  </AnimatedRoute>
                }
              />
               <Route
                path="/contact"
                element={
                  <AnimatedRoute>
                    <ContactUs />
                  </AnimatedRoute>
                }
              />
               <Route
                path="/checkout"
                element={
                  <AnimatedRoute>
                    <Checkout />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <AnimatedRoute>
                    <Orders />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/fit"
                element={
                  <AnimatedRoute>
                    <FindYourFitPage />
                  </AnimatedRoute>
                }
              />
              <Route
                path="/category"
                element={
                  <AnimatedRoute>
                    <CategoryPage />
                  </AnimatedRoute>
                }
              />

               <Route
                path="/order-success"
                element={
                  <AnimatedRoute>
                    <OrderSuccess />
                  </AnimatedRoute>
                }
              />
              
              <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default AppRoutes;