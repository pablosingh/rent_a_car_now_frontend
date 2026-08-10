import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCalendarCheck } from 'react-icons/fa'

function AdminReservations() {
  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaCalendarCheck className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Lista de Reservas</h1>
        </div>
        <p className="text-gray-500">Próximamente</p>
      </div>
    </div>
  )
}

export default AdminReservations
