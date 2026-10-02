import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaBriefcase, FaCamera, FaCheckCircle, FaClock, FaShieldAlt, FaSignOutAlt, FaTrashAlt, FaUser, FaUserTie } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { parseApiResponse } from '../utils/api'

function Profile() {
  const { auth, logout, setUser, authFetch } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)
  const [editingPhone, setEditingPhone] = useState(false)
  const [phone, setPhone] = useState(auth?.user?.phone || '')
  const [phoneError, setPhoneError] = useState(null)
  const [savingPhone, setSavingPhone] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handlePhotoChange = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    setUploading(true)
    setMessage(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await authFetch(`/api/users/${auth.user.id}/photo`, { method: 'POST', body: fd })
      const body = await parseApiResponse(res, 'Hubo un error al subir la foto.')
      setUser(body.data)
      setMessage({ type: 'success', text: 'Foto de perfil actualizada.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUploading(false)
    }
  }

  const handleDeletePhoto = async () => {
    if (!window.confirm('¿Eliminar tu foto de perfil?')) return
    setUploading(true)
    setMessage(null)
    try {
      const res = await authFetch(`/api/users/${auth.user.id}/photo`, { method: 'DELETE' })
      const body = await parseApiResponse(res, 'Hubo un error al eliminar la foto.')
      setUser(body.data)
      setMessage({ type: 'success', text: 'Foto de perfil eliminada.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUploading(false)
    }
  }

  const handleSavePhone = async () => {
    const value = (phone || '').trim()
    if (value && !/^\+?[0-9\s\-().]{8,20}$/.test(value)) {
      setPhoneError('Ingresá un teléfono válido (ej +5491155556666).')
      return
    }
    setPhoneError(null)
    setSavingPhone(true)
    try {
      const res = await authFetch(`/api/users/${auth.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: value || '' }),
      })
      const body = await parseApiResponse(res, 'Hubo un error al guardar el teléfono.')
      setUser(body.data)
      setEditingPhone(false)
      setMessage({ type: 'success', text: 'WhatsApp actualizado.' })
    } catch (err) {
      setPhoneError(err.message)
    } finally {
      setSavingPhone(false)
    }
  }

  const role = auth?.user?.role
  const roleInfo = {
    ADMIN: { label: 'Administrador', icon: FaShieldAlt, cls: 'bg-violet-100 text-violet-700' },
    OWNER: { label: 'Dueño', icon: FaUserTie, cls: 'bg-amber-100 text-amber-700' },
    EMPLOYEE: { label: 'Empleado', icon: FaBriefcase, cls: 'bg-blue-100 text-blue-700' },
    USER: { label: 'Usuario', icon: FaUser, cls: 'bg-gray-100 text-gray-700' },
  }
  const currentRole = roleInfo[role] || roleInfo.USER
  const RoleIcon = currentRole.icon
  const isVerified = auth.user.verified === true
  const initials = `${auth.user.name.charAt(0).toUpperCase()}${auth.user.lastName.charAt(0).toUpperCase()}`

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-violet-500 p-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Cambiar foto"
            className="relative w-20 h-20 rounded-full bg-white flex items-center justify-center overflow-hidden group cursor-pointer"
          >
            {auth.user.photoPath ? (
              <img src={auth.user.photoPath} alt="Foto de perfil" className="w-full h-full object-cover" />
            ) : (
              <span className="text-violet-500 text-2xl font-bold">{initials}</span>
            )}
            <span className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <FaCamera />
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
          {uploading && <p className="text-white text-xs">Subiendo foto...</p>}
          {message && (
            <p
              className={`text-xs ${
                message.type === 'success' ? 'text-green-200' : 'text-red-200'
              }`}
            >
              {message.text}
            </p>
          )}
        </div>

        <div className="p-6 md:p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800">
            {auth.user.name} {auth.user.lastName}
          </h1>
          <p className="text-gray-500 mt-1">{auth.user.email}</p>
          {auth.user.phone && <p className="text-gray-500 mt-1">WhatsApp: {auth.user.phone}</p>}

          <div className="mt-4">
            {editingPhone ? (
              <div className="flex flex-col gap-2">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+5491155556666"
                  className="px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400 text-left"
                />
                {phoneError && <p className="text-xs text-red-600">{phoneError}</p>}
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={handleSavePhone}
                    disabled={savingPhone}
                    className="px-4 py-1.5 text-xs font-semibold rounded bg-violet-500 text-white hover:bg-violet-600 disabled:opacity-50 cursor-pointer"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => { setEditingPhone(false); setPhone(auth.user.phone || ''); setPhoneError(null) }}
                    className="px-4 py-1.5 text-xs font-semibold rounded border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setEditingPhone(true); setPhone(auth.user.phone || '') }}
                className="text-xs font-semibold text-violet-600 hover:text-violet-800 underline cursor-pointer"
              >
                {auth.user.phone ? 'Editar WhatsApp' : 'Agregar WhatsApp'}
              </button>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1 mt-4 px-4 py-1.5 text-sm font-semibold rounded-full ${currentRole.cls}`}
          >
            <RoleIcon />
            {currentRole.label}
          </span>

          {role === 'OWNER' && (
            <span
              className={`inline-flex items-center gap-1 mt-2 px-4 py-1.5 text-sm font-semibold rounded-full ${
                isVerified
                  ? 'bg-green-100 text-green-700'
                  : 'bg-amber-100 text-amber-700'
              }`}
            >
              {isVerified ? <FaCheckCircle /> : <FaClock />}
              {isVerified ? 'Verificado' : 'Pendiente de verificación'}
            </span>
          )}

          <button
            onClick={handleLogout}
            className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
          >
            <FaSignOutAlt />
            Cerrar sesión
          </button>

          {auth.user.photoPath && (
            <button
              onClick={handleDeletePhoto}
              disabled={uploading}
              className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-gray-300 text-gray-500 hover:border-red-400 hover:text-red-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaTrashAlt />
              Eliminar foto
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Profile