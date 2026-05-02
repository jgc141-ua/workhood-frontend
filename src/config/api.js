const BASE = 'http://192.168.50.213:8000' // IP de mi PC

export const ENDPOINTS = {
  login: BASE + '/accounts/login/',
  signup: BASE + '/accounts/signup/',
  refresh: BASE + '/accounts/refresh/',
  me: BASE + '/accounts/me/',
  meUpdate: BASE + '/accounts/me/update/',
  members: BASE + '/members/',
  memberDetail: BASE + '/members/',
}
