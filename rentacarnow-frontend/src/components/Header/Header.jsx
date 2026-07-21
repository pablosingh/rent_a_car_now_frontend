import { Link } from 'react-router-dom'
import { FaCar } from 'react-icons/fa'

function Header() {
  return (
    <header className="fixed top-0 left-0 w-full h-16 bg-white shadow-md flex items-center justify-between px-8 z-50">
      <Link to="/" className="flex items-center gap-2">
        <FaCar className="text-violet-500 text-2xl" />
        <span className="text-lg font-bold">RentaCarNow</span>
        <span className="text-sm text-gray-400 ml-1 hidden sm:inline">Tu viaje empieza aquí</span>
      </Link>
      <nav className="flex gap-2">
        <button className="px-4 py-1.5 text-sm font-semibold rounded border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer">
          Crear cuenta
        </button>
        <button className="px-4 py-1.5 text-sm font-semibold rounded border-2 border-violet-500 bg-violet-500 text-white hover:bg-violet-700 cursor-pointer">
          Iniciar sesión
        </button>
      </nav>
    </header>
  )
}

export default Header
