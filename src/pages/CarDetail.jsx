import { useEffect, useState, useMemo } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaCalendar, FaCar, FaCheckCircle, FaEdit, FaTimesCircle, FaTrash } from 'react-icons/fa'
import AdminOnly from '../components/AdminOnly/AdminOnly'
import FeatureBadge from '../components/FeatureBadge/FeatureBadge'
import FavoriteButton from '../components/FavoriteButton/FavoriteButton'
import ShareButton from '../components/ShareButton/ShareButton'
import { useAuth } from '../context/AuthContext'
import { apiRequest, parseApiResponse } from '../utils/api'

function CarDetail({ admin = false }) {
  const { plate } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { auth, authFetch } = useAuth()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [startAt, setStartAt] = useState('')
  const [endAt, setEndAt] = useState('')
  const [reserving, setReserving] = useState(false)
  const [reservationMsg, setReservationMsg] = useState(null)

  const listPath = location.pathname.startsWith('/mis-autos') ? '/mis-autos' : '/admin/cars'

  useEffect(() => {
    const loadCar = async () => {
      setLoading(true)
      setError(null)
      try {
        const body = await parseApiResponse(
          await apiRequest(`/api/cars/${plate}`),
          'Auto no encontrado.'
        )
        setCar(body.data)
        setSelectedImage(0)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    loadCar()
  }, [plate])

  useEffect(() => {
    if (!car) return
    const url = `${window.location.origin}/car/${car.plate}`
    const title = `${car.brand} ${car.model} ${car.year || ''} - RentaCarNow`
    const desc = `${car.brand} ${car.model} - $${car.pricePerDay}/día${car.pricePerHour ? ` | $${car.pricePerHour}/hora` : ''} · ${car.category?.name || car.category || ''}`.trim()
    const image = car.imagePaths?.[0] ? (car.imagePaths[0].startsWith('http') ? car.imagePaths[0] : `${window.location.origin.replace(':5173', ':8081')}${car.imagePaths[0]}`) : ''
    document.title = title
    const setMeta = (selector, content) => {
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        const prop = selector.includes('property') ? 'property' : 'name'
        const name = selector.match(/"([^"]+)"/)?.[1]
        el.setAttribute(prop, name)
        document.head.appendChild(el)
      }
      el.setAttribute('content', content)
    }
    setMeta('meta[property="og:title"]', title)
    setMeta('meta[property="og:description"]', desc)
    setMeta('meta[property="og:url"]', url)
    setMeta('meta[property="og:type"]', 'product')
    if (image) setMeta('meta[property="og:image"]', image)
    setMeta('meta[name="twitter:card"]', 'summary_large_image')
    setMeta('meta[name="twitter:title"]', title)
    setMeta('meta[name="twitter:description"]', desc)
    if (image) setMeta('meta[name="twitter:image"]', image)
  }, [car])

  const snapToHalfHour = (value) => {
    if (!value || !value.includes('T')) return value
    const [date, time] = value.split('T')
    if (!time) return value
    const [hStr, mStr] = time.split(':')
    const h = Number(hStr)
    const m = Number(mStr)
    if (Number.isNaN(h) || Number.isNaN(m)) return value
    const snappedM = m < 30 ? '00' : '30'
    return `${date}T${String(h).padStart(2, '0')}:${snappedM}`
  }

  const isHalfHour = (d) => d.getMinutes() % 30 === 0 && d.getSeconds() === 0 && d.getMilliseconds() === 0

  const preview = useMemo(() => {
    if (!startAt || !endAt || !car?.pricePerHour) return null
    const start = new Date(startAt)
    const end = new Date(endAt)
    if (isNaN(start) || isNaN(end) || end <= start) return null
    const minutes = (end - start) / 60000
    let hours = Math.ceil(minutes / 60)
    if (hours < 1) hours = 1
    let total = hours * car.pricePerHour
    const durationHours = (end - start) / 3600000
    const hasDiscount = durationHours > 48
    if (hasDiscount) total = total * 0.9
    return { hours, total: total.toFixed(2), hasDiscount }
  }, [startAt, endAt, car])

  const handleDelete = async () => {
    if (!window.confirm(`¿Seguro que querés borrar ${car.brand} ${car.model} (${car.plate})?`)) return
    setDeleting(true)
    try {
      const res = await authFetch(`/api/cars/${car.id}`, { method: 'DELETE' })
      await parseApiResponse(res, 'Hubo un error al borrar el auto.')
      navigate(listPath)
    } catch (err) {
      window.alert(err.message)
      setDeleting(false)
    }
  }

  const handleReserve = async () => {
    if (!auth?.user || !car) return
    if (!startAt || !endAt) {
      setReservationMsg({ type: 'error', text: 'Seleccioná fecha y hora de inicio y fin.' })
      return
    }
    const start = new Date(startAt)
    const end = new Date(endAt)
    if (isNaN(start) || isNaN(end) || end <= start) {
      setReservationMsg({ type: 'error', text: 'La fecha de fin debe ser posterior al inicio.' })
      return
    }
    if (start < new Date()) {
      setReservationMsg({ type: 'error', text: 'La reserva no puede iniciar en el pasado.' })
      return
    }
    if (!isHalfHour(start) || !isHalfHour(end)) {
      setReservationMsg({ type: 'error', text: 'Las reservas son cada media hora (minutos 00 o 30).' })
      return
    }
    setReserving(true)
    setReservationMsg(null)
    try {
      const res = await authFetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startAt: start.toISOString(),
          endAt: end.toISOString(),
          carId: car.id,
          userId: auth.user.id,
        }),
      })
      await parseApiResponse(res, 'Hubo un error al reservar.')
      setReservationMsg({ type: 'success', text: 'Reserva creada correctamente.' })
      setStartAt('')
      setEndAt('')
    } catch (err) {
      setReservationMsg({ type: 'error', text: err.message })
    } finally {
      setReserving(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-xl text-gray-500">Cargando auto...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center">
        <p className="text-xl text-red-600">{error}</p>
        <Link to="/" className="text-violet-600 underline mt-2 inline-block">
          Volver al inicio
        </Link>
      </div>
    )
  }

  const images = car.imagePaths?.length > 0 ? car.imagePaths : [null]

  return (
    <AdminOnly enabled={admin}>
      <div className="max-w-4xl mx-auto">
      <Link
        to={admin ? listPath : '/'}
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-64 md:h-96 bg-gray-200 flex items-center justify-center overflow-hidden">
          {images[selectedImage] ? (
            <img
              src={images[selectedImage]}
              alt={`${car.brand} ${car.model}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaCar className="text-gray-400 text-8xl" />
          )}
        </div>

        {images.length > 1 && (
          <div className="flex gap-3 p-4 bg-gray-50">
            {images.map((image, index) => (
              <button
                key={image}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-16 rounded-lg overflow-hidden border-2 cursor-pointer ${
                  index === selectedImage
                    ? 'border-violet-500'
                    : 'border-transparent'
                }`}
              >
                <img src={image} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800">
                  {car.brand} {car.model}
                </h1>
                {!admin && <FavoriteButton carId={car.id} />}
                {!admin && <ShareButton car={car} size="md" />}
              </div>
              <p className="text-violet-600 text-2xl font-bold mt-2">
                ${car.pricePerDay}
                <span className="text-base text-gray-500 font-normal"> /día</span>
              </p>
            </div>
            {admin && (
              <div className="flex gap-2">
                <Link
                  to={`/admin/cars/${car.plate}/edit`}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer"
                >
                  <FaEdit />
                  Editar
                </Link>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-semibold rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaTrash />
                  Borrar
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2 text-gray-600">
              <FaCalendar className="text-violet-500" />
              <span>Año {car.year}</span>
            </div>
            {(car.category?.name || car.category) && (
              <div className="flex items-center gap-2 text-gray-600">
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-violet-100 text-violet-700">
                  {car.category?.name || car.category}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-gray-600">
              {car.available ? (
                <>
                  <FaCheckCircle className="text-green-500" />
                  <span>Disponible</span>
                </>
              ) : (
                <>
                  <FaTimesCircle className="text-red-500" />
                  <span>No disponible</span>
                </>
              )}
            </div>
          </div>

          {car.pricePerHour != null && (
            <p className="text-gray-500 mt-4">
              Tarifa por hora: ${car.pricePerHour} {preview?.hasDiscount && <span className="text-green-600 font-semibold">· 10% OFF &gt;48hs</span>}
            </p>
          )}

          {!admin && (
            <div className="mt-8">
              {reservationMsg && (
                <p
                  className={`mb-3 text-sm ${
                    reservationMsg.type === 'success'
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {reservationMsg.text}
                </p>
              )}
              {auth?.user ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex flex-col gap-1 text-sm text-gray-600 flex-1">
                      <span>Desde</span>
                      <input
                        type="datetime-local"
                        step="1800"
                        value={startAt}
                        onChange={(e) => setStartAt(snapToHalfHour(e.target.value))}
                        className="px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm text-gray-600 flex-1">
                      <span>Hasta</span>
                      <input
                        type="datetime-local"
                        step="1800"
                        value={endAt}
                        onChange={(e) => setEndAt(snapToHalfHour(e.target.value))}
                        className="px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
                      />
                    </label>
                  </div>
                  {preview && (
                    <p className="text-sm text-gray-700">
                      {preview.hours} hora(s) · Total: <span className="font-bold text-violet-600">${preview.total}</span>
                      {preview.hasDiscount && <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold">10% descuento aplicado</span>}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">Reservas cada 30 min (00 o 30). Se requiere 1h de limpieza entre reservas.</p>
                  <button
                    onClick={handleReserve}
                    disabled={!car.available || reserving || !startAt || !endAt}
                    className="px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-start"
                  >
                    {reserving ? 'Reservando...' : 'Reservar ahora'}
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Iniciá sesión para reservar este auto.
                </p>
              )}
            </div>
          )}

          {!admin && <ShareButton car={car} variant="floating" />}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Características del Auto</h2>
            {car.features && car.features.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {car.features.map((feature) => (
                  <FeatureBadge key={feature.id} feature={feature} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Este auto no tiene características cargadas.</p>
            )}
          </div>
        </div>
      </div>
    </div>
    </AdminOnly>
  )
}

export default CarDetail
