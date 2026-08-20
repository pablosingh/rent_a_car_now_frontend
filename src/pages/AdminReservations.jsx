import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaCalendarCheck, FaTrash } from 'react-icons/fa'
import AdminOnly from '../components/AdminOnly/AdminOnly'
import { useAuth } from '../context/AuthContext'

function AdminReservations({ title = 'Reservas', responsive = true }) {
  const location = useLocation()
  const { authFetch } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const backTo = location.pathname.startsWith('/admin')
    ? '/admin'
    : location.pathname.startsWith('/panel')
      ? '/panel'
      : '/'

  const fetchReservations = useCallback(
    () =>
      authFetch('/api/reservations')
        .then((res) => res.json().then((body) => ({ res, body })))
        .then(({ res, body }) => {
          if (!res.ok || (body && body.status && body.status >= 400)) {
            throw new Error(body.message || 'Hubo un error al cargar las reservas.')
          }
          return body.data || []
        }),
    [authFetch]
  )

  const load = () => {
    setLoading(true)
    setError(null)
    fetchReservations()
      .then(setReservations)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    let active = true
    fetchReservations()
      .then((data) => {
        if (active) setReservations(data)
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
  }, [fetchReservations])

  const handleDelete = async (reservation) => {
    if (!window.confirm('¿Seguro que querés borrar esta reserva?')) return
    setDeleting(true)
    try {
      const res = await authFetch(`/api/reservations/${reservation.id}`, { method: 'DELETE' })
      const body = await res.json()
      if (!res.ok || (body && body.status && body.status >= 400)) {
        throw new Error(body.message || 'Hubo un error al borrar la reserva.')
      }
      setReservations((prev) => prev.filter((r) => r.id !== reservation.id))
    } catch (err) {
      window.alert(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminOnly enabled={responsive}>
      <div className="max-w-4xl mx-auto">
        <Link
          to={backTo}
          className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
        >
          <FaArrowLeft />
          Volver
        </Link>

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center gap-2 mb-6">
            <FaCalendarCheck className="text-violet-500 text-2xl" />
            <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          </div>

          {loading && <p className="text-gray-500 text-center py-8">Cargando reservas...</p>}

          {error && !loading && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={load}
                className="px-6 py-2 rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && reservations.length === 0 && (
            <p className="text-gray-500 text-center py-8">No hay reservas.</p>
          )}

          {!loading && reservations.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {reservations.map((r) => (
                <li key={r.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-800">
                      {r.car?.brand} {r.car?.model}
                      <span className="text-xs text-gray-400 ml-2">({r.car?.plate})</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Cliente: {r.user?.name} {r.user?.lastName} ({r.user?.email})
                    </p>
                    <p className="text-xs text-gray-400">Duración: {r.durationInDays} día(s)</p>
                  </div>
                  <button
                    onClick={() => handleDelete(r)}
                    disabled={deleting}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded border-2 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTrash />
                    Borrar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminOnly>
  )
}

export default AdminReservations