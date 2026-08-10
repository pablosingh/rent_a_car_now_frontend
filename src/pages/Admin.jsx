import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCarSide, FaCalendarCheck, FaShieldAlt } from 'react-icons/fa'

function Admin() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaShieldAlt className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Panel de administración</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            to="/admin/cars"
            className="flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer transition"
          >
            <FaCarSide className="text-3xl" />
            <span className="text-lg font-semibold">Lista de Autos</span>
          </Link>
          <Link
            to="/admin/reservations"
            className="flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer transition"
          >
            <FaCalendarCheck className="text-3xl" />
            <span className="text-lg font-semibold">Lista de Reservas</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Admin
