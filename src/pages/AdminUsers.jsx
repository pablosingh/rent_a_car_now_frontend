import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FaArrowLeft, FaCheckCircle, FaUsers } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { parseApiResponse } from '../utils/api'
import { PERMISSION_LABELS, ROLES, ROLE_LABELS } from '../constants/roles'

function AdminUsers() {
  const { auth, authFetch } = useAuth()
  const [searchParams] = useSearchParams()
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingId, setUpdatingId] = useState(null)
  const [verifyingId, setVerifyingId] = useState(null)
  const [message, setMessage] = useState(null)
  const [roleFilter, setRoleFilter] = useState('ALL')
  const [pendingOnly, setPendingOnly] = useState(searchParams.get('pending') === '1')
  const [pendingRoles, setPendingRoles] = useState({})
  const [pendingOwners, setPendingOwners] = useState({})
  const [showPermissions, setShowPermissions] = useState(false)

  useEffect(() => {
    let active = true
    Promise.all([
      authFetch('/api/users').then(parseApiResponse),
      authFetch('/api/roles').then(parseApiResponse),
    ])
      .then(([usersBody, rolesBody]) => {
        if (!active) return
        setUsers(usersBody.data || [])
        setRoles(rolesBody.data || [])
      })
      .catch((err) => {
        if (active) setError(err.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [authFetch])

  const owners = users.filter((u) => u.role === 'OWNER')

  const visibleUsers = users.filter((u) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false
    if (pendingOnly && !(u.role === 'OWNER' && u.verified !== true)) return false
    return true
  })

  const handleSelectRole = (user, newRole) => {
    setPendingRoles((prev) => {
      if (user.role === newRole) {
        const next = { ...prev }
        delete next[user.id]
        return next
      }
      return { ...prev, [user.id]: newRole }
    })
    setPendingOwners((prev) => {
      const next = { ...prev }
      if (newRole !== 'EMPLOYEE') {
        delete next[user.id]
      } else if (user.role === 'EMPLOYEE' && user.owner) {
        next[user.id] = String(user.owner.id)
      }
      return next
    })
  }

  const handleUpdateRole = async (user) => {
    const newRole = pendingRoles[user.id]
    if (!newRole) return
    if (newRole === 'EMPLOYEE' && !pendingOwners[user.id]) {
      setMessage({ type: 'error', text: 'Elegí el dueño al que pertenece el empleado.' })
      return
    }
    setUpdatingId(user.id)
    setMessage(null)
    try {
      const body = { role: newRole }
      if (newRole === 'EMPLOYEE') body.ownerId = Number(pendingOwners[user.id])
      const res = await authFetch(`/api/users/${user.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const updated = await parseApiResponse(res, 'Error al cambiar el rol.')
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, ...updated.data } : u))
      setPendingRoles((prev) => {
        const next = { ...prev }
        delete next[user.id]
        return next
      })
      setPendingOwners((prev) => {
        const next = { ...prev }
        delete next[user.id]
        return next
      })
      setMessage({ type: 'success', text: `Rol de ${user.name} ${user.lastName} cambiado a ${ROLE_LABELS[newRole] ?? newRole}.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUpdatingId(null)
    }
  }

  const handleVerify = async (user) => {
    setVerifyingId(user.id)
    setMessage(null)
    try {
      const res = await authFetch(`/api/users/${user.id}/verify`, { method: 'PUT' })
      const updated = await parseApiResponse(res, 'Error al verificar el dueño.')
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, ...updated.data } : u))
      setMessage({ type: 'success', text: `${user.name} ${user.lastName} fue verificado.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setVerifyingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
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

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="ALL">Todos los roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input
              type="checkbox"
              checked={pendingOnly}
              onChange={(e) => setPendingOnly(e.target.checked)}
              className="accent-violet-600 w-4 h-4 cursor-pointer"
            />
            Pendientes de verificación
          </label>
          <button
            onClick={() => setShowPermissions((v) => !v)}
            className="ml-auto text-sm font-semibold text-violet-600 hover:text-violet-800 cursor-pointer"
          >
            {showPermissions ? 'Ocultar permisos' : 'Ver permisos por rol'}
          </button>
        </div>

        {showPermissions && (
          <div className="mb-6 grid gap-3 md:grid-cols-2">
            {roles.map((r) => (
              <div key={r.id} className="border border-gray-200 rounded-lg p-3">
                <p className="font-semibold text-gray-800 text-sm mb-1">{ROLE_LABELS[r.name] ?? r.name}</p>
                <ul className="list-disc list-inside text-xs text-gray-600">
                  {(r.permissions || []).map((p) => (
                    <li key={p.id}>{PERMISSION_LABELS[p.code] ?? p.code}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {loading && <p className="text-gray-500 text-center py-8">Cargando usuarios...</p>}

        {!loading && error && (
          <p className="text-red-500 text-center py-8">{error}</p>
        )}

        {!loading && !error && visibleUsers.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay usuarios.</p>
        )}

        {!loading && !error && visibleUsers.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3 font-semibold text-gray-700">Nombre</th>
                  <th className="pb-3 font-semibold text-gray-700">Email</th>
                  <th className="pb-3 font-semibold text-gray-700">Rol</th>
                  <th className="pb-3 font-semibold text-gray-700">Dueño</th>
                  <th className="pb-3 font-semibold text-gray-700">Verificado</th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((user) => {
                  const hasPending = user.id in pendingRoles
                  const selectedRole = pendingRoles[user.id] ?? user.role
                  const needsOwner = selectedRole === 'EMPLOYEE'
                  const isSelf = auth.user && auth.user.id === user.id
                  return (
                    <tr key={user.id} className="border-b border-gray-100 last:border-0">
                      <td className="py-3 text-gray-800">
                        {user.name} {user.lastName}
                      </td>
                      <td className="py-3 text-gray-500 text-sm">{user.email}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedRole}
                            onChange={(e) => handleSelectRole(user, e.target.value)}
                            disabled={updatingId === user.id || isSelf}
                            title={isSelf ? 'No podés cambiar tu propio rol' : undefined}
                            className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 disabled:opacity-50 cursor-pointer"
                          >
                            {ROLES.map((r) => (
                              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                            ))}
                          </select>
                          {hasPending && !isSelf && (
                            <button
                              onClick={() => handleUpdateRole(user)}
                              disabled={updatingId === user.id}
                              className="px-3 py-1 text-sm font-semibold rounded bg-violet-600 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Actualizar
                            </button>
                          )}
                        </div>
                        {needsOwner && hasPending && !isSelf && (
                          <select
                            value={pendingOwners[user.id] ?? ''}
                            onChange={(e) => setPendingOwners((prev) => ({ ...prev, [user.id]: e.target.value }))}
                            disabled={updatingId === user.id}
                            className="mt-2 border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
                          >
                            <option value="">Elegir dueño...</option>
                            {owners.map((o) => (
                              <option key={o.id} value={o.id}>{o.name} {o.lastName} ({o.email})</option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="py-3 text-gray-500 text-sm">
                        {user.role === 'EMPLOYEE' && !hasPending
                          ? (user.owner ? `${user.owner.name} ${user.owner.lastName}` : 'Sin asignar')
                          : <span className="text-gray-400 text-xs">—</span>}
                      </td>
                      <td className="py-3">
                        {user.role === 'OWNER' ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold px-2 py-1 rounded ${
                                user.verified
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {user.verified ? 'Sí' : 'No'}
                            </span>
                            {!user.verified && (
                              <button
                                onClick={() => handleVerify(user)}
                                disabled={verifyingId === user.id}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded border-2 border-green-500 text-green-600 hover:bg-green-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <FaCheckCircle />
                                Verificar
                              </button>
                            )}
                          </div>
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
