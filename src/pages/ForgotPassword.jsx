import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaEnvelope } from 'react-icons/fa'
import { apiRequest, parseApiResponse } from '../utils/api'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Ingresá un email válido.')
      return
    }
    setLoading(true)
    try {
      const res = await apiRequest('/api/users/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      await parseApiResponse(res, 'No se pudo procesar la solicitud.')
      setSent(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400'

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/login" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6">
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaEnvelope className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Recuperar contraseña</h1>
        </div>

        {sent ? (
          <div className="mb-4 px-4 py-3 text-sm rounded bg-green-50 text-green-700 border border-green-200">
            Si el mail existe en el sistema, te enviamos un enlace para restablecer tu contraseña (válido por 1 hora).
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClass} ${error ? 'border-red-400' : ''}`}
              />
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
