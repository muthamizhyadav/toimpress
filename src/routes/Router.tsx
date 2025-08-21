import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

import Home from "../pages/Home";
import Product from "../pages/Product/Product";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login/login";
import Profile from "../pages/Profile/Profile";
import Orders from "../pages/Orders/Orders";
import FindYourFitPage from "../pages/FindYourFit/FindYourFit";
import CategoryPage from "../pages/Category/CategoryPage";
import TermsAndConditions from "../pages/TermsAndConditions";
import PrivacyPolicy from "../pages/PrivacyPolicy";

import { AuthProvider, useAuth } from "../pages/AuthContext";
import { ReactNode } from "react";
import ScrollToTop from "../components/ScrollToTop";

// ProtectedRoute component
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Custom theme
const customTheme = createTheme({
  colors: {
    darkGreen: [
      "#e0e4e0",
      "#c2c9c2",
      "#a3ad9f",
      "#859280",
      "#667664",
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

const AppRoutes = () => {
  return (
    <MantineProvider theme={customTheme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <ModalsProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product"
                element={
                  <ProtectedRoute>
                    <Product />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fit"
                element={
                  <ProtectedRoute>
                    <FindYourFitPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/category"
                element={
                  <ProtectedRoute>
                    <CategoryPage />
                  </ProtectedRoute>
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