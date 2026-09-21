import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBalanceScale, FaClock, FaShieldAlt, FaFileContract, FaEnvelope, FaArrowLeft } from 'react-icons/fa'

const ICONS = {
  'reservas-tarifas': FaClock,
  'cancelaciones': FaFileContract,
  'uso-responsabilidades': FaBalanceScale,
  'privacidad': FaShieldAlt,
  'propietarios-contenido': FaFileContract,
  'contacto': FaEnvelope,
}

const FALLBACK = [
  {
    id: 1,
    title: 'Reservas y Tarifas',
    slug: 'reservas-tarifas',
    displayOrder: 1,
    content:
      'Las reservas se realizan exclusivamente a través de la plataforma con autenticación. El precio se calcula por hora: se cobra la hora completa (ceil) según la tarifa por hora del vehículo. Toda reserva debe durar al menos 1 hora y sus horarios de inicio y fin deben caer en intervalos de 30 minutos (00 o 30). Si la duración supera las 48 horas, se aplica un 10% de descuento sobre el total. Entre reservas del mismo vehículo se respeta un buffer de 1 hora: no se puede solapar ni dejar menos de 60 minutos libres. El vehículo debe estar marcado como disponible; de lo contrario la reserva es rechazada. Los horarios se guardan en UTC y se muestran al usuario en hora local de Argentina (America/Argentina/Buenos_Aires).',
  },
  {
    id: 2,
    title: 'Cancelaciones y Reembolsos',
    slug: 'cancelaciones',
    displayOrder: 2,
    content:
      'Podés cancelar tu reserva hasta 24 horas antes del inicio sin cargo. Cancelaciones con menos de 24 h de anticipación tienen una retención del 30% del total. Si no te presentás (no-show), se cobra el 100% de la reserva. Las cancelaciones por causa del proveedor (vehículo no disponible, falla mecánica) generan reembolso total sin retenciones. Para solicitar cancelación, contactanos desde tu panel en Mis Reservas o por los canales de contacto. Los reembolsos se acreditan dentro de los 5 a 10 días hábiles por el mismo medio de pago.',
  },
  {
    id: 3,
    title: 'Uso del Vehículo y Responsabilidades',
    slug: 'uso-responsabilidades',
    displayOrder: 3,
    content:
      'El conductor debe presentar licencia vigente, DNI y ser mayor de 21 años. El vehículo se entrega con tanque y condiciones documentadas con fotos; debe devolverse en el mismo estado, con tolerancia de 1 hora de buffer entre reservas. Está prohibido fumar, transportar sustancias ilegales o exceder la capacidad del vehículo. Multas, peajes y daños por mal uso son responsabilidad del titular de la reserva. Ante siniestro, el usuario debe dar aviso inmediato y realizar la denuncia correspondiente; el seguro básico está incluido y la franquicia varía por categoría. Kilometraje libre dentro del territorio argentino salvo que la categoría indique lo contrario.',
  },
  {
    id: 4,
    title: 'Privacidad y Protección de Datos',
    slug: 'privacidad',
    displayOrder: 4,
    content:
      'Tratamos tus datos (nombre, email, reservas, fotos de perfil) conforme a la Ley 25.326 de Protección de Datos Personales. Usamos tu información para gestionar reservas, autenticación JWT y comunicaciones del servicio. No compartimos datos con terceros salvo obligación legal o proveedores esenciales (pagos, hosting). Las contraseñas se almacenan hasheadas con BCrypt y nunca se exponen vía API. Podés solicitar acceso, rectificación o eliminación de tus datos escribiendo a privacidad@rentacarnow.com. Conservamos reservas y facturación por 5 años por obligaciones legales.',
  },
  {
    id: 5,
    title: 'Propietarios, Categorías y Contenido',
    slug: 'propietarios-contenido',
    displayOrder: 5,
    content:
      'Cada vehículo pertenece a un propietario (OWNER) verificado por un ADMIN; los empleados (EMPLOYEE) gestionan los autos de su OWNER. Las categorías (Económico, Compacto, Mediano, SUV, Pickup, Familiar, Premium, Utilitario, Eléctrico) son administradas por ADMIN; eliminar una categoría elimina en cascada todos sus vehículos, reservas, favoritos y archivos asociados. Las características (features) describen equipamiento y se gestionan por ADMIN. Las imágenes se almacenan en el servidor y se sirven desde /uploads; el contenido subido debe respetar derechos de terceros.',
  },
  {
    id: 6,
    title: 'Contacto y Soporte',
    slug: 'contacto',
    displayOrder: 6,
    content:
      'RentaCarNow — Tu viaje empieza aquí. Soporte: soporte@rentacarnow.com | Tel: +54 11 5555-0123 | Lun a Vie 9 a 18 h (America/Argentina/Buenos_Aires). Domicilio: Av. Corrientes 1234, CABA, Argentina. Para consultas sobre reservas, verificaciones de OWNER o reclamos, usá tu panel o escribinos por estos canales. Términos vigentes desde septiembre de 2026; nos reservamos el derecho de actualizar estas políticas con aviso previo en la plataforma.',
  },
]

function Policies() {
  const [policies, setPolicies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/policies')
      .then((r) => r.json())
      .then((body) => {
        if (!active) return
        const data = body?.data
        if (Array.isArray(data) && data.length > 0) {
          const sorted = [...data].sort((a, b) => a.displayOrder - b.displayOrder)
          setPolicies(sorted)
        } else {
          setPolicies(FALLBACK)
        }
      })
      .catch(() => {
        if (active) setPolicies(FALLBACK)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6">
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="bg-violet-500 px-6 py-8 md:px-8 text-white">
          <div className="flex items-center gap-3">
            <FaBalanceScale className="text-3xl" />
            <h1 className="text-2xl md:text-3xl font-bold">Políticas de la empresa</h1>
          </div>
          <p className="mt-3 text-violet-100 text-sm md:text-base">
            Conocé las reglas que rigen el uso de RentaCarNow: reservas, tarifas, cancelaciones, responsabilidades y privacidad.
            Última actualización: septiembre 2026.
          </p>
        </div>

        <nav className="px-6 md:px-8 py-4 bg-violet-50 border-b border-violet-100 flex flex-wrap gap-2">
          {(!loading ? policies : FALLBACK).map((p) => (
            <a
              key={p.slug}
              href={`#${p.slug}`}
              className="px-3 py-1.5 text-xs md:text-sm font-semibold rounded-full border border-violet-200 text-violet-700 hover:bg-violet-100"
            >
              {p.title}
            </a>
          ))}
        </nav>

        <div className="px-6 md:px-8 py-8">
          {loading && <p className="text-gray-500 text-center py-8">Cargando políticas...</p>}

          {!loading &&
            policies.map((p) => {
              const Icon = ICONS[p.slug] || FaFileContract
              return (
                <section key={p.id} id={p.slug} className="scroll-mt-32 py-6 border-b last:border-0 border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center">
                      <Icon className="text-sm" />
                    </span>
                    <h2 className="text-lg md:text-xl font-bold text-gray-800">{p.title}</h2>
                  </div>
                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{p.content}</p>
                </section>
              )
            })}
        </div>
      </div>

      <p className="text-xs text-gray-400 text-center mt-6">
        Ante dudas, escribinos a soporte@rentacarnow.com — RentaCarNow 2026.
      </p>
    </div>
  )
}

export default Policies
