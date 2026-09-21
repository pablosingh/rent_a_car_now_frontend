import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaPlus, FaTrash, FaEdit, FaFileContract, FaSave } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { parseApiResponse } from '../utils/api'

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function AdminPolicies() {
  const { authFetch } = useAuth()
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [displayOrder, setDisplayOrder] = useState('')
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editSlug, setEditSlug] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editOrder, setEditOrder] = useState('')

  useEffect(() => {
    let active = true
    fetch('/api/policies')
      .then((r) => r.json())
      .then((body) => {
        if (!active) return
        const data = body?.data
        const sorted = Array.isArray(data) ? [...data].sort((a, b) => a.displayOrder - b.displayOrder) : []
        setPolicies(sorted)
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const handleTitleChange = (value) => {
    setTitle(value)
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value))
    }
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!title.trim() || !slug.trim() || !content.trim()) return
    setCreating(true)
    setMessage(null)
    try {
      const res = await authFetch('/api/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          slug: slug.trim(),
          content: content.trim(),
          displayOrder: displayOrder ? Number(displayOrder) : policies.length + 1,
        }),
      })
      const body = await parseApiResponse(res, 'Error al crear política.')
      setPolicies((prev) => [...prev, body.data].sort((a, b) => a.displayOrder - b.displayOrder))
      setTitle('')
      setSlug('')
      setContent('')
      setDisplayOrder('')
      setMessage({ type: 'success', text: 'Política creada correctamente.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setCreating(false)
    }
  }

  const startEdit = (policy) => {
    setEditingId(policy.id)
    setEditTitle(policy.title)
    setEditSlug(policy.slug)
    setEditContent(policy.content)
    setEditOrder(String(policy.displayOrder))
  }

  const handleUpdate = async (policy) => {
    if (!editTitle.trim() || !editSlug.trim() || !editContent.trim()) return
    try {
      const res = await authFetch(`/api/policies/${policy.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle.trim(),
          slug: editSlug.trim(),
          content: editContent.trim(),
          displayOrder: editOrder ? Number(editOrder) : policy.displayOrder,
        }),
      })
      const body = await parseApiResponse(res, 'Error al actualizar política.')
      setPolicies((prev) => prev.map((p) => (p.id === policy.id ? body.data : p)).sort((a, b) => a.displayOrder - b.displayOrder))
      setEditingId(null)
      setMessage({ type: 'success', text: 'Política actualizada.' })
    } catch (err) {
      window.alert(err.message)
    }
  }

  const handleDelete = async (policy) => {
    if (!window.confirm(`¿Eliminar la política "${policy.title}"? Esta acción no se puede deshacer.`)) return
    try {
      await parseApiResponse(await authFetch(`/api/policies/${policy.id}`, { method: 'DELETE' }), 'Error al borrar política.')
      setPolicies((prev) => prev.filter((p) => p.id !== policy.id))
      setMessage({ type: 'success', text: `Política "${policy.title}" eliminada.` })
    } catch (err) {
      window.alert(err.message)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/admin" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6">
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaFileContract className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Gestionar políticas</h1>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Las políticas se muestran en <Link to="/politicas" className="text-violet-600 hover:underline">/politicas</Link> ordenadas por número de orden.
          Solo ADMIN puede crear, editar o borrar.
        </p>

        {message && (
          <div
            className={`mb-4 px-4 py-3 text-sm rounded border ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleCreate} className="border border-gray-200 rounded-lg p-4 mb-8 bg-gray-50">
          <h3 className="text-sm font-bold text-gray-700 mb-3">Nueva política</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <input
              type="text"
              placeholder="Título *"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              required
              className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <input
              type="text"
              placeholder="Slug * (ej: reservas-tarifas)"
              value={slug}
              onChange={(e) => setSlug(slugify(e.target.value))}
              required
              className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
            <input
              type="number"
              placeholder="Orden"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              min="1"
              className="px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-violet-400"
            />
          </div>
          <textarea
            placeholder="Contenido *"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 mb-3"
          />
          <button
            type="submit"
            disabled={creating || !title.trim() || !slug.trim() || !content.trim()}
            className="px-4 py-2 text-sm font-semibold rounded bg-violet-500 text-white hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaPlus className="text-xs" />
            {creating ? 'Creando...' : 'Crear política'}
          </button>
        </form>

        {loading && <p className="text-gray-500 text-center py-8">Cargando políticas...</p>}
        {!loading && error && <p className="text-red-500 text-center py-8">{error}</p>}
        {!loading && !error && policies.length === 0 && <p className="text-gray-500 text-center py-8">No hay políticas creadas.</p>}

        {!loading && !error && policies.length > 0 && (
          <div className="space-y-3">
            {policies.map((policy) => (
              <div key={policy.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                {editingId === policy.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      <input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Título"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                      <input
                        value={editSlug}
                        onChange={(e) => setEditSlug(slugify(e.target.value))}
                        placeholder="Slug"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                      <input
                        type="number"
                        value={editOrder}
                        onChange={(e) => setEditOrder(e.target.value)}
                        placeholder="Orden"
                        className="px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-400"
                      />
                    </div>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={4}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-violet-400"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-100 cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleUpdate(policy)}
                        className="px-3 py-1.5 text-xs font-semibold rounded bg-violet-500 text-white hover:bg-violet-700 cursor-pointer flex items-center gap-1"
                      >
                        <FaSave />
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <span className="shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
                      {policy.displayOrder}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-gray-800">{policy.title}</h3>
                      <p className="text-xs text-violet-500">#{policy.slug}</p>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed line-clamp-4">{policy.content}</p>
                    </div>
                    <span className="flex flex-col gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(policy)}
                        className="p-2 text-violet-400 hover:text-violet-600 hover:bg-violet-50 rounded cursor-pointer"
                        title="Editar"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(policy)}
                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded cursor-pointer"
                        title="Borrar"
                      >
                        <FaTrash />
                      </button>
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminPolicies
