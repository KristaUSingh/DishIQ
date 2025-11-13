import { Routes, Route } from 'react-router-dom'
import Navbar from "./components/navbar/navbar"
import Home from './pages/Home/Home';
import Cart from './pages/Cart/Cart';
import PlaceOrder from './pages/PlaceOrder/PlaceOrder';
import Login from './pages/Login/Login';
import ManagerDashboard from './pages/DashBoard/Manager/ManagerDashboard';
import DriverDashboard from './pages/DashBoard/Driver/DriverDashboard';
import ChefDashboard from './pages/DashBoard/Chef/ChefDashboard';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path='/' element={<Home/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/order' element={<PlaceOrder/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/DriverDashboard' element={<DriverDashboard/>}/>
        <Route path='/ManagerDashboard' element={<ManagerDashboard/>}/>
        <Route path='/ChefDashboard' element={<ChefDashboard/>}/>
      </Routes>
    </div>
  )
}

export default App;
