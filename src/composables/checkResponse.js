// Composable para comprobar si no se ha recibido la respuesta
export async function checkResponse(response, defaultMsg) {
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.detail || defaultMsg)
  }
}
