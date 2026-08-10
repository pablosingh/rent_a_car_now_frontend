import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaEdit, FaTrash, FaCar } from 'react-icons/fa'
import AdminOnly from '../components/AdminOnly/AdminOnly'

const API_URL = '/api/cars'
const PAGE_SIZE = 10

const fetchCars = async (page) => {
  const res = await fetch(`${API_URL}?page=${page}&size=${PAGE_SIZE}`)
  const body = await res.json()
  if (!res.ok || (body && body.status && body.status >= 400)) {
    throw new Error(body.message || 'Hubo un error al cargar los autos.')
  }
  return body.data
}

function AdminCars() {
  const [cars, setCars] = useState([])
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    let active = true
    fetchCars(currentPage)
      .then((data) => {
        if (!active) return
        setCars(data.content)
        setTotalPages(data.totalPages)
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
  }, [currentPage])

  const handleGoTo = (targetPage) => {
    if (targetPage < 0 || targetPage >= totalPages || targetPage === currentPage) return
    setCurrentPage(targetPage)
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    fetchCars(currentPage)
      .then((data) => {
        setCars(data.content)
        setTotalPages(data.totalPages)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }
  const handleDelete = async (car) => {
    if (!window.confirm(`¿Seguro que querés borrar ${car.brand} ${car.model} (${car.plate})?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`${API_URL}/${car.id}`, { method: 'DELETE' })
      const body = await res.json()
      if (!res.ok || (body && body.status && body.status >= 400)) {
        throw new Error(body.message || 'Hubo un error al borrar el auto.')
      }
      if (cars.length === 1 && currentPage > 0) {
        setCurrentPage((prev) => prev - 1)
      } else {
        setCars((prev) => prev.filter((c) => c.id !== car.id))
      }
    } catch (err) {
      window.alert(err.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <AdminOnly>
      <section className="max-w-7xl mx-auto">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-4"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Lista de Autos</h2>

      {loading && <p className="text-gray-500 text-center py-16">Cargando autos...</p>}

      {error && !loading && (
        <div className="text-center py-16">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-2 rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      )}

      {!loading && !error && cars.length === 0 && (
        <p className="text-gray-500 text-center py-16">No hay autos cargados.</p>
      )}

      {!loading && cars.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {cars.map((car) => (
            <div
              key={car.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col"
            >
              <Link to={`/admin/cars/${car.plate}`} className="block">
                <div className="h-24 bg-gray-200 flex items-center justify-center overflow-hidden">
                  {car.imagePaths?.length > 0 ? (
                    <img
                      src={car.imagePaths[0]}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FaCar className="text-gray-400 text-3xl" />
                  )}
                </div>
              </Link>
              <div className="p-3 flex flex-col gap-1 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/admin/cars/${car.plate}`} className="min-w-0">
                    <h3 className="font-semibold text-sm truncate hover:text-violet-600">
                      {car.brand} {car.model}
                    </h3>
                  </Link>
                  <span
                    className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                      car.available
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {car.available ? 'Disponible' : 'No disponible'}
                  </span>
                </div>
                <p className="text-gray-500 text-xs">{car.year}</p>
                <p className="text-violet-600 font-semibold text-sm">
                  ${car.pricePerDay}
                  <span className="text-[10px] text-gray-500 font-normal"> /día</span>
                </p>
                <p className="text-gray-400 text-[10px]">{car.plate}</p>
                <div className="flex gap-2 mt-auto pt-2">
                  <Link
                    to={`/admin/cars/${car.plate}/edit`}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs font-semibold rounded border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer"
                  >
                    <FaEdit />
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(car)}
                    disabled={deleting}
                    className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs font-semibold rounded border-2 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FaTrash />
                    Borrar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-1 mt-10">
          <button
            onClick={() => handleGoTo(currentPage - 1)}
            disabled={currentPage === 0 || loading}
            className="px-3 py-2 text-sm font-semibold rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          {Array.from({ length: totalPages }, (_, i) => i).map((n) => (
            <button
              key={n}
              onClick={() => handleGoTo(n)}
              disabled={loading}
              className={`px-3 py-2 text-sm font-semibold rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                n === currentPage
                  ? 'bg-violet-500 text-white'
                  : 'border-2 border-violet-500 text-violet-500 hover:bg-violet-50'
              }`}
            >
              {n + 1}
            </button>
          ))}
          <button
            onClick={() => handleGoTo(currentPage + 1)}
            disabled={currentPage === totalPages - 1 || loading}
            className="px-3 py-2 text-sm font-semibold rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Siguiente
          </button>
        </div>
      )}
    </section>
    </AdminOnly>
  )
}

export default AdminCars
