import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCarSide, FaCalendarCheck, FaPlus, FaShieldAlt, FaUserCheck, FaUserFriends } from 'react-icons/fa'
import AdminOnly from '../components/AdminOnly/AdminOnly'

function Admin() {
  return (
    <AdminOnly>
      <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaShieldAlt className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Panel de administración</h1>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Link
            to="/admin/cars"
            className="flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer transition"
          >
            <FaCarSide className="text-3xl" />
            <span className="text-lg font-semibold">Lista de Autos</span>
          </Link>
          <Link
            to="/reservas"
            className="flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer transition"
          >
            <FaCalendarCheck className="text-3xl" />
            <span className="text-lg font-semibold">Lista de Reservas</span>
          </Link>
          <Link
            to="/crear"
            className="flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer transition"
          >
            <FaPlus className="text-3xl" />
            <span className="text-lg font-semibold">Crear auto</span>
          </Link>
          <Link
            to="/admin/owners"
            className="flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer transition"
          >
            <FaUserCheck className="text-3xl" />
            <span className="text-lg font-semibold">Verificar dueños</span>
          </Link>
          <Link
            to="/empleados"
            className="flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer transition"
          >
            <FaUserFriends className="text-3xl" />
            <span className="text-lg font-semibold">Empleados</span>
          </Link>
        </div>
      </div>
      </div>
    </AdminOnly>
  )
}

export default Admin
