import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function RequireAuth({ admin = false, children }) {
  const { auth } = useAuth()

  if (!auth) {
    return <Navigate to="/login" replace />
  }

  if (admin && auth.user?.role !== 'ADMIN') {
    return <Navigate to="/" replace />
  }

  return children
}

export default RequireAuth