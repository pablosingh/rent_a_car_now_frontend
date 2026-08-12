import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import CarGrid from './components/CarGrid/CarGrid'
import CarDetail from './pages/CarDetail'
import CreateCar from './pages/CreateCar'
import Admin from './pages/Admin'
import AdminCars from './pages/AdminCars'
import AdminCarEdit from './pages/AdminCarEdit'
import AdminReservations from './pages/AdminReservations'
import Register from './pages/Register'
import Login from './pages/Login'

function App() {
  return (
    <>
      <Header />
      <main className="p-4 md:p-8 pt-[60px] md:pt-[60px]">
        <Routes>
          <Route path="/" element={<CarGrid />} />
          <Route path="/car/:plate" element={<CarDetail />} />
          <Route path="/crear" element={<CreateCar />} />
          <Route path="/registro" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/cars" element={<AdminCars />} />
          <Route path="/admin/cars/:plate" element={<CarDetail admin />} />
          <Route path="/admin/cars/:plate/edit" element={<AdminCarEdit />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
