import { useEffect, useState } from 'react'
import CarCard from '../CarCard/CarCard'

const PAGE_SIZE = 10

const fetchCarsPage = async (page) => {
  const res = await fetch(`/api/cars?page=${page}&size=${PAGE_SIZE}&available=true`)
  const body = await res.json()
  if (!res.ok || (body && body.status && body.status >= 400)) {
    throw new Error(body.message || 'Hubo un error al cargar los autos.')
  }
  return body.data
}

function CarGrid() {
  const [cars, setCars] = useState([])
  const [page, setPage] = useState(0)
  const [hasNext, setHasNext] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    fetchCarsPage(0)
      .then((data) => {
        if (!active) return
        setCars(data.content)
        setPage(data.page)
        setHasNext(data.hasNext)
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
  }, [])

  const handleLoadMore = async () => {
    const nextPage = page + 1
    setLoadingMore(true)
    setError(null)
    try {
      const data = await fetchCarsPage(nextPage)
      setCars((prev) => [...prev, ...data.content])
      setPage(data.page)
      setHasNext(data.hasNext)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    fetchCarsPage(0)
      .then((data) => {
        setCars(data.content)
        setPage(data.page)
        setHasNext(data.hasNext)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <section className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Nuestros autos
      </h2>

      {loading && (
        <p className="text-gray-500 text-center py-16">Cargando autos...</p>
      )}

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
        <p className="text-gray-500 text-center py-16">
          No hay autos disponibles por el momento.
        </p>
      )}

      {!loading && cars.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>

          {hasNext && (
            <div className="flex justify-center mt-10">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? 'Cargando...' : 'Cargar más'}
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default CarGrid
