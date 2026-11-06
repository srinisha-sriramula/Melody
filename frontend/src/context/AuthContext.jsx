
import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check whether user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await API.get("/auth/me");
        setUser(response.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  // Login
  const login = async (formData) => {
    const response = await API.post("/auth/login", formData);
    setUser(response.data.user);
    return response.data;
  };

  // Register
  const register = async (formData) => {
    const response = await API.post("/auth/register", formData);
    setUser(response.data.user);
    return response.data;
  };

  // Logout
  const logout = async () => {
    await API.post("/auth/logout");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: Boolean(user),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
