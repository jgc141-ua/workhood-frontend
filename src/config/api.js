const HOST = import.meta.env.HOST || 'http://localhost'
const PORT = import.meta.env.PORT || '8000'
const BASE = HOST + ':' + PORT

export const ENDPOINTS = {
  login: BASE + '/accounts/login/',
  signup: BASE + '/accounts/signup/',
  refresh: BASE + '/accounts/refresh/',
  me: BASE + '/accounts/me/',
  meUpdate: BASE + '/accounts/me/update/',
  members: BASE + '/members/',
  memberDetail: BASE + '/members/',
}
