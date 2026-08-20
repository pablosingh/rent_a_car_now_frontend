import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaCar } from 'react-icons/fa'
import AdminOnly from '../components/AdminOnly/AdminOnly'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES } from '../constants/categories'

const API_URL = '/api/cars'

function AdminCarEdit() {
  const { plate } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { authFetch } = useAuth()

  const listPath = location.pathname.startsWith('/mis-autos') ? '/mis-autos' : '/admin/cars'

  const [form, setForm] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const resOk = (body) => !(body && body.status && body.status >= 400)

  useEffect(() => {
    let active = true
    fetch(`${API_URL}/${plate}`)
      .then((res) => res.json())
      .then((body) => {
        if (!active) return
        if (!resOk(body)) throw new Error(body.message || 'Hubo un error al cargar el auto.')
        const { brand, model, year, pricePerDay, pricePerHour, available, category } = body.data
        setForm({ brand, model, year, pricePerDay, pricePerHour, available, category: category || '' })
      })
      .catch((err) => setMessage({ type: 'error', text: err.message }))
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [plate])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)
    try {
      const params = new URLSearchParams({
        brand: form.brand,
        model: form.model,
        year: Number(form.year),
        pricePerDay: Number(form.pricePerDay),
        pricePerHour: Number(form.pricePerHour),
        available: form.available,
        category: form.category,
      })
      const res = await authFetch(`${API_URL}/${plate}?${params}`, { method: 'PUT' })
      const body = await res.json()
      if (!res.ok || (body && body.status && body.status >= 400)) {
        throw new Error(body.message || 'Hubo un error al actualizar el auto.')
      }
      setMessage({ type: 'success', text: 'Auto actualizado correctamente.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400'

  return (
    <AdminOnly>
      <div className="max-w-2xl mx-auto">
      <Link
        to={listPath}
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaCar className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Editar auto</h1>
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

        {loading && <p className="text-gray-500 text-center py-8">Cargando auto...</p>}

        {!loading && form && (
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
              <input value={plate} readOnly disabled className={`${inputClass} opacity-60 cursor-not-allowed`} />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select name="category" value={form.category} onChange={handleChange} required className={inputClass}>
                <option value="">Seleccioná una categoría</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 col-span-2 text-sm font-medium text-gray-700 cursor-pointer">
              <input
                name="available"
                type="checkbox"
                checked={form.available}
                onChange={handleChange}
                className="w-4 h-4 accent-violet-500"
              />
              Disponible
            </label>

            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button
                type="button"
                onClick={() => navigate(listPath)}
                className="px-8 py-3 text-lg font-semibold rounded-lg border-2 border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
    </AdminOnly>
  )
}

export default AdminCarEdit
