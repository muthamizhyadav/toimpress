import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell, MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { ModalsProvider } from "@mantine/modals";

import Home from "../pages/Home";
import Product from "../pages/Product/Product";
import NotFound from "../pages/NotFound";
import { AuthProvider, useAuth } from "../pages/AuthContext";
import Login from "../pages/Login/login";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 200, breakpoint: "sm" }}
      padding="md"
    >
      {children}
    </AppShell>
  );
};


const customTheme = createTheme({
  colors: {
    darkGreen: [
      "#e0e4e0", "#c2c9c2", "#a3ad9f", "#859280", "#667664",
      "#475b47", "#29402a", "#1e351f", "#152916", "#133215"
    ],
    lightGreen: [
      "#f0f5ec", "#e0eadd", "#d1e0ce", "#c1d6bf", "#b2ccb0",
      "#a3c1a1", "#92b775", "#7aa15f", "#638b49", "#4c7533"
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
