import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import RequireAuth from './components/RequireAuth/RequireAuth'
import CarGrid from './components/CarGrid/CarGrid'
import CarDetail from './pages/CarDetail'
import CreateCar from './pages/CreateCar'
import Admin from './pages/Admin'
import AdminCars from './pages/AdminCars'
import AdminCarEdit from './pages/AdminCarEdit'
import AdminReservations from './pages/AdminReservations'
import Register from './pages/Register'
import Login from './pages/Login'
import Profile from './pages/Profile'

function App() {
  return (
    <>
      <Header />
      <main className="p-4 md:p-8 pt-[60px] md:pt-[60px]">
        <Routes>
          <Route path="/" element={<CarGrid />} />
          <Route path="/car/:plate" element={<CarDetail />} />
          <Route path="/crear" element={<RequireAuth admin><CreateCar /></RequireAuth>} />
          <Route path="/registro" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/admin" element={<RequireAuth admin><Admin /></RequireAuth>} />
          <Route path="/admin/cars" element={<RequireAuth admin><AdminCars /></RequireAuth>} />
          <Route path="/admin/cars/:plate" element={<RequireAuth admin><CarDetail admin /></RequireAuth>} />
          <Route path="/admin/cars/:plate/edit" element={<RequireAuth admin><AdminCarEdit /></RequireAuth>} />
          <Route path="/admin/reservations" element={<RequireAuth admin><AdminReservations /></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
