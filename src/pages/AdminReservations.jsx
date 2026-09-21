import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaCalendarCheck, FaTrash, FaTruck, FaCheckCircle, FaBan, FaUndo } from 'react-icons/fa'
import AdminOnly from '../components/AdminOnly/AdminOnly'
import { useAuth } from '../context/AuthContext'
import { parseApiResponse } from '../utils/api'

function formatBA(instant) {
  if (!instant) return '-'
  return new Date(instant).toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function durationHours(startAt, endAt) {
  if (!startAt || !endAt) return null
  const ms = new Date(endAt) - new Date(startAt)
  if (isNaN(ms) || ms <= 0) return null
  return Math.ceil(ms / 3600000)
}

const statusInfo = {
  PENDING: { label: 'Pendiente', cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  DISPATCHED: { label: 'Despachada', cls: 'bg-blue-100 text-blue-700 border-blue-200' },
  COMPLETED: { label: 'Completada', cls: 'bg-green-100 text-green-700 border-green-200' },
  CANCELLED: { label: 'Cancelada', cls: 'bg-red-100 text-red-700 border-red-200' },
}

function AdminReservations({ title = 'Reservas', responsive = true }) {
  const location = useLocation()
  const { auth, authFetch } = useAuth()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [actingId, setActingId] = useState(null)

  const role = auth?.user?.role
  const isStaff = role === 'OWNER' || role === 'EMPLOYEE' || role === 'ADMIN'

  const backTo = location.pathname.startsWith('/admin')
    ? '/admin'
    : location.pathname.startsWith('/panel')
      ? '/panel'
      : '/'

  const fetchReservations = useCallback(
    () =>
      authFetch('/api/reservations')
        .then(parseApiResponse)
        .then((body) => body.data || []),
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

  const handleAction = async (reservation, action) => {
    const labels = { dispatch: 'despachar', complete: 'completar', cancel: 'cancelar', revert: 'revertir' }
    const confirmMsg =
      action === 'dispatch'
        ? `¿Despachar la reserva #${reservation.id} (${reservation.car?.plate})?`
        : action === 'complete'
          ? `¿Marcar como completada la reserva #${reservation.id}?`
          : action === 'cancel'
            ? `¿Cancelar la reserva #${reservation.id}?`
            : `¿Revertir la reserva #${reservation.id} al estado anterior?`
    if (!window.confirm(confirmMsg)) return
    setActingId(reservation.id)
    try {
      const res = await authFetch(`/api/reservations/${reservation.id}/${action}`, { method: 'POST' })
      const body = await parseApiResponse(res, `Error al ${labels[action]} la reserva.`)
      setReservations((prev) => prev.map((r) => (r.id === reservation.id ? body.data : r)))
    } catch (err) {
      window.alert(err.message)
    } finally {
      setActingId(null)
    }
  }

  const handleDelete = async (reservation) => {
    if (!window.confirm('¿Seguro que querés borrar esta reserva?')) return
    setActingId(reservation.id)
    try {
      const res = await authFetch(`/api/reservations/${reservation.id}`, { method: 'DELETE' })
      await parseApiResponse(res, 'Hubo un error al borrar la reserva.')
      setReservations((prev) => prev.filter((r) => r.id !== reservation.id))
    } catch (err) {
      window.alert(err.message)
    } finally {
      setActingId(null)
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
              {reservations.map((r) => {
                const hours = durationHours(r.startAt, r.endAt)
                const hasDiscount = hours != null && hours > 48
                const st = statusInfo[r.status] || statusInfo.PENDING
                const isPending = r.status === 'PENDING' || !r.status
                const isDispatched = r.status === 'DISPATCHED'
                const isCompleted = r.status === 'COMPLETED'
                const isCancelled = r.status === 'CANCELLED'
                const canDispatch = isPending && isStaff
                const canComplete = isDispatched && isStaff
                const canCancel = !isCompleted && !isCancelled && (isStaff || isPending)
                const canRevert = (isDispatched || isCompleted || isCancelled) && isStaff
                const busy = actingId === r.id
                return (
                <li key={r.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex-1 min-w-[220px]">
                    <p className="font-semibold text-gray-800">
                      {r.car?.brand} {r.car?.model}
                      <span className="text-xs text-gray-400 ml-2">({r.car?.plate})</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border font-semibold ${st.cls}`}>{st.label}</span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Cliente: {r.user?.name} {r.user?.lastName} ({r.user?.email})
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      {formatBA(r.startAt)} → {formatBA(r.endAt)}
                      {hours != null && <span className="text-gray-400 ml-2">({hours}h)</span>}
                    </p>
                    <p className="text-sm font-semibold text-violet-600 mt-1">
                      Total: ${r.totalPrice != null ? Number(r.totalPrice).toFixed(2) : '-'}
                      {hasDiscount && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">10% OFF &gt;48h</span>}
                    </p>
                    {r.dispatchedAt && (
                      <p className="text-xs text-blue-600 mt-1">
                        Despachada: {formatBA(r.dispatchedAt)}{r.dispatchedBy ? ` por ${r.dispatchedBy.name} ${r.dispatchedBy.lastName}` : ''}
                      </p>
                    )}
                    {r.completedAt && (
                      <p className="text-xs text-green-600">
                        Completada: {formatBA(r.completedAt)}{r.completedBy ? ` por ${r.completedBy.name} ${r.completedBy.lastName}` : ''}
                      </p>
                    )}
                    {r.cancelledAt && (
                      <p className="text-xs text-red-600">
                        Cancelada: {formatBA(r.cancelledAt)}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {canDispatch && (
                      <button
                        onClick={() => handleAction(r, 'dispatch')}
                        disabled={busy}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <FaTruck className="text-xs" />
                        Despachar
                      </button>
                    )}
                    {canComplete && (
                      <button
                        onClick={() => handleAction(r, 'complete')}
                        disabled={busy}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <FaCheckCircle className="text-xs" />
                        Completar
                      </button>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => handleAction(r, 'cancel')}
                        disabled={busy}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-amber-400 text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <FaBan className="text-xs" />
                        Cancelar
                      </button>
                    )}
                    {canRevert && (
                      <button
                        onClick={() => handleAction(r, 'revert')}
                        disabled={busy}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <FaUndo className="text-xs" />
                        Revertir
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r)}
                      disabled={busy}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded border-2 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaTrash />
                      Borrar
                    </button>
                  </div>
                </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </AdminOnly>
  )
}

export default AdminReservations
