import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArrowLeft, FaCar, FaPlus, FaTrash } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'

const API_URL = '/api/cars'

const emptyForm = {
  plate: '',
  brand: '',
  model: '',
  year: '',
  pricePerDay: '',
  pricePerHour: '',
  available: true,
}

function CreateCar() {
  const { authFetch } = useAuth()
  const [form, setForm] = useState(emptyForm)
  const [images, setImages] = useState([])
  const imagesRef = useRef(images)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith('image/'))
    setImages((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ])
    e.target.value = ''
  }

  const removeImage = (index) => {
    setImages((prev) => {
      const next = [...prev]
      URL.revokeObjectURL(next[index].preview)
      next.splice(index, 1)
      return next
    })
  }

  useEffect(() => {
    return () => imagesRef.current.forEach((img) => URL.revokeObjectURL(img.preview))
  }, [])

  const uploadImages = async (plate) => {
    const failures = []
    for (const img of images) {
      const fd = new FormData()
      fd.append('file', img.file)
      try {
        const res = await authFetch(`${API_URL}/${plate}/images`, { method: 'POST', body: fd })
        const body = await res.json()
        if (!res.ok || (body && body.status && body.status >= 400)) throw new Error()
      } catch {
        failures.push(img.file.name)
      }
    }
    return failures
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const res = await authFetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          year: Number(form.year),
          pricePerDay: Number(form.pricePerDay),
          pricePerHour: Number(form.pricePerHour),
        }),
      })

      const body = await res.json()

      if (!res.ok || (body && body.status && body.status >= 400)) {
        throw new Error(body.message || 'Hubo un error al crear el auto.')
      }

      const failures = await uploadImages(body.data.plate)

      if (failures.length === 0) {
        setMessage({ type: 'success', text: 'Auto creado correctamente.' })
      } else {
        setMessage({
          type: 'error',
          text: `Auto creado, pero ${failures.length} imagen(es) no se subieron: ${failures.join(', ')}`,
        })
      }
      setForm(emptyForm)
      images.forEach((img) => URL.revokeObjectURL(img.preview))
      setImages([])
    } catch (err) {
      setMessage({ type: 'error', text: err.message })
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-400'

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-800 mb-6"
      >
        <FaArrowLeft />
        Volver
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
        <div className="flex items-center gap-2 mb-6">
          <FaCar className="text-violet-500 text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Crear auto</h1>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Patente</label>
            <input name="plate" value={form.plate} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
            <input name="brand" value={form.brand} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Modelo</label>
            <input name="model" value={form.model} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <input name="year" type="number" value={form.year} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio por día</label>
            <input name="pricePerDay" type="number" step="0.01" value={form.pricePerDay} onChange={handleChange} required className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio por hora</label>
            <input name="pricePerHour" type="number" step="0.01" value={form.pricePerHour} onChange={handleChange} required className={inputClass} />
          </div>
          <label className="flex items-center gap-2 col-span-1 sm:col-span-2 text-sm font-medium text-gray-700 cursor-pointer">
            <input
              name="available"
              type="checkbox"
              checked={form.available}
              onChange={handleChange}
              className="w-4 h-4 accent-violet-500"
            />
            Disponible
          </label>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Fotos</label>
            <label className="flex flex-col items-center justify-center gap-2 w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-pointer hover:border-violet-400 hover:text-violet-500 transition">
              <FaPlus className="text-2xl" />
              <span className="text-sm">Agregar fotos (máx. varias)</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                {images.map((img, index) => (
                  <div key={img.preview} className="relative group rounded-lg overflow-hidden border border-gray-200">
                    <img src={img.preview} alt={`Foto ${index + 1}`} className="w-full h-24 object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      <FaTrash className="text-xs" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-3 text-lg font-semibold rounded-lg bg-violet-500 text-white hover:bg-violet-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creando...' : 'Crear auto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateCar