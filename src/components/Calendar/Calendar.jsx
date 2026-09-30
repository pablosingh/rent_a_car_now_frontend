import { useEffect, useState, useMemo } from 'react'
import { FaChevronLeft, FaChevronRight, FaClock } from 'react-icons/fa'
import { apiRequest, parseApiResponse } from '../../utils/api'

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}
function endOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999)
}
function addMonths(date, n) {
  return new Date(date.getFullYear(), date.getMonth() + n, 1)
}
function formatMonth(date) {
  return date.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

function toLocalISO(date) {
  return date.toISOString()
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

export default function Calendar({ carId, onSelectRange }) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)

  useEffect(() => {
    if (!carId) return
    let active = true
    setLoading(true)
    const from = toLocalISO(startOfMonth(month))
    const to = toLocalISO(endOfMonth(month))
    apiRequest(`/api/cars/${carId}/availability?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
      .then(parseApiResponse)
      .then((body) => {
        if (active) setSlots(body.data || [])
      })
      .catch(() => {
        if (active) setSlots([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [carId, month])

  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const firstWeekday = new Date(month.getFullYear(), month.getMonth(), 1).getDay()
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1

  const reservationsByDay = useMemo(() => {
    const map = new Map()
    slots.forEach((s) => {
      const start = new Date(s.startAt)
      const end = new Date(s.endAt)
      const cur = new Date(start)
      cur.setHours(0, 0, 0, 0)
      const endDay = new Date(end)
      endDay.setHours(0, 0, 0, 0)
      while (cur <= endDay) {
        const key = `${cur.getFullYear()}-${cur.getMonth()}-${cur.getDate()}`
        if (!map.has(key)) map.set(key, [])
        map.get(key).push(s)
        cur.setDate(cur.getDate() + 1)
      }
    })
    return map
  }, [slots])

  const getDaySlots = (day) => {
    const key = `${month.getFullYear()}-${month.getMonth()}-${day}`
    return reservationsByDay.get(key) || []
  }

  const handleDayClick = (day) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (d < today) return
    setSelectedDay(day)
    if (onSelectRange) {
      const pad = (n) => String(n).padStart(2, '0')
      const dateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      onSelectRange(dateStr)
    }
  }

  const selectedDaySlots = selectedDay ? getDaySlots(selectedDay) : []

  const isDayPast = (day) => {
    const d = new Date(month.getFullYear(), month.getMonth(), day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return d < today
  }

  const timeSlots = useMemo(() => {
    if (selectedDay == null) return []
    const d = new Date(month.getFullYear(), month.getMonth(), selectedDay)
    const slotsArr = []
    for (let h = 0; h < 24; h++) {
      for (let m of [0, 30]) {
        const slotStart = new Date(d.getFullYear(), d.getMonth(), d.getDate(), h, m, 0, 0)
        const slotEnd = new Date(slotStart.getTime() + 30 * 60000)
        const blocked = selectedDaySlots.some((r) => {
          const rs = new Date(r.startAt)
          const re = new Date(r.endAt)
          const buffer = 60 * 60000
          const effStart = new Date(rs.getTime() - buffer)
          const effEnd = new Date(re.getTime() + buffer)
          return slotStart < effEnd && slotEnd > effStart
        })
        const exactReserved = selectedDaySlots.some((r) => {
          const rs = new Date(r.startAt)
          const re = new Date(r.endAt)
          return slotStart < re && slotEnd > rs
        })
        slotsArr.push({ label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`, start: slotStart, end: slotEnd, blocked, exactReserved })
      }
    }
    return slotsArr
  }, [selectedDay, month, selectedDaySlots])

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => setMonth(addMonths(month, -1))} className="p-2 rounded hover:bg-gray-100 cursor-pointer">
          <FaChevronLeft className="text-gray-600 text-xs" />
        </button>
        <span className="font-semibold text-gray-800 capitalize">{formatMonth(month)}</span>
        <button onClick={() => setMonth(addMonths(month, 1))} className="p-2 rounded hover:bg-gray-100 cursor-pointer">
          <FaChevronRight className="text-gray-600 text-xs" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
        <span>Lu</span><span>Ma</span><span>Mi</span><span>Ju</span><span>Vi</span><span>Sa</span><span>Do</span>
      </div>

      {loading ? (
        <p className="text-center text-sm text-gray-400 py-6">Cargando disponibilidad...</p>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: offset }).map((_, i) => (
            <div key={`empty-${i}`} className="h-10" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const daySlots = getDaySlots(day)
            const past = isDayPast(day)
            const hasReservation = daySlots.length > 0
            const isSelected = selectedDay === day
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={past}
                title={hasReservation ? daySlots.map((r) => `${new Date(r.startAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })} → ${new Date(r.endAt).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`).join(' | ') : 'Disponible'}
                className={`h-10 rounded-lg text-sm flex flex-col items-center justify-center border cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
                  ${past ? 'bg-gray-100 text-gray-400 border-gray-200' : ''}
                  ${!past && isSelected ? 'bg-violet-500 text-white border-violet-500' : ''}
                  ${!past && !isSelected && hasReservation ? 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200' : ''}
                  ${!past && !isSelected && !hasReservation ? 'bg-white text-gray-700 border-gray-200 hover:bg-violet-50 hover:border-violet-300' : ''}`}
              >
                <span className="font-semibold">{day}</span>
                {hasReservation && !isSelected && <span className="w-1 h-1 rounded-full bg-amber-500 mt-0.5" />}
              </button>
            )
          })}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-3 text-xs">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-white border border-gray-200" /> Disponible</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-100 border border-amber-200" /> Reservado</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-100 border border-gray-200" /> Pasado</span>
        <span className="flex items-center gap-1"><FaClock className="text-amber-500" /> Horas exactas 00/30</span>
      </div>

      {selectedDay != null && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            {selectedDay} de {formatMonth(month)} — horas del día
            {selectedDaySlots.length > 0 && <span className="ml-2 text-xs font-normal text-amber-700">{selectedDaySlots.length} reserva(s)</span>}
          </p>
          {selectedDaySlots.length > 0 && (
            <div className="mb-2 text-xs text-gray-600">
              {selectedDaySlots.map((r, idx) => (
                <div key={idx} className="flex items-center gap-1">
                  <FaClock className="text-amber-500 text-[10px]" />
                  {new Date(r.startAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit' })}
                  {' → '}
                  {new Date(r.endAt).toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires', hour: '2-digit', minute: '2-digit' })}
                  <span className="ml-1 text-[10px] px-1 rounded bg-amber-100 text-amber-700">
                    {r.status === 'PENDING' ? 'Pendiente' : r.status === 'DISPATCHED' ? 'Despachada' : r.status === 'COMPLETED' ? 'Completada' : r.status}
                  </span>
                </div>
              ))}
              <p className="text-[11px] text-gray-400 mt-1">Incluye 1h de limpieza: franja ±1h también bloqueada.</p>
            </div>
          )}
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1 max-h-40 overflow-y-auto">
            {timeSlots.map((ts) => (
              <span
                key={ts.label}
                className={`text-xs px-1 py-1 rounded text-center border
                  ${ts.blocked ? (ts.exactReserved ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-gray-200 text-gray-500 border-gray-300') : 'bg-white text-gray-700 border-gray-200'}`}
                title={ts.blocked ? (ts.exactReserved ? 'Reservado' : 'Bloqueado por limpieza 1h') : 'Libre — clic en día para seleccionar'}
              >
                {ts.label}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-gray-400 mt-2">Tocá un día disponible para autocompletar "Desde" con ese día a las 09:00.</p>
        </div>
      )}
    </div>
  )
}
