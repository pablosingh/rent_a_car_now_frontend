import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaCamera, FaShieldAlt, FaSignOutAlt, FaUser } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

function Profile() {
  const { auth, logout, setUser, authFetch } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState(null)

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
      const body = await res.json()
      if (!res.ok || (body && body.status && body.status >= 400)) {
        throw new Error(body.message || 'Hubo un error al subir la foto.')
      }
      setUser(body.data)
      setMessage({ type: 'success', text: 'Foto de perfil actualizada.' })
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setUploading(false)
    }
  }

  const isAdmin = auth?.user?.role === 'ADMIN'
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

          <span
            className={`inline-flex items-center gap-1 mt-4 px-4 py-1.5 text-sm font-semibold rounded-full ${
              isAdmin
                ? 'bg-violet-100 text-violet-700'
                : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isAdmin ? <FaShieldAlt /> : <FaUser />}
            {isAdmin ? 'Administrador' : 'Usuario'}
          </span>

          <button
            onClick={handleLogout}
            className="mt-8 w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border-2 border-red-500 text-red-500 hover:bg-red-50 cursor-pointer"
          >
            <FaSignOutAlt />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default Profile