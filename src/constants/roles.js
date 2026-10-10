export const ROLES = ['USER', 'OWNER', 'EMPLOYEE', 'ADMIN']

export const ROLE_LABELS = {
  USER: 'Usuario',
  OWNER: 'Dueño',
  EMPLOYEE: 'Empleado',
  ADMIN: 'Administrador',
}

export const PERMISSION_LABELS = {
  RESERVATION_CREATE: 'Crear reservas propias',
  RESERVATION_VIEW_SCOPE: 'Ver reservas según su alcance',
  CAR_CREATE: 'Crear autos',
  CAR_EDIT: 'Editar autos',
  CAR_DELETE: 'Borrar autos',
  DISPATCH_RESERVATION: 'Despachar reservas',
  COMPLETE_RESERVATION: 'Completar reservas',
  CANCEL_ANY: 'Cancelar cualquier reserva pendiente',
  REVERT_RESERVATION: 'Revertir estados de reservas',
  EMPLOYEE_MANAGE: 'Crear y gestionar empleados',
  OWNER_VERIFY: 'Verificar cuentas de dueños',
  USER_ROLE_ASSIGN: 'Asignar roles a usuarios',
  CATALOG_MANAGE: 'Gestionar categorías y features',
  POLICY_MANAGE: 'Gestionar políticas',
  RATING_MODERATE: 'Moderar puntuaciones',
}
