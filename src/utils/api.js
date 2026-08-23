export const API_ERROR_MESSAGE =
  'Ocurrió un error inesperado. Por favor, intentá de nuevo en unos minutos.'

export async function apiRequest(url, options) {
  try {
    return await fetch(url, options)
  } catch {
    throw new Error(API_ERROR_MESSAGE)
  }
}

export async function parseApiResponse(res, fallbackMessage = API_ERROR_MESSAGE) {
  let body = null
  const text = await res.text()
  if (text.trim()) {
    try {
      body = JSON.parse(text)
    } catch {
      throw new Error(API_ERROR_MESSAGE)
    }
  }
  if (!res.ok || (body && body.status && body.status >= 400)) {
    throw new Error(body?.message || fallbackMessage)
  }
  return body
}
