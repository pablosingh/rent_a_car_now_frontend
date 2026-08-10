import { FaTimesCircle } from 'react-icons/fa'

function AdminOnly({ children, enabled = true }) {
  if (!enabled) return children

  return (
    <>
      <div className="sm:hidden text-center py-24">
        <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-800">No disponible</p>
      </div>
      <div className="hidden sm:block">{children}</div>
    </>
  )
}

export default AdminOnly
