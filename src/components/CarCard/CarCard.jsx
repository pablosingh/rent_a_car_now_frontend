import { Link } from 'react-router-dom'
import { FaCalendar, FaCar } from 'react-icons/fa'

function CarCard({ car }) {
  return (
    <Link
      to={`/car/${car.plate}`}
      className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="h-40 bg-gray-200 flex items-center justify-center overflow-hidden">
        {car.imagePaths?.length > 0 ? (
          <img
            src={car.imagePaths[0]}
            alt={`${car.brand} ${car.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <FaCar className="text-gray-400 text-5xl" />
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg truncate">
          {car.brand} {car.model}
        </h3>
        {car.category && (
          <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
            {car.category}
          </span>
        )}
        <p className="text-violet-600 font-semibold text-lg mt-1">
          ${car.pricePerDay}
          <span className="text-sm text-gray-500 font-normal"> /día</span>
        </p>
        <p className="text-gray-500 text-sm mt-1 flex items-center gap-1">
          <FaCalendar className="text-xs" />
          {car.year}
        </p>
      </div>
    </Link>
  )
}

export default CarCard
