import { useEffect, useState } from 'react'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { parseApiResponse } from '../../utils/api'

function FavoriteButton({ carId, size = 'md' }) {
  const { auth, authFetch } = useAuth()
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!auth?.user || !carId) return
    let active = true
    authFetch(`/api/favorites/${carId}/check`)
      .then(parseApiResponse)
      .then((body) => {
        if (active) setIsFav(!!body.data.favorite)
      })
      .catch(() => {})
    return () => { active = false }
  }, [auth, carId, authFetch])

  const toggle = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    if (!auth?.user) return
    if (loading) return
    setLoading(true)
    try {
      if (isFav) {
        await authFetch(`/api/favorites/${carId}`, { method: 'DELETE' }).then((r) => parseApiResponse(r))
        setIsFav(false)
      } else {
        await authFetch(`/api/favorites/${carId}`, { method: 'POST' }).then((r) => parseApiResponse(r))
        setIsFav(true)
      }
    } catch {
      setIsFav((prev) => prev)
    } finally {
      setLoading(false)
    }
  }

  if (!auth?.user) return null

  const sizeClass = size === 'sm' ? 'w-7 h-7 text-sm' : 'w-8 h-8 text-base'
  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={isFav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={`${sizeClass} flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow border border-gray-200 hover:bg-white cursor-pointer disabled:opacity-50 ${isFav ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
    >
      {isFav ? <FaHeart /> : <FaRegHeart />}
    </button>
  )
}

export default FavoriteButton
