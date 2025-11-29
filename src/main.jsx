import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter, 
  RouterProvider,
} from 'react-router-dom' 

// Navbar
import App from "./App.jsx";
import "./index.css";

// Pages
import HomePage from './pages/Home/Home.jsx'
import RestaurantsPage from './pages/RestaurantPage/RestaurantsPage.jsx'
import ContactPage from './pages/ContactUs/ContactPage.jsx'
import LoginPage from './pages/Login/Login.jsx'
import RegistrationPage from './pages/Signup/Signup.jsx'

// Context Providers
import StoreContextProvider from "./context/StoreContext.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";  // <-- ADD THIS

// Core router def w paths
const router = createBrowserRouter([
  {
    path: '/',
    element: <App />, // App is the Layout component (Navbar, Outlet)
    children: [
      {
        index: true, 
        element: <HomePage />, 
      },
      {
        path: 'restaurants', 
        element: <RestaurantsPage />,
      },
      {
        path: 'contact', 
        element: <ContactPage />,
      },
      {
        path: 'login', 
        element: <LoginPage />,
      },
      {
        path: 'register', 
        element: <RegistrationPage />,
      },
    ],
  },
  // Protected routes (e.g., /chef, /manager) need to add
]);

// Render app
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider> 
      <StoreContextProvider>
        {/* FIX: Render the router object using RouterProvider */}
        <RouterProvider router={router} />
      </StoreContextProvider>
    </AuthProvider>
  </React.StrictMode>
);
