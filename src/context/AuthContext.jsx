import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// Provider wrapper for the entire app
export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(null);

  // Load auth from localStorage on page load
  useEffect(() => {
    const storedAuth = localStorage.getItem("auth");
    if (storedAuth) {
      try {
        setAuth(JSON.parse(storedAuth));
      } catch (error) {
        console.error("Error parsing stored auth:", error);
        localStorage.removeItem("auth");
      }
    }
  }, []);

  // Save auth to localStorage whenever it changes
  useEffect(() => {
    if (auth) {
      localStorage.setItem("auth", JSON.stringify(auth));
    } else {
      localStorage.removeItem("auth"); // for logout
    }
  }, [auth]);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook so any component can call useAuth()
export function useAuth() {
  return useContext(AuthContext);
}
