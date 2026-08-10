import { FaCar } from 'react-icons/fa'

function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-8 flex flex-col items-center gap-2 text-center md:flex-row md:justify-between md:text-left">
        <div className="flex items-center gap-2">
          <FaCar className="text-violet-400 text-2xl" />
          <span className="text-lg font-bold text-white">RentaCarNow</span>
        </div>
        <p className="text-sm text-gray-400">
          &copy; 2026 RentaCarNow. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

export default Footer
