import { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: string, tokens: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate reading from localStorage/session
    const tokens = localStorage.getItem("tokens");
    if (tokens) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (user: string, tokens: string) => {
    localStorage.setItem("tokens", tokens);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("tokens");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
