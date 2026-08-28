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
import AdminVerifyOwners from './pages/AdminVerifyOwners'
import AdminUsers from './pages/AdminUsers'
import AdminFeatures from './pages/AdminFeatures'
import OwnerPanel from './pages/OwnerPanel'
import OwnerEmployees from './pages/OwnerEmployees'
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
          <Route path="/registro" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          <Route path="/mis-reservas" element={<RequireAuth><AdminReservations responsive={false} /></RequireAuth>} />

          <Route path="/admin" element={<RequireAuth roles={['ADMIN']}><Admin /></RequireAuth>} />
          <Route path="/admin/owners" element={<RequireAuth roles={['ADMIN']}><AdminVerifyOwners /></RequireAuth>} />
          <Route path="/admin/users" element={<RequireAuth roles={['ADMIN']}><AdminUsers /></RequireAuth>} />
          <Route path="/admin/features" element={<RequireAuth roles={['ADMIN']}><AdminFeatures /></RequireAuth>} />
          <Route path="/admin/cars" element={<RequireAuth roles={['ADMIN']}><AdminCars scope="all" /></RequireAuth>} />
          <Route path="/admin/cars/:plate" element={<RequireAuth roles={['ADMIN']}><CarDetail admin /></RequireAuth>} />
          <Route path="/admin/cars/:plate/edit" element={<RequireAuth roles={['ADMIN']}><AdminCarEdit /></RequireAuth>} />

          <Route path="/panel" element={<RequireAuth roles={['OWNER', 'EMPLOYEE']}><OwnerPanel /></RequireAuth>} />
          <Route path="/mis-autos" element={<RequireAuth roles={['OWNER', 'EMPLOYEE']}><AdminCars scope="mine" /></RequireAuth>} />
          <Route path="/mis-autos/:plate" element={<RequireAuth roles={['OWNER', 'EMPLOYEE']}><CarDetail admin /></RequireAuth>} />
          <Route path="/mis-autos/:plate/edit" element={<RequireAuth roles={['OWNER', 'EMPLOYEE']}><AdminCarEdit /></RequireAuth>} />

          <Route path="/reservas" element={<RequireAuth roles={['ADMIN', 'OWNER', 'EMPLOYEE']}><AdminReservations /></RequireAuth>} />
          <Route path="/crear" element={<RequireAuth roles={['ADMIN', 'OWNER', 'EMPLOYEE']}><CreateCar /></RequireAuth>} />
          <Route path="/empleados" element={<RequireAuth roles={['ADMIN', 'OWNER']}><OwnerEmployees /></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

export default App