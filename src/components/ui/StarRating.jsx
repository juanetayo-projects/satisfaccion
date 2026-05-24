import { RATING_COLORS } from '../../lib/constants'

export default function StarRating({ value, onChange, disabled = false }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {[1, 2, 3, 4, 5].map(n => {
        const color = RATING_COLORS[n]
        const selected = value === n
        return (
          <button
            key={n}
            type="button"
            disabled={disabled}
            onClick={() => onChange && onChange(n)}
            className={`
              w-14 h-14 rounded-xl font-bold text-lg border-2 transition-all duration-150
              ${selected
                ? `${color.bg} ${color.text} ${color.border} scale-110 shadow-lg`
                : `bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:scale-105`
              }
              ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
            `}
          >
            {n}
          </button>
        )
      })}
      {value && (
        <span className={`self-center text-sm font-medium px-3 py-1 rounded-full ${RATING_COLORS[value].bg} ${RATING_COLORS[value].text}`}>
          {RATING_COLORS[value].label}
        </span>
      )}
    </div>
  )
}
