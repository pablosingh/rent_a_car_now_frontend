import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaUser } from 'react-icons/fa'

const API_URL = '/api/users'

const emptyForm = {
  name: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
}

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'El nombre es obligatorio.'
    if (!form.lastName.trim()) next.lastName = 'El apellido es obligatorio.'
    if (!form.email.trim()) {
      next.email = 'El email es obligatorio.'
    } else if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      next.email = 'Ingresá un email válido.'
    }
    if (!form.password) {
      next.password = 'La contraseña es obligatoria.'
    } else if (form.password.length < 6) {
      next.password = 'La contraseña debe tener al menos 6 caracteres.'
    }
    if (!form.confirmPassword) {
      next.confirmPassword = 'Repetí la contraseña.'
    } else if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Las contraseñas no coinciden.'
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
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      })
      const body = await res.json()
      if (!res.ok || (body && body.status && body.status >= 400)) {
        throw new Error(body.message || 'Hubo un error al crear la cuenta.')
      }
      setForm(emptyForm)
      navigate('/login')
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
          <FaUser className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Crear cuenta</h1>
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`${inputClass} ${errors.name ? errorClass : ''}`}
            />
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              className={`${inputClass} ${errors.lastName ? errorClass : ''}`}
            />
            {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
          </div>
          <div className="sm:col-span-2">
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repetir contraseña</label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`${inputClass} ${errors.confirmPassword ? errorClass : ''}`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando cuenta...' : 'Registrarme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Register