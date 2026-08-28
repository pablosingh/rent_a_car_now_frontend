import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CarCard from '../CarCard/CarCard'
import { CATEGORIES } from '../../constants/categories'
import { apiRequest, parseApiResponse } from '../../utils/api'

const PAGE_SIZE = 10

const buildCategoryParam = (category) =>
  category ? `&category=${encodeURIComponent(category)}` : ''

const buildSearchParam = (q) =>
  q ? `&q=${encodeURIComponent(q)}` : ''

const buildFeatureParam = (feature) =>
  feature ? `&feature=${encodeURIComponent(feature)}` : ''

const fetchCarsPage = async (page, category, q, feature) => {
  const body = await parseApiResponse(
    await apiRequest(`/api/cars?page=${page}&size=${PAGE_SIZE}&available=true${buildCategoryParam(category)}${buildSearchParam(q)}${buildFeatureParam(feature)}`)
  )
  return body.data
}

const fetchRandomCars = async (category, q, feature) => {
  const body = await parseApiResponse(
    await apiRequest(`/api/cars/random?limit=${PAGE_SIZE}&available=true${buildCategoryParam(category)}${buildSearchParam(q)}${buildFeatureParam(feature)}`)
  )
  return body.data
}

function CarGrid() {
  const [searchParams] = useSearchParams()
  const q = searchParams.get('q') || ''
  const [cars, setCars] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [category, setCategory] = useState('')
  const [feature, setFeature] = useState('')
  const [allFeatures, setAllFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    apiRequest('/api/features')
      .then(parseApiResponse)
      .then((body) => {
        if (active) setAllFeatures(body.data || [])
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    fetchRandomCars(category, q, feature)
      .then((data) => {
        if (!active) return
        setCars(data)
        setCurrentPage(1)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .then(() => {
        if (active) return fetchCarsPage(0, category, q, feature).then((meta) => setTotalPages(meta.totalPages))
      })
      .catch(() => {
        if (active) setTotalPages(0)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [category, q, feature])

  const handleGoTo = async (targetPage) => {
    const totalDisplayed = totalPages + 1
    if (targetPage < 1 || targetPage > totalDisplayed || loadingMore) return
    if (targetPage === currentPage) return
    setLoadingMore(true)
    setError(null)
    try {
      if (targetPage === 1) {
        setCars(await fetchRandomCars(category, q, feature))
      } else {
        const data = await fetchCarsPage(targetPage - 2, category, q, feature)
        setCars(data.content)
        setTotalPages(data.totalPages)
      }
      setCurrentPage(targetPage)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingMore(false)
    }
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    fetchRandomCars(category, q, feature)
      .then((data) => {
        setCars(data)
        setCurrentPage(1)
      })
      .catch((err) => setError(err.message))
      .then(() => fetchCarsPage(0, category, q, feature).then((meta) => setTotalPages(meta.totalPages)))
      .catch(() => setTotalPages(0))
      .finally(() => setLoading(false))
  }

  return (
    <section className="max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Nuestros autos
      </h2>

      <div className="mb-6 flex flex-wrap gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
        >
          <option value="">Todas las categorías</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {allFeatures.length > 0 && (
          <select
            value={feature}
            onChange={(e) => setFeature(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
          >
            <option value="">Todas las features</option>
            {allFeatures.map((f) => (
              <option key={f.id} value={f.name}>{f.name}</option>
            ))}
          </select>
        )}
      </div>

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

          {totalPages > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-1 mt-10">
              <button
                onClick={() => handleGoTo(currentPage - 1)}
                disabled={currentPage === 1 || loadingMore}
                className="px-3 py-2 text-sm font-semibold rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              {Array.from({ length: totalPages + 1 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => handleGoTo(n)}
                  disabled={loadingMore}
                  className={`px-3 py-2 text-sm font-semibold rounded-lg cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                    n === currentPage
                      ? 'bg-violet-500 text-white'
                      : 'border-2 border-violet-500 text-violet-500 hover:bg-violet-50'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => handleGoTo(currentPage + 1)}
                disabled={currentPage === totalPages + 1 || loadingMore}
                className="px-3 py-2 text-sm font-semibold rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}
    </section>
  )
}

export default CarGrid
