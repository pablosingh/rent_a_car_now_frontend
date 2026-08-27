import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaUsers } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { parseApiResponse } from '../utils/api'

const ROLES = ['USER', 'ADMIN']

function AdminUsers() {
  const { authFetch } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [message, setMessage] = useState(null)
  const [pendingRoles, setPendingRoles] = useState({})

  useEffect(() => {
    let active = true
    authFetch('/api/users')
      .then(parseApiResponse)
      .then((body) => {
        if (!active) return
        setUsers((body.data || []).filter((u) => u.role === 'USER'))
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [authFetch])

  const handleSelectRole = (user, newRole) => {
    if (user.role === newRole) {
      setPendingRoles((prev) => {
        const next = { ...prev }
        delete next[user.id]
        return next
      })
    } else {
      setPendingRoles((prev) => ({ ...prev, [user.id]: newRole }))
    }
  }

  const handleUpdateRole = async (user) => {
    const newRole = pendingRoles[user.id]
    if (!newRole) return
    setUpdatingId(user.id)
    setMessage(null)
    try {
      const res = await authFetch(`/api/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      })
      await parseApiResponse(res, 'Error al cambiar el rol.')
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u))
      setPendingRoles((prev) => {
        const next = { ...prev }
        delete next[user.id]
        return next
      })
      setMessage({ type: 'success', text: `Rol de ${user.name} ${user.lastName} cambiado a ${newRole}.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaUsers className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Gestionar usuarios</h1>
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

        {loading && <p className="text-gray-500 text-center py-8">Cargando usuarios...</p>}

        {!loading && error && (
          <p className="text-red-500 text-center py-8">{error}</p>
        )}

        {!loading && !error && users.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay usuarios.</p>
        )}

        {!loading && !error && users.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-semibold text-gray-700">Nombre</th>
                  <th className="pb-3 font-semibold text-gray-700">Email</th>
                  <th className="pb-3 font-semibold text-gray-700">Rol</th>
                  <th className="pb-3 font-semibold text-gray-700">Verificado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const hasPending = user.id in pendingRoles
                  return (
                    <tr key={user.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 text-gray-800">
                        {user.name} {user.lastName}
                      </td>
                      <td className="py-3 text-gray-500 text-sm">{user.email}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={pendingRoles[user.id] ?? user.role}
                            onChange={(e) => handleSelectRole(user, e.target.value)}
                            disabled={updatingId === user.id}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 cursor-pointer"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          {hasPending && (
                            <button
                              onClick={() => handleUpdateRole(user)}
                              disabled={updatingId === user.id}
                              className="px-3 py-1 text-sm font-semibold rounded bg-violet-600 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Actualizar
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        {user.role === 'OWNER' ? (
                          <span
                            className={`text-xs font-semibold px-2 py-1 rounded ${
                              user.verified
                                ? 'bg-green-100 text-green-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {user.verified ? 'Sí' : 'No'}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
