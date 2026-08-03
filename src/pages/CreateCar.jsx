import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCar } from 'react-icons/fa'

const API_URL = 'http://localhost:8081/api/cars'

const emptyForm = {
  plate: '',
  brand: '',
  model: '',
  year: '',
  pricePerDay: '',
  pricePerHour: '',
  available: true,
}

function CreateCar() {
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          pricePerDay: Number(form.pricePerDay),
          pricePerHour: Number(form.pricePerHour),
        }),
      })

      const body = await res.json()

      if (!res.ok || (body && body.status && body.status >= 400)) {
        throw new Error(body.message || 'Hubo un error al crear el auto.')
      }

      setMessage({ type: 'success', text: 'Auto creado correctamente.' })
      setForm(emptyForm)
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400'

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaCar className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Crear auto</h1>
        </div>

        {message && (
          <div
            className={`mb-4 px-4 py-3 text-sm rounded ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
            <input name="plate" value={form.plate} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <input name="brand" value={form.brand} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input name="model" value={form.model} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input name="year" type="number" value={form.year} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio por día</label>
            <input name="pricePerDay" type="number" step="0.01" value={form.pricePerDay} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio por hora</label>
            <input name="pricePerHour" type="number" step="0.01" value={form.pricePerHour} onChange={handleChange} required className={inputClass} />
          </div>
          <label className="flex items-center gap-2 col-span-1 sm:col-span-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              name="available"
              type="checkbox"
              checked={form.available}
              onChange={handleChange}
              className="w-4 h-4 accent-violet-500"
            />
            Disponible
          </label>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear auto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCar