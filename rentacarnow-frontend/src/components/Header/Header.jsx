import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCar, FaSearch } from 'react-icons/fa'

function Header() {
  const [searchText, setSearchText] = useState('')
  const [pickupDate, setPickupDate] = useState('')
  const [dropoffDate, setDropoffDate] = useState('')

  const handleSearch = () => {
    console.log({ searchText, pickupDate, dropoffDate })
  }

  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
      <div className="px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <FaCar className="text-violet-500 text-2xl" />
            <span className="text-lg font-bold truncate shrink max-[320px]:hidden">RentaCarNow</span>
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
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-2 pb-3 px-4 md:px-0">
          <input
            type="text"
            placeholder="Buscar auto..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full md:w-52 px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <input
            type="date"
            value={pickupDate}
            onChange={(e) => setPickupDate(e.target.value)}
            className="w-full md:w-36 px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <input
            type="date"
            value={dropoffDate}
            onChange={(e) => setDropoffDate(e.target.value)}
            className="w-full md:w-36 px-3 py-1.5 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button
            onClick={handleSearch}
            className="w-full md:w-auto px-3 py-1.5 text-sm font-semibold rounded bg-violet-500 text-white hover:bg-violet-700 cursor-pointer flex items-center justify-center gap-1"
          >
            <FaSearch />
            <span>Buscar</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
