import { Link } from 'react-router-dom'
import { FaArrowLeft, FaSignInAlt } from 'react-icons/fa'

function Login() {
  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400'

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6">
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaSignInAlt className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Iniciar sesión</h1>
        </div>

        <div className="mb-4 px-4 py-3 text-sm rounded bg-amber-50 text-amber-700 border border-amber-200">
          Esta pantalla aún no está disponible. Próximamente podrás iniciar sesión.
        </div>

        <form className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input type="password" className={inputClass} />
          </div>
          <button
            type="button"
            disabled
            className="w-full px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white opacity-50 cursor-not-allowed"
          >
            Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login