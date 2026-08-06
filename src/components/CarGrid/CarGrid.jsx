import { useEffect, useState } from 'react'
import CarCard from '../CarCard/CarCard'

const fetchAvailableCars = async () => {
  const res = await fetch('/api/cars')
  const body = await res.json()
  if (!res.ok || (body && body.status && body.status >= 400)) {
    throw new Error(body.message || 'Hubo un error al cargar los autos.')
  }
  return body.data.filter((car) => car.available)
}

function CarGrid() {
  const [cars, setCars] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    fetchAvailableCars()
      .then((data) => {
        if (active) setCars(data)
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

  const handleRetry = async () => {
    setLoading(true)
    setError(null)
    try {
      setCars(await fetchAvailableCars())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Nuestros autos
      </h2>

      {loading && (
        <p className="text-gray-500 text-center py-16">Cargando autos...</p>
      )}

      {error && (
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

      {!loading && !error && cars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cars.map((car) => (
            <CarCard key={car.id} car={car} />
          ))}
        </div>
      )}
    </section>
  )
}

export default CarGrid
