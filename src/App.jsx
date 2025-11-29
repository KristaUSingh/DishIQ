import { Routes, Route } from 'react-router-dom';
import Navbar from "./components/navbar/navbar";
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './components/navbar/Footer/Footer';
import Login from './pages/Login/Login';
import ChefMenu from './pages/DashBoard/Chef/ChefMenu';
import Feedback from './pages/DashBoard/Chef/Feedback';
import Rating from './pages/DashBoard/Chef/Rating';
import DriverBid from './pages/DashBoard/Driver/DriverBid';
import DriverTransport from './pages/DashBoard/Driver/DriverTransport';
import DriverRating from './pages/DashBoard/Driver/DriverRating';
import UserRegistration from './pages/DashBoard/Manager/UserRegistration';
import UserComplaints from './pages/DashBoard/Manager/UserComplaints';
import StaffRating from './pages/DashBoard/Manager/StaffRating';
import Finances from './pages/DashBoard/Manager/Finances';
import Signup from './pages/Signup/Signup';
import RestaurantMenu from './pages/RestaurantMenu/RestaurantMenu';

function App() {
  return (
    <>
      <div className="app main-content-wrapper">
        <Navbar />

        <Routes>
          {/* Customer routes */}
          <Route path='/' element={<Home />} />
          <Route path="/restaurant/:restaurantName" element={<RestaurantMenu />} />
          <Route path='/cart' element={<Cart />} />
          <Route path='/order' element={<PlaceOrder />} />
          <Route path='/login' element={<Login />} />
          <Route path='/Signup' element={<Signup />} />

          {/* Chef routes */}
          <Route path='/chef/menu' element={<ChefMenu />} />
          <Route path='/chef/feedback' element={<Feedback />} />
          <Route path='/chef/rating' element={<Rating />} />

          {/* Manager routes */}
          <Route path='/manager/user' element={<UserRegistration />} />
          <Route path='/manager/complaints' element={<UserComplaints />} />
          <Route path='/manager/staffrating' element={<StaffRating />} />
          <Route path='/manager/finances' element={<Finances />} />

          {/* Driver routes — lowercase for consistency */}
          <Route path='/driver/bids' element={<DriverBid />} />
          <Route path='/driver/transport' element={<DriverTransport />} />
          <Route path='/driver/ratings' element={<DriverRating />} />
        </Routes>
      </div>

      <Footer />
    </>
  );
}

export default App;
