import { useNavigate } from 'react-router-dom'
import { FaShieldAlt, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const isAdmin = auth?.user?.role === 'ADMIN'

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-violet-500 p-6 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <FaUser className="text-violet-500 text-4xl" />
          </div>
        </div>

        <div className="p-6 md:p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {auth.user.name} {auth.user.lastName}
          </h1>
          <p className="text-gray-500 mt-1">{auth.user.email}</p>

          <span
            className={`inline-flex items-center gap-1 mt-4 px-4 py-1.5 text-sm font-semibold rounded-full ${
              isAdmin
                ? 'bg-violet-100 text-violet-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isAdmin ? <FaShieldAlt /> : <FaUser />}
            {isAdmin ? 'Administrador' : 'Usuario'}
          </span>

          <button
            onClick={handleLogout}
            className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
          >
            <FaSignOutAlt />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile