import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaSignInAlt } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { apiRequest, parseApiResponse } from '../utils/api'

const API_URL = '/api/users/login'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const next = {}
    if (!form.email.trim()) {
      next.email = 'El email es obligatorio.'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = 'Ingresá un email válido.'
    }
    if (!form.password) {
      next.password = 'La contraseña es obligatoria.'
    }
    return next
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)
    const nextErrors = validate()
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setLoading(true)
    try {
      const res = await apiRequest(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email.trim(), password: form.password }),
      })
      const body = await parseApiResponse(res, 'No se pudo iniciar sesión.')
      login(body.data.token, body.data.user)
      navigate('/')
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400'
  const errorClass = 'border-red-400'

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6">
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaSignInAlt className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Iniciar sesión</h1>
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className={`${inputClass} ${errors.email ? errorClass : ''}`}
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className={`${inputClass} ${errors.password ? errorClass : ''}`}
            />
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login
