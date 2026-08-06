import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaCalendar, FaCar, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'

function CarDetail() {
  const { plate } = useParams()
  const [car, setCar] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const loadCar = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/cars/${plate}`)
        const body = await res.json()
        if (!res.ok || (body && body.status && body.status >= 400)) {
          throw new Error(body.message || 'Auto no encontrado.')
        }
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
    <div className="max-w-4xl mx-auto">
      <Link
        to="/"
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
          <h1 className="text-3xl font-bold text-gray-800">
            {car.brand} {car.model}
          </h1>
          <p className="text-violet-600 text-2xl font-bold mt-2">
            ${car.pricePerDay}
            <span className="text-base text-gray-500 font-normal"> /día</span>
          </p>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2 text-gray-600">
              <FaCalendar className="text-violet-500" />
              <span>Año {car.year}</span>
            </div>
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
              Tarifa por hora: ${car.pricePerHour}
            </p>
          )}

          <button
            disabled={!car.available}
            className="mt-8 w-full md:w-auto px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reservar ahora
          </button>
        </div>
      </div>
    </div>
  )
}

export default CarDetail
