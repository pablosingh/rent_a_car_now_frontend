import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCarSide, FaCalendarCheck, FaPlus, FaUserFriends } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

function OwnerPanel() {
  const { auth } = useAuth()
  const isOwner = auth?.user?.role === 'OWNER'

  const tileClass =
    'flex flex-col items-center justify-center gap-3 px-6 py-10 rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer transition'

  return (
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
          <FaCarSide className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Mi panel</h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/mis-autos" className={tileClass}>
            <FaCarSide className="text-3xl" />
            <span className="text-lg font-semibold">Mis autos</span>
          </Link>
          <Link to="/reservas" className={tileClass}>
            <FaCalendarCheck className="text-3xl" />
            <span className="text-lg font-semibold">Reservas</span>
          </Link>
          <Link to="/crear" className={tileClass}>
            <FaPlus className="text-3xl" />
            <span className="text-lg font-semibold">Crear auto</span>
          </Link>
          {isOwner && (
            <Link to="/empleados" className={tileClass}>
              <FaUserFriends className="text-3xl" />
              <span className="text-lg font-semibold">Empleados</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}

export default OwnerPanel