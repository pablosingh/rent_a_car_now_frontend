import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaTrash, FaCogs } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { ICON_MAP, ICON_OPTIONS } from '../constants/icons'
import { parseApiResponse } from '../utils/api'

function AdminFeatures() {
  const { authFetch } = useAuth()
  const [features, setFeatures] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let active = true
    authFetch('/api/features')
      .then(parseApiResponse)
      .then((body) => {
        if (!active) return
        setFeatures(body.data || [])
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [authFetch])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!name.trim()) return
    setCreating(true)
    setMessage(null)
    try {
      const params = new URLSearchParams({ name: name.trim() })
      if (icon) params.set('icon', icon)
      const res = await authFetch(`/api/features?${params}`, { method: 'POST' })
      const body = await parseApiResponse(res, 'Error al crear feature.')
      setFeatures((prev) => [...prev, body.data])
      setName('')
      setIcon('')
      setMessage({ type: 'success', text: 'Feature creada correctamente.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (feature) => {
    if (!window.confirm(`¿Borrar la feature "${feature.name}"?`)) return
    try {
      await parseApiResponse(
        await authFetch(`/api/features/${feature.id}`, { method: 'DELETE' }),
        'Error al borrar feature.'
      )
      setFeatures((prev) => prev.filter((f) => f.id !== feature.id))
    } catch (err) {
      window.alert(err.message)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaCogs className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Gestionar features</h1>
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

        <form onSubmit={handleCreate} className="flex gap-3 mb-6">
          <input
            type="text"
            placeholder="Nombre de la feature"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <select
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
          >
            <option value="">Sin ícono</option>
            {ICON_OPTIONS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
          </select>
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="px-4 py-2 text-sm font-semibold rounded bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <FaPlus />
            {creating ? 'Creando...' : 'Crear'}
          </button>
        </form>

        {icon && (() => {
          const PreviewIcon = ICON_MAP[icon]
          return (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-500">
              Vista previa:
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 text-violet-700 font-semibold text-xs px-2 py-1">
                {PreviewIcon && <PreviewIcon className="text-violet-500" />}
                {name || 'Nombre'}
              </span>
            </div>
          )
        })()}

        {loading && <p className="text-gray-500 text-center py-8">Cargando features...</p>}

        {!loading && error && (
          <p className="text-red-500 text-center py-8">{error}</p>
        )}

        {!loading && !error && features.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay features creadas.</p>
        )}

        {!loading && !error && features.length > 0 && (
          <div className="space-y-2">
            {features.map((feature) => {
              const IconComp = feature.icon ? ICON_MAP[feature.icon] : null
              return (
                <div
                  key={feature.id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50"
                >
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
                    {IconComp && <IconComp className="text-violet-500" />}
                    {feature.name}
                    {feature.icon && (
                      <span className="text-xs text-gray-400">({feature.icon})</span>
                    )}
                  </span>
                  <button
                    onClick={() => handleDelete(feature)}
                    className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                    title="Borrar"
                  >
                    <FaTrash className="text-sm" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminFeatures
