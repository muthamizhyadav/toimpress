// ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "../pages/AuthContext";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth(); // Add a loading state in your context

  if (loading) {
    // While checking authentication (e.g., reading from localStorage or API)
    return <div>Loading...</div>; // You can show a spinner or skeleton here
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
