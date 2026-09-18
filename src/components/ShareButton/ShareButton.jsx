import { useState } from 'react'
import { FaShareAlt, FaWhatsapp, FaFacebook, FaTwitter, FaInstagram, FaLink, FaTimes } from 'react-icons/fa'

function ShareButton({ car, variant = 'card', size = 'sm' }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined' ? `${window.location.origin}/car/${car.plate}` : `/car/${car.plate}`
  const title = `${car.brand} ${car.model} ${car.year || ''}`.trim()
  const text = `${car.brand} ${car.model} - $${car.pricePerDay}/día${car.pricePerHour ? ` | $${car.pricePerHour}/hora` : ''} en RentaCarNow`

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url })
        return true
      } catch {
        return false
      }
    }
    return false
  }

  const handleMainClick = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const shared = await shareNative()
    if (!shared) setOpen(true)
  }

  const copyLink = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      window.prompt('Copiá el link:', url)
    }
  }

  const openWindow = (shareUrl, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=500')
  }

  const waUrl = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
  const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  const twUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`

  const handleInstagram = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    const shared = await shareNative()
    if (!shared) {
      await copyLink()
      setTimeout(() => window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer'), 300)
    }
  }

  const btnClass =
    variant === 'floating'
      ? 'w-14 h-14 flex items-center justify-center rounded-full bg-violet-500 text-white shadow-lg hover:bg-violet-700 cursor-pointer text-xl fixed bottom-6 right-6 z-40'
      : size === 'sm'
        ? 'w-7 h-7 text-sm flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow border border-gray-200 hover:bg-white cursor-pointer text-violet-500'
        : 'w-8 h-8 text-base flex items-center justify-center rounded-full bg-white/90 backdrop-blur shadow border border-gray-200 hover:bg-white cursor-pointer text-violet-500'

  return (
    <>
      <button
        onClick={handleMainClick}
        title="Compartir"
        aria-label="Compartir"
        className={btnClass}
      >
        <FaShareAlt />
      </button>

      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Compartir {car.brand} {car.model}</h3>
              <button
                onClick={() => setOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 cursor-pointer"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <button
                onClick={(e) => openWindow(waUrl, e)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-green-50 hover:border-green-200 cursor-pointer"
              >
                <FaWhatsapp className="text-2xl text-green-500" />
                <span className="text-xs font-semibold text-gray-700">WhatsApp</span>
              </button>
              <button
                onClick={(e) => openWindow(fbUrl, e)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-blue-50 hover:border-blue-200 cursor-pointer"
              >
                <FaFacebook className="text-2xl text-blue-600" />
                <span className="text-xs font-semibold text-gray-700">Facebook</span>
              </button>
              <button
                onClick={(e) => openWindow(twUrl, e)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-sky-50 hover:border-sky-200 cursor-pointer"
              >
                <FaTwitter className="text-2xl text-sky-500" />
                <span className="text-xs font-semibold text-gray-700">X</span>
              </button>
              <button
                onClick={handleInstagram}
                className="flex flex-col items-center gap-2 p-3 rounded-xl border border-gray-100 hover:bg-pink-50 hover:border-pink-200 cursor-pointer"
              >
                <FaInstagram className="text-2xl text-pink-500" />
                <span className="text-xs font-semibold text-gray-700">Instagram</span>
              </button>
            </div>
            <div className="p-4 pt-0">
              <button
                onClick={copyLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-violet-500 text-violet-500 hover:bg-violet-50 font-semibold text-sm cursor-pointer"
              >
                <FaLink />
                {copied ? '¡Link copiado!' : 'Copiar link'}
              </button>
              <p className="text-[11px] text-gray-400 text-center mt-2">Instagram no permite compartir URL directo: copiá el link y pegalo en tu historia.</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ShareButton
