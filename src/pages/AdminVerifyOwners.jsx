import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCheckCircle, FaUserCheck } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

function AdminVerifyOwners() {
  const { authFetch } = useAuth()
  const [owners, setOwners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [verifying, setVerifying] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    let active = true
    authFetch('/api/users')
      .then((res) => res.json().then((body) => ({ res, body })))
      .then(({ res, body }) => {
        if (!active) return
        if (!res.ok || (body && body.status && body.status >= 400)) {
          throw new Error(body.message || 'Hubo un error al cargar los dueños.')
        }
        setOwners((body.data || []).filter((u) => u.role === 'OWNER' && u.verified !== true))
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
  }, [authFetch])

  const handleVerify = async (owner) => {
    setVerifying(true)
    setMessage(null)
    try {
      const res = await authFetch(`/api/users/${owner.id}/verify`, { method: 'PUT' })
      const body = await res.json()
      if (!res.ok || (body && body.status && body.status >= 400)) {
        throw new Error(body.message || 'Hubo un error al verificar el dueño.')
      }
      setOwners((prev) => prev.filter((u) => u.id !== owner.id))
      setMessage({ type: 'success', text: `${owner.name} ${owner.lastName} fue verificado.` })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to="/admin"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaUserCheck className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Verificar dueños</h1>
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

        {loading && <p className="text-gray-500 text-center py-8">Cargando dueños...</p>}

        {!loading && !error && owners.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay dueños pendientes de verificación.</p>
        )}

        {!loading && owners.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {owners.map((owner) => (
              <li key={owner.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    {owner.name} {owner.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{owner.email}</p>
                </div>
                <button
                  onClick={() => handleVerify(owner)}
                  disabled={verifying}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded border-2 border-green-500 text-green-600 hover:bg-green-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaCheckCircle />
                  Verificar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default AdminVerifyOwners