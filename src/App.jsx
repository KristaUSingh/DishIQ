import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from "./components/navbar/navbar";
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Login from './pages/Login/Login';
import ChefMenu from './pages/DashBoard/Chef/ChefMenu';
import Feedback from './pages/DashBoard/Chef/Feedback';
import Rating from './pages/DashBoard/Chef/Rating'
import DriverDashboard from './pages/DashBoard/Driver/DriverDashboard';
import ManagerDashboard from './pages/DashBoard/Manager/ManagerDashboard';
import Signup from './pages/Signup/Signup';
function App() {
  
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/order' element={<PlaceOrder/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/ChefMenu' element={<ChefMenu/>}/>
        <Route path='/Feedback' element={<Feedback/>}/>
        <Route path='/Rating' element={<Rating/>}/>
        <Route path='/ManagerDashboard' element={<ManagerDashboard/>}/>
        <Route path='/DriverDashboard' element={<DriverDashboard/>}/>
        <Route path='/Signup' element={<Signup/>}/>
      </Routes>
    </div>
  );
}

export default App;

