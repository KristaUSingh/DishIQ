import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from "./components/navbar/navbar";
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Footer from './components/navbar/Footer/Footer';
import Login from './pages/Login/Login';
import ChefMenu from './pages/DashBoard/Chef/ChefMenu';
import Feedback from './pages/DashBoard/Chef/Feedback';
import Rating from './pages/DashBoard/Chef/Rating'
import DriverDashboard from './pages/DashBoard/Driver/DriverDashboard';
import UserRegistration from './pages/DashBoard/Manager/UserRegistration';
import UserComplaints from './pages/DashBoard/Manager/UserComplaints';
import StaffRating from './pages/DashBoard/Manager/StaffRating';
import Finances from './pages/DashBoard/Manager/Finances';
import Signup from './pages/Signup/Signup';
function App() {
  
  return (
  <>
    <div className="app main-content-wrapper">
      <Navbar />
      <Routes>
        {/*Customer/Visitor route */}
        <Route path='/' element={<Home/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/order' element={<PlaceOrder/>}/>
        <Route path='/login' element={<Login/>}/>

        {/*Chef route */}
        <Route path='/ChefMenu' element={<ChefMenu/>}/>
        <Route path='/Feedback' element={<Feedback/>}/>
        <Route path='/Rating' element={<Rating/>}/>

        {/*Manager route */}
        <Route path='/manager/user' element={<UserRegistration/>}/>
        <Route path='/manager/complaints' element={<UserComplaints/>}/>
        <Route path='/manager/staffrating' element={<StaffRating/>}/>
        <Route path='/manager/finances' element={<Finances/>}/>

        {/*Driver route */}
        <Route path='/DriverDashboard' element={<DriverDashboard/>}/>

        <Route path='/Signup' element={<Signup/>}/>

      </Routes>
    </div>
    <Footer />
  </> 
    
  )
}

export default App;

