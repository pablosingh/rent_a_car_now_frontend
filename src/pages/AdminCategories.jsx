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
  const [pendingDelete, setPendingDelete] = useState(null)
  const [pendingCount, setPendingCount] = useState(null)
  const [countLoading, setCountLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)

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

  const openDeleteModal = async (category) => {
    setPendingDelete(category)
    setPendingCount(null)
    setCountLoading(true)
    try {
      const res = await authFetch(`/api/cars?category=${encodeURIComponent(category.name)}&size=1`)
      const body = await parseApiResponse(res)
      const total = body.data?.totalElements
      setPendingCount(typeof total === 'number' ? total : 0)
    } catch {
      setPendingCount(null)
    } finally {
      setCountLoading(false)
    }
  }

  const confirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await parseApiResponse(
        await authFetch(`/api/categories/${pendingDelete.id}`, { method: 'DELETE' }),
        'Error al borrar categoría.'
      )
      setCategories((prev) => prev.filter((c) => c.id !== pendingDelete.id))
      const countText = pendingCount != null && pendingCount > 0 ? ` y ${pendingCount} ${pendingCount === 1 ? 'auto eliminado' : 'autos eliminados'}` : ''
      setMessage({ type: 'success', text: `Categoría "${pendingDelete.name}"${countText} borrada.` })
      setPendingDelete(null)
      setPendingCount(null)
    } catch (err) {
      window.alert(err.message)
    } finally {
      setDeleting(false)
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
                        onClick={() => openDeleteModal(category)}
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

      {pendingDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleting && !countLoading && setPendingDelete(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-2">¿Eliminar categoría?</h3>
            <p className="text-sm text-gray-600 mb-3">
              Estás por eliminar la categoría <span className="font-semibold">&quot;{pendingDelete.name}&quot;</span>.
            </p>
            <div className="mb-5 px-3 py-3 text-sm rounded border bg-red-50 border-red-200 text-red-700">
              {countLoading ? (
                <span>Calculando autos afectados...</span>
              ) : pendingCount === 0 ? (
                <span>No hay autos en esta categoría. Se eliminará solo la categoría.</span>
              ) : pendingCount != null ? (
                <span>
                  <span className="font-semibold">¡Atención!</span> Se eliminarán también <span className="font-bold">{pendingCount} {pendingCount === 1 ? 'auto' : 'autos'}</span> que pertenecen a esta categoría. Esta acción no se puede deshacer.
                </span>
              ) : (
                <span>
                  <span className="font-semibold">¡Atención!</span> Se eliminarán también <span className="font-bold">todos los autos</span> que pertenecen a esta categoría. Esta acción no se puede deshacer.
                </span>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                disabled={deleting}
                className="px-4 py-2 text-sm font-semibold rounded border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting || countLoading}
                className="px-4 py-2 text-sm font-semibold rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
              >
                <FaTrash className="text-xs" />
                {deleting ? 'Eliminando...' : 'Eliminar categoría y autos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCategories
