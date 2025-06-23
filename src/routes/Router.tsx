import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell, MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

import Home from "../pages/Home";
import Product from "../pages/Product/Product";
import NotFound from "../pages/NotFound";
import { AuthProvider } from "../pages/AuthContext";
import Login from "../pages/Login/login";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Define your custom Mantine theme here
const customTheme = createTheme({
  colors: {
    // Define your custom green color palette
    darkGreen: [
      "#e0e4e0", // Shade 0 (very light)
      "#c2c9c2", // Shade 1
      "#a3ad9f", // Shade 2
      "#859280", // Shade 3
      "#667664", // Shade 4
      "#475b47", // Shade 5
      "#29402a", // Shade 6
      "#1e351f", // Shade 7
      "#152916", // Shade 8
      "#133215", // Shade 9 - Your primary dark green
    ],
    lightGreen: [
      "#f0f5ec", // Shade 0 (very light)
      "#e0eadd", // Shade 1
      "#d1e0ce", // Shade 2
      "#c1d6bf", // Shade 3
      "#b2ccb0", // Shade 4
      "#a3c1a1", // Shade 5
      "#92b775", // Shade 6 - Your light green (used directly or as a base for custom palette)
      "#7aa15f", // Shade 7
      "#638b49", // Shade 8
      "#4c7533", // Shade 9 (darkest light green)
    ],
    // You can also set a primary color for Mantine components here if desired
    // primaryColor: 'darkGreen', // This will make 'darkGreen' the default primary color for components
  },
  // You can add other theme customizations here like typography, spacing, etc.
  // fontFamily: 'Inter, sans-serif', // Example of setting a global font
  // primaryShade: {
  //   light: 9, // Use shade 9 for light scheme primary
  //   dark: 6,  // Use shade 6 for dark scheme primary
  // },
});

const AppRoutes = () => {
  return (
    <MantineProvider theme={customTheme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <ModalsProvider>
        <AuthProvider>
          <BrowserRouter>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  );
};

export default AppRoutes;
