import { useEffect, useState, useCallback } from 'react'
import { Link, useParams } from 'react-router-dom'
import { FaArrowLeft, FaCalendarCheck, FaClock } from 'react-icons/fa'
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

const statusOptions = ['', 'PENDING', 'DISPATCHED', 'COMPLETED', 'CANCELLED']

export default function ReservationHistory() {
  const { userId: paramUserId } = useParams()
  const { auth, authFetch } = useAuth()
  const isAdmin = auth?.user?.role === 'ADMIN'
  const [userId, setUserId] = useState(paramUserId || '')
  const [status, setStatus] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [page, setPage] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const size = 10

  const buildUrl = useCallback(() => {
    const params = new URLSearchParams()
    if (userId) params.set('userId', userId)
    if (status) params.set('status', status)
    if (from) {
      const iso = new Date(from).toISOString()
      if (!isNaN(new Date(from))) params.set('from', iso)
    }
    if (to) {
      const iso = new Date(to).toISOString()
      if (!isNaN(new Date(to))) params.set('to', iso)
    }
    params.set('page', String(page))
    params.set('size', String(size))
    params.set('sort', 'startAt,desc')
    return `/api/reservations/history?${params.toString()}`
  }, [userId, status, from, to, page])

  const fetchPage = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await authFetch(buildUrl())
      const body = await parseApiResponse(res, 'Error al cargar historial.')
      setData(body.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [authFetch, buildUrl])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  useEffect(() => {
    if (paramUserId) setUserId(paramUserId)
  }, [paramUserId])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(0)
    fetchPage()
  }

  const handleClear = () => {
    setStatus('')
    setFrom('')
    setTo('')
    if (!paramUserId) setUserId('')
    setPage(0)
  }

  const content = data?.content || []
  const totalElements = data?.totalElements ?? 0
  const totalPages = data?.totalPages ?? 0
  const totalSpent = content.reduce((acc, r) => acc + (Number(r.totalPrice) || 0), 0)

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={isAdmin ? '/admin' : '/'} className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6">
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaCalendarCheck className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Historial de reservas</h1>
        </div>

        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
          {isAdmin && (
            <input
              type="number"
              placeholder="ID usuario"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 w-32"
            />
          )}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
          >
            <option value="">Todos los estados</option>
            {statusOptions.filter(Boolean).map((s) => (
              <option key={s} value={s}>{statusInfo[s].label}</option>
            ))}
          </select>
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            <span>Desde</span>
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-gray-600">
            <span>Hasta</span>
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </label>
          <div className="flex gap-2 items-end">
            <button type="submit" className="px-4 py-2 text-sm font-semibold rounded bg-violet-500 text-white hover:bg-violet-700 cursor-pointer">
              Filtrar
            </button>
            <button type="button" onClick={handleClear} className="px-4 py-2 text-sm font-semibold rounded border border-gray-300 text-gray-600 hover:bg-white cursor-pointer">
              Limpiar
            </button>
          </div>
        </form>

        {!loading && !error && (
          <div className="flex flex-wrap gap-3 mb-4 text-xs">
            <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 font-semibold">Total: {totalElements} reserva(s)</span>
            <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 font-semibold">Gastado en página: ${totalSpent.toFixed(2)}</span>
            {data && <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">Página {page + 1} de {totalPages || 1}</span>}
          </div>
        )}

        {loading && <p className="text-gray-500 text-center py-8">Cargando historial...</p>}

        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error}</p>
            <button onClick={fetchPage} className="px-6 py-2 rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer">
              Reintentar
            </button>
          </div>
        )}

        {!loading && !error && content.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay reservas para los filtros seleccionados.</p>
        )}

        {!loading && !error && content.length > 0 && (
          <>
            <ul className="divide-y divide-gray-100">
              {content.map((r) => {
                const hours = durationHours(r.startAt, r.endAt)
                const st = statusInfo[r.status] || statusInfo.PENDING
                return (
                  <li key={r.id} className="py-4">
                    <p className="font-semibold text-gray-800">
                      {r.car?.brand} {r.car?.model}
                      <span className="text-xs text-gray-400 ml-2">({r.car?.plate})</span>
                      <span className={`ml-2 text-xs px-2 py-0.5 rounded-full border font-semibold ${st.cls}`}>{st.label}</span>
                    </p>
                    <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                      <FaClock className="text-gray-400" />
                      {formatBA(r.startAt)} → {formatBA(r.endAt)}
                      {hours != null && <span className="text-gray-400 ml-2">({hours}h)</span>}
                    </p>
                    <p className="text-sm font-semibold text-violet-600 mt-1">
                      Total: ${r.totalPrice != null ? Number(r.totalPrice).toFixed(2) : '-'}
                      {hours > 48 && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">10% OFF</span>}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Creada: {formatBA(r.createdAt)}</p>
                    {r.car?.category && <p className="text-xs text-gray-500">Categoría: {r.car.category?.name || r.car.category}</p>}
                  </li>
                )
              })}
            </ul>

            {totalPages > 1 && (
              <div className="flex flex-wrap items-center justify-center gap-1 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="px-3 py-2 text-sm font-semibold rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                {Array.from({ length: totalPages }, (_, i) => i).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`px-3 py-2 text-sm font-semibold rounded-lg cursor-pointer ${
                      n === page ? 'bg-violet-500 text-white' : 'border-2 border-violet-500 text-violet-500 hover:bg-violet-50'
                    }`}
                  >
                    {n + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="px-3 py-2 text-sm font-semibold rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
