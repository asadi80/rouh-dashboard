import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

const signIn = async (email, password) => {
  const data = await api.post("/api/auth/login", { email, password });
  setToken(data.token);
  
  // Make sure we capture the user object with all properties including must_change_password
  const userData = data.user;
  setUser(userData);
  
  // Log to debug
  console.log("AuthContext signIn - user data:", userData);
  console.log("AuthContext signIn - must_change_password:", userData?.must_change_password);
  
  return userData;
};

  const signOut = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isSuperAdmin: user?.role === "super_admin",
    isAdmin: user?.role === "admin" || user?.role === "super_admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
