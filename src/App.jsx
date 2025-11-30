import { Routes, Route } from "react-router-dom";
import Navbar from "./components/navbar/navbar";
import Home from "./pages/Home/Home";
import Cart from "./pages/Cart/Cart";
import PlaceOrder from "./pages/PlaceOrder/PlaceOrder";
import Footer from "./components/navbar/Footer/Footer";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import OrderHistory from "./pages/OrderHistory/OrderHistory";
import CustomerFeedback from "./pages/CustomerFeedback/CustomerFeedback";

import ChefMenu from "./pages/DashBoard/Chef/ChefMenu";
import ChefOrders from "./pages/DashBoard/Chef/ChefOrders";
import Feedback from "./pages/DashBoard/Chef/Feedback";
import Rating from "./pages/DashBoard/Chef/Rating";

import DriverBid from "./pages/DashBoard/Driver/DriverBid";
import DriverTransport from "./pages/DashBoard/Driver/DriverTransport";
import ReviewCustomers from "./pages/DashBoard/Driver/ReviewCustomers";
import DriverRating from "./pages/DashBoard/Driver/DriverRating";

import UserRegistration from "./pages/DashBoard/Manager/UserRegistration";
import ManageBids from "./pages/DashBoard/Manager/ManageBids";
import ManagerCC from "./pages/DashBoard/Manager/ManagerCC";
import StaffRating from "./pages/DashBoard/Manager/StaffRating";
import ManagerKBReview from "./pages/DashBoard/Manager/ManagerKBReview";
import Finances from "./pages/DashBoard/Manager/Finances";

import RestaurantMenu from "./pages/RestaurantMenu/RestaurantMenu";

import { useAuth } from "./context/useAuth";


function App() {
  const { auth } = useAuth(); // <-- GLOBAL AUTH HERE

  return (
    <>
      <div className="app main-content-wrapper">
        <Navbar />

        <Routes>
          {/* ---------------------- CUSTOMER ROUTES ---------------------- */}

          <Route path="/" element={<Home />} />
          <Route path="/restaurant/:restaurantName" element={<RestaurantMenu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/order" element={<PlaceOrder />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path='/order-history' element={<OrderHistory />} />
          <Route path='/customer-feedback' element={<CustomerFeedback />} />


          {/* ---------------------- CHEF ROUTES ---------------------- */}

          <Route
            path="/chef/menu"
            element={<ChefMenu restaurant_name={auth?.restaurant_name} />}
          />

          <Route
            path="/chef/orders"
            element={<ChefOrders restaurant_name={auth?.restaurant_name} />}
          />

          <Route
            path="/chef/feedback"
            element={<Feedback restaurant_name={auth?.restaurant_name} />}
          />

          <Route
            path="/chef/rating"
            element={<Rating restaurant_name={auth?.restaurant_name} />}
          />

          {/* ---------------------- MANAGER ROUTES ---------------------- */}

          <Route path="/manager/user" element={<UserRegistration />} />
          <Route path="/manager/manage-bids" element={<ManageBids />} />
          <Route path="/manager/compliment-complaint" element={<ManagerCC />} />
          <Route path="/manager/staffrating" element={<StaffRating />} />
          <Route path="/manager/finances" element={<Finances />} />
          <Route path="/manager/kb-review" element={<ManagerKBReview />} />

          {/* ---------------------- DRIVER ROUTES ---------------------- */}

          <Route path="/driver/bids" element={<DriverBid />} />
          <Route path="/driver/transport" element={<DriverTransport />} />
          <Route path="/driver/review-customers" element={<ReviewCustomers />} />
          <Route path="/driver/ratings" element={<DriverRating />} />

        </Routes>
      </div>

      <Footer />
    </>
  );
}

export default App;
