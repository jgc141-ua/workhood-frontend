/**
 * Cliente HTTP con reintento automático ante 401.
 * Inyecta el access token y, si expira, intenta refrescarlo
 * antes de volver a lanzar la petición original.
 */

export async function apiFetch(url, options = {}, tokenStore) {
  const makeRequest = (token) => {
    const headers = new Headers(options.headers || {})
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }
    return fetch(url, { ...options, headers })
  }

  let res = await makeRequest(tokenStore.accessToken)

  if (res.status === 401) {
    const ok = await tokenStore.refreshAccessToken()
    if (!ok) {
      tokenStore.clearTokens()
      throw new Error('Sesion expirada. Por favor, inicia sesion de nuevo.')
    }
    res = await makeRequest(tokenStore.accessToken)
  }

  return res
}
