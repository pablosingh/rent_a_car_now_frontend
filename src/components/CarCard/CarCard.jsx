import { Link } from 'react-router-dom'
import { FaCog, FaCar } from 'react-icons/fa'

function CarCard({ car }) {
  return (
    <Link
      to={`/car/${car.id}`}
      className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
        {car.image ? (
          <img
            src={car.image}
            alt={car.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <FaCar className="text-gray-400 text-5xl" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">{car.name}</h3>
        <p className="text-violet-600 font-semibold text-lg mt-1">
          ${car.price}
          <span className="text-sm text-gray-500 font-normal"> /día</span>
        </p>
        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
          <FaCog className="text-xs" />
          {car.transmission}
        </p>
      </div>
    </Link>
  )
}

export default CarCard
