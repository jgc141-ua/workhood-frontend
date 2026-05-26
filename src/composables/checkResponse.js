// Composable para comprobar si no se ha recibido la respuesta

function extractErrorMessages(data) {
  if (typeof data === 'string') return data
  if (Array.isArray(data)) {
    return data.map(extractErrorMessages).filter(Boolean).join('. ')
  }
  if (data && typeof data === 'object') {
    return Object.values(data)
      .map(extractErrorMessages)
      .filter(Boolean)
      .join('. ')
  }
  return ''
}

export async function checkResponse(response, defaultMsg) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    const message = (extractErrorMessages(data) || defaultMsg || 'Error desconocido').trim()
    throw new Error(message)
  }
}
