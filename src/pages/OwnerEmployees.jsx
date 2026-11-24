import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaArrowLeft, FaTrash, FaUserFriends } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { parseApiResponse } from '../utils/api'

const API_URL = '/api/users'

const emptyForm = {
  name: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
}

function OwnerEmployees() {
  const location = useLocation()
  const { auth, authFetch } = useAuth()
  const [employees, setEmployees] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  const validate = (f) => {
    const e = {}
    if (!f.name.trim()) e.name = 'El nombre es obligatorio.'
    if (!f.lastName.trim()) e.lastName = 'El apellido es obligatorio.'
    if (!f.email.trim()) e.email = 'El email es obligatorio.'
    else if (!EMAIL_RE.test(f.email.trim())) e.email = 'Ingresá un email válido.'
    if (!f.password) e.password = 'La contraseña es obligatoria.'
    else if (f.password.length < 6) e.password = 'La contraseña debe tener al menos 6 caracteres.'
    if (f.phone && f.phone.trim() && !/^\+?[0-9\s\-().]{8,20}$/.test(f.phone.trim())) e.phone = 'WhatsApp inválido.'
    return e
  }

  const backTo = location.pathname.startsWith('/admin') ? '/admin' : '/panel'

  const fetchEmployees = useCallback(
    () =>
      authFetch(API_URL)
        .then(parseApiResponse)
        .then((body) => (body.data || []).filter((u) => u.role === 'EMPLOYEE')),
    [authFetch]
  )

  useEffect(() => {
    let active = true
    fetchEmployees()
      .then((data) => {
        if (active) setEmployees(data)
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
  }, [fetchEmployees])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    if (Object.keys(errs).length) return
    setSaving(true)
    setMessage(null)
    try {
      const fd = new FormData()
      fd.append('name', form.name)
      fd.append('lastName', form.lastName)
      fd.append('email', form.email)
      fd.append('password', form.password)
      if (form.phone && form.phone.trim()) fd.append('phone', form.phone.trim())
      const res = await authFetch(`${API_URL}/employees`, { method: 'POST', body: fd })
      const body = await parseApiResponse(res, 'Hubo un error al crear el empleado.')
      setEmployees((prev) => [...prev, body.data])
      setForm(emptyForm)
      setMessage({ type: 'success', text: 'Empleado creado correctamente.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (employee) => {
    if (!window.confirm(`¿Seguro que querés borrar a ${employee.name} ${employee.lastName}?`)) return
    try {
      const res = await authFetch(`${API_URL}/${employee.id}`, { method: 'DELETE' })
      await parseApiResponse(res, 'Hubo un error al borrar el empleado.')
      setEmployees((prev) => prev.filter((u) => u.id !== employee.id))
    } catch (err) {
      window.alert(err.message)
    }
  }

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400'

  const canCreate = auth?.user?.role === 'OWNER' || auth?.user?.role === 'ADMIN'

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaUserFriends className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Empleados</h1>
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

        {canCreate && (
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input name="name" value={form.name} onChange={handleChange} className={`${inputClass} ${errors.name ? 'border-red-400' : ''}`} />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} className={`${inputClass} ${errors.lastName ? 'border-red-400' : ''}`} />
              {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} className={`${inputClass} ${errors.email ? 'border-red-400' : ''}`} />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} className={`${inputClass} ${errors.password ? 'border-red-400' : ''}`} />
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp (opcional)</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+5491155556666" className={`${inputClass} ${errors.phone ? 'border-red-400' : ''}`} />
              {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={saving || Object.keys(errors).length > 0}
                className="w-full px-4 py-2 text-sm font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Creando...' : 'Crear empleado'}
              </button>
            </div>
          </form>
        )}

        {loading && <p className="text-gray-500 text-center py-8">Cargando empleados...</p>}

        {!loading && !error && employees.length === 0 && (
          <p className="text-gray-500 text-center py-8">No hay empleados.</p>
        )}

        {!loading && employees.length > 0 && (
          <ul className="divide-y divide-gray-100">
            {employees.map((employee) => (
              <li key={employee.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    {employee.name} {employee.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{employee.email}</p>
                  {employee.phone && <p className="text-sm text-gray-500">WhatsApp: {employee.phone}</p>}
                </div>
                <button
                  onClick={() => handleDelete(employee)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-semibold rounded border-2 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
                >
                  <FaTrash />
                  Borrar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default OwnerEmployees