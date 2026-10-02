import { useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { parseApiResponse } from '../../utils/api'

function ContactOwnerButton({ carId, reservationId, size = 'md' }) {
  const { authFetch } = useAuth()
  const [loading, setLoading] = useState(false)

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-8 py-3 text-lg',
  }

  const handleClick = async () => {
    if (loading) return
    setLoading(true)
    try {
      const url = reservationId
        ? `/api/reservations/${reservationId}/contact`
        : `/api/cars/${carId}/contact`
      const res = await authFetch(url)
      const body = await parseApiResponse(res, 'No se pudo obtener el contacto.')
      if (body.data?.waLink) {
        window.open(body.data.waLink, '_blank', 'noopener,noreferrer')
      }
    } catch (err) {
      window.alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${sizes[size] || sizes.md}`}
    >
      <FaWhatsapp />
      {loading ? 'Abriendo...' : 'WhatsApp del dueño'}
    </button>
  )
}

export default ContactOwnerButton
