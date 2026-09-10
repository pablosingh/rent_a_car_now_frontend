import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaHeart } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { parseApiResponse } from '../utils/api'
import CarCard from '../components/CarCard/CarCard'

function Favorites() {
  const { authFetch } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = () => {
    authFetch('/api/favorites')
      .then((r) => parseApiResponse(r, 'Error al cargar favoritos.'))
      .then((body) => setFavorites(body.data || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let active = true
    authFetch('/api/favorites')
      .then((r) => parseApiResponse(r, 'Error al cargar favoritos.'))
      .then((body) => {
        if (active) setFavorites(body.data || [])
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [authFetch])

  return (
    <div className="max-w-7xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6">
        <FaArrowLeft />
        Volver
      </Link>
      <div className="flex items-center gap-2 mb-6">
        <FaHeart className="text-red-500 text-2xl" />
        <h1 className="text-2xl font-bold text-gray-800">Mis favoritos</h1>
      </div>

      {loading && <p className="text-gray-500 text-center py-16">Cargando favoritos...</p>}
      {error && !loading && (
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={load} className="px-6 py-2 rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer">Reintentar</button>
        </div>
      )}
      {!loading && !error && favorites.length === 0 && (
        <p className="text-gray-500 text-center py-16">No tenés favoritos aún. Agregá autos con el corazón.</p>
      )}
      {!loading && !error && favorites.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favorites.map((fav) => (
            <CarCard key={fav.id} car={fav.car} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Favorites
