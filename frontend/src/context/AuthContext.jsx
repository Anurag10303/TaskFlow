import { createContext, useState, useContext, useCallback } from "react";
import API from "../api/axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("taskflow_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Called after login/register — backend sets cookies, we just store user info
  const login = (userData) => {
    localStorage.setItem("taskflow_user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = useCallback(async () => {
    try {
      await API.post("/auth/logout");
    } catch {
      // ignore errors
    } finally {
      localStorage.removeItem("taskflow_user");
      setUser(null);
    }
  }, []);

  const updateUser = (userData) => {
    localStorage.setItem("taskflow_user", JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
