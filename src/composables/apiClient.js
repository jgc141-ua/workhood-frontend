/**
 * Cliente HTTP con reintento automático ante 401.
 * Inyecta el access token y, si expira, intenta refrescarlo
 * antes de volver a lanzar la petición original.
 */
import router from '@/router'

export async function apiFetch(url, options = {}, tokenStore) {
  // Lanza una petición inyectando el token de acceso en la cabecera
  function makeRequest(token) {
    const headers = new Headers(options.headers || {})
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return fetch(url, { ...options, headers })
  }

  let res = await makeRequest(tokenStore.accessToken)

  // Reintenta tras refrescar el token si recibe un 401
  if (res.status === 401) {
    const ok = await tokenStore.refreshAccessToken()
    if (!ok) {
      tokenStore.clearTokens()
      router.push('/login')
      throw new Error('Sesion expirada. Por favor, inicia sesion de nuevo.')
    }
    res = await makeRequest(tokenStore.accessToken)
  }

  return res
}
