import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaTag } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { parseApiResponse } from '../utils/api'

function AdminCategories() {
  const { authFetch } = useAuth()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')

  useEffect(() => {
    let active = true
    authFetch('/api/categories')
      .then(parseApiResponse)
      .then((body) => {
        if (!active) return
        setCategories(body.data || [])
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
      if (description.trim()) params.set('description', description.trim())
      const res = await authFetch(`/api/categories?${params}`, { method: 'POST' })
      const body = await parseApiResponse(res, 'Error al crear categoría.')
      setCategories((prev) => [...prev, body.data])
      setName('')
      setDescription('')
      setMessage({ type: 'success', text: 'Categoría creada correctamente.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (category) => {
    if (!window.confirm(`¿Borrar la categoría "${category.name}"?`)) return
    try {
      await parseApiResponse(
        await authFetch(`/api/categories/${category.id}`, { method: 'DELETE' }),
        'Error al borrar categoría.'
      )
      setCategories((prev) => prev.filter((c) => c.id !== category.id))
      setMessage({ type: 'success', text: 'Categoría borrada.' })
    } catch (err) {
      window.alert(err.message)
    }
  }

  const startEdit = (category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditDescription(category.description || '')
  }

  const handleUpdate = async (category) => {
    if (!editName.trim()) return
    try {
      const params = new URLSearchParams({ name: editName.trim() })
      if (editDescription.trim()) params.set('description', editDescription.trim())
      const res = await authFetch(`/api/categories/${category.id}?${params}`, { method: 'PUT' })
      const body = await parseApiResponse(res, 'Error al actualizar categoría.')
      setCategories((prev) => prev.map((c) => (c.id === category.id ? body.data : c)))
      setEditingId(null)
      setMessage({ type: 'success', text: 'Categoría actualizada.' })
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
          <FaTag className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Gestionar categorías</h1>
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

        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <input
            type="text"
            placeholder="Descripción (opcional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400"
          />
          <button
            type="submit"
            disabled={creating || !name.trim()}
            className="px-4 py-2 text-sm font-semibold rounded bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 justify-center"
          >
            <FaPlus />
            {creating ? 'Creando...' : 'Crear'}
          </button>
        </form>

        {loading && <p className="text-gray-500 text-center py-8">Cargando categorías...</p>}

        {!loading && error && (
          <p className="text-red-500 text-center py-8">{error}</p>
        )}

        {!loading && !error && categories.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay categorías creadas.</p>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="space-y-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between px-4 py-3 rounded-lg border border-gray-200 hover:bg-gray-50 gap-2"
              >
                {editingId === category.id ? (
                  <div className="flex flex-1 gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-400"
                    />
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder="Descripción"
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-400"
                    />
                    <button
                      onClick={() => handleUpdate(category)}
                      className="px-3 py-1 text-xs font-semibold rounded bg-violet-500 text-white hover:bg-violet-700 cursor-pointer"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-100 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="flex flex-col">
                      <span className="text-sm font-medium text-gray-800">{category.name}</span>
                      {category.description && (
                        <span className="text-xs text-gray-400">{category.description}</span>
                      )}
                    </span>
                    <span className="flex items-center gap-1">
                      <button
                        onClick={() => startEdit(category)}
                        className="p-2 text-violet-400 hover:text-violet-600 hover:bg-violet-50 rounded cursor-pointer"
                        title="Editar"
                      >
                        <FaEdit className="text-sm" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Borrar"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminCategories
