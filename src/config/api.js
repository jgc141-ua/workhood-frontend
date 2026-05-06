const HOST = import.meta.env.HOST || 'http://localhost'
const PORT = import.meta.env.PORT || '8000'
const BASE = HOST + ':' + PORT

export const ENDPOINTS = {
  login: BASE + '/accounts/login/',
  signup: BASE + '/accounts/signup/',
  refresh: BASE + '/accounts/refresh/',
  me: BASE + '/accounts/me/',
  meUpdate: BASE + '/accounts/me/update/',
  members: BASE + '/members/all/',
  memberDetail: BASE + '/members/',
  memberDelete: BASE + '/members/delete/',
  membershipTypes: BASE + '/membership-types/all/',
  membershipTypesActive: BASE + '/membership-types/active/',
  membershipTypeCreate: BASE + '/membership-types/create/',
  membershipTypeUpdate: BASE + '/membership-types/update/',
  membershipTypeDelete: BASE + '/membership-types/delete/',
  benefits: BASE + '/benefits/all/',
  benefitCreate: BASE + '/benefits/create/',
  benefitUpdate: BASE + '/benefits/update/',
  benefitDelete: BASE + '/benefits/delete/',
  resourceTypes: BASE + '/resource-types/all/',
  resourceTypeCreate: BASE + '/resource-types/create/',
  resourceTypeUpdate: BASE + '/resource-types/update/',
  resourceTypeDelete: BASE + '/resource-types/delete/',
  resources: BASE + '/resources/all/',
  resourceCreate: BASE + '/resources/create/',
  resourceUpdate: BASE + '/resources/update/',
  resourceDelete: BASE + '/resources/delete/',
}
