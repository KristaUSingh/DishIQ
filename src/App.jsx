import Navbar from "./components/navbar/navbar"

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        < Route path='/' element={<Home/>} />
        <Route path='/cart' element={<Cart/>} />
        <Route path='/order' element={<PlaceOrder/>}/>
      </Routes>
    </div>
  )
}

export default App
