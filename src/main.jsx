import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import StoreContextProvider from "./context/StoreContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";  // <-- ADD THIS

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>                     {/* <-- WRAP APP IN AUTH */}
        <StoreContextProvider>
          <App />
        </StoreContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
