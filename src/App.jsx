import { Routes, Route } from 'react-router-dom'
import Header from './components/Header/Header'
import Footer from './components/Footer/Footer'
import CarGrid from './components/CarGrid/CarGrid'
import CarDetail from './pages/CarDetail'
import CreateCar from './pages/CreateCar'
import Admin from './pages/Admin'
import AdminCars from './pages/AdminCars'
import AdminReservations from './pages/AdminReservations'

function App() {
  return (
    <>
      <Header />
      <main className="p-4 md:p-8 pt-[60px] md:pt-[60px]">
        <Routes>
          <Route path="/" element={<CarGrid />} />
          <Route path="/car/:plate" element={<CarDetail />} />
          <Route path="/crear" element={<CreateCar />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/cars" element={<AdminCars />} />
          <Route path="/admin/reservations" element={<AdminReservations />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App
