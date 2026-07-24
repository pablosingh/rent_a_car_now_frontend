import { useParams, Link } from 'react-router-dom'
import { FaCog, FaChair, FaGasPump, FaArrowLeft, FaCar } from 'react-icons/fa'
import cars from '../data/cars'

function CarDetail() {
  const { id } = useParams()
  const car = cars.find((c) => c.id === Number(id))

  if (!car) {
    return (
      <div className="text-center">
        <p className="text-xl text-gray-500">Auto no encontrado</p>
        <Link to="/" className="text-violet-600 underline mt-2 inline-block">
          Volver al inicio
        </Link>
      </div>
    )
  }

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
          {car.image ? (
            <img
              src={car.image}
              alt={car.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <FaCar className="text-gray-400 text-8xl" />
          )}
        </div>

        <div className="p-6 md:p-8">
          <h1 className="text-3xl font-bold text-gray-800">{car.name}</h1>
          <p className="text-violet-600 text-2xl font-bold mt-2">
            ${car.price}
            <span className="text-base text-gray-500 font-normal"> /día</span>
          </p>

          <p className="text-gray-600 mt-4 text-lg">{car.description}</p>

          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2 text-gray-600">
              <FaCog className="text-violet-500" />
              <span>{car.transmission}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaChair className="text-violet-500" />
              <span>{car.seats} asientos</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FaGasPump className="text-violet-500" />
              <span>{car.fuel}</span>
            </div>
          </div>

          <button className="mt-8 w-full md:w-auto px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer">
            Reservar ahora
          </button>
        </div>
      </div>
      </div>
    )
  }
  
  export default CarDetail
