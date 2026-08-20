import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function RequireAuth({ admin = false, roles, children }) {
  const { auth } = useAuth()

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  const allowed = roles || (admin ? ['ADMIN'] : null)
  if (allowed && !allowed.includes(auth.user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default RequireAuth