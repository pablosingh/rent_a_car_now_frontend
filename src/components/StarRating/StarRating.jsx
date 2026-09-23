import { FaStar, FaRegStar } from 'react-icons/fa'

export function StarRating({ value = 0, onChange, readonly = false, size = 'sm', showValue = false, count }) {
  const starSize = size === 'lg' ? 'text-2xl' : size === 'md' ? 'text-lg' : 'text-sm'
  const stars = [1, 2, 3, 4, 5]
  return (
    <span className="inline-flex items-center gap-0.5">
      {stars.map((n) => {
        const filled = n <= Math.round(value)
        const star = filled ? <FaStar className="text-amber-400" /> : <FaRegStar className="text-gray-300" />
        if (readonly || !onChange) {
          return (
            <span key={n} className={starSize}>
              {star}
            </span>
          )
        }
        return (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`${starSize} hover:scale-110 transition-transform cursor-pointer`}
            aria-label={`Puntuar ${n} estrella${n > 1 ? 's' : ''}`}
          >
            {star}
          </button>
        )
      })}
      {showValue && value > 0 && (
        <span className="ml-1 text-sm font-semibold text-gray-700">{Number(value).toFixed(1)}</span>
      )}
      {count != null && <span className="ml-1 text-xs text-gray-400">({count})</span>}
    </span>
  )
}

export function StarInput({ value, onChange, size = 'md' }) {
  return <StarRating value={value} onChange={onChange} size={size} />
}

export default StarRating
