const HOST = import.meta.env.HOST || 'http://localhost'
const PORT = import.meta.env.PORT || '8000'
const BASE = HOST + ':' + PORT

export const ENDPOINTS = {
  // Accounts
  login: BASE + '/accounts/login/',
  signup: BASE + '/accounts/signup/',
  refresh: BASE + '/accounts/refresh/',
  me: BASE + '/accounts/me/',
  meUpdate: BASE + '/accounts/me/update/',

  // Members
  members: BASE + '/members/all/',
  memberDetail: BASE + '/members/',
  memberDelete: BASE + '/members/delete/',

  // MembreshipTypes
  membershipTypes: BASE + '/membership-types/all/',
  membershipTypesActive: BASE + '/membership-types/active/',
  membershipTypeCreate: BASE + '/membership-types/create/',
  membershipTypeUpdate: BASE + '/membership-types/update/',
  membershipTypeDelete: BASE + '/membership-types/delete/',

  // Membership
  myMembership: BASE + '/memberships/my-membership/',
  myToggleAutoRenew: BASE + '/memberships/my-toggle-auto-renew/',
  availableResources: BASE + '/memberships/available-resources/',
  subscribe: BASE + '/memberships/subscribe/',
  memberMembership: BASE + '/memberships/member-membership/',
  subscribeMember: BASE + '/memberships/subscribe-member/',
  cancelMembership: BASE + '/memberships/cancel-membership/',
  toggleAutoRenew: BASE + '/memberships/toggle-auto-renew/',

  // Benefits
  benefits: BASE + '/benefits/all/',
  benefitCreate: BASE + '/benefits/create/',
  benefitUpdate: BASE + '/benefits/update/',
  benefitDelete: BASE + '/benefits/delete/',

  // ResourceTypes
  resourceTypes: BASE + '/resource-types/all/',
  resourceTypeCreate: BASE + '/resource-types/create/',
  resourceTypeUpdate: BASE + '/resource-types/update/',
  resourceTypeDelete: BASE + '/resource-types/delete/',

  // Resources
  resources: BASE + '/resources/all/',
  bookableResources: BASE + '/resources/bookable/',
  resourceCreate: BASE + '/resources/create/',
  resourceUpdate: BASE + '/resources/update/',
  resourceDelete: BASE + '/resources/delete/',

  // Reservations
  myReservations: BASE + '/reservations/my/',
  allReservations: BASE + '/reservations/all/',
  createReservation: BASE + '/reservations/create/',
  cancelReservation: BASE + '/reservations/cancel/',
  checkAvailability: BASE + '/reservations/availability/',
  resourceSchedule: BASE + '/reservations/resource-schedule/',

  // SpaceSchedule
  spaceSchedules: BASE + '/space-schedule/all/',
  spaceScheduleCreate: BASE + '/space-schedule/create/',
  spaceScheduleUpdate: BASE + '/space-schedule/update/',
  spaceScheduleDelete: BASE + '/space-schedule/delete/',

  // Accesses
  accessCheckIn: BASE + '/accesses/check-in/',
  accessCheckOut: BASE + '/accesses/check-out/',
  accessLogs: BASE + '/accesses/logs/',
  accessMyLogs: BASE + '/accesses/my-logs/',

  // PaymentMethods
  paymentMethods: BASE + '/payment-methods/all/',
  paymentMethodsVisibles: BASE + '/payment-methods/all-visible/',
  paymentMethodCreate: BASE + '/payment-methods/create/',
  paymentMethodUpdate: BASE + '/payment-methods/update/',
  paymentMethodDelete: BASE + '/payment-methods/delete/',

  // Invoices
  myInvoices: BASE + '/invoices/my/',
  myInvoiceDetail: BASE + '/invoices/my-detail/',
  payInvoice: BASE + '/invoices/pay/',
  allInvoices: BASE + '/invoices/all/',
  adminInvoiceDetail: BASE + '/invoices/invoice-detail/',
  invoiceIssue: BASE + '/invoices/issue/',
  registerPayment: BASE + '/invoices/register-payment/',
  invoiceCancel: BASE + '/invoices/cancel/',
  myInvoicePdf: BASE + '/invoices/my-pdf/',
  adminInvoicePdf: BASE + '/invoices/pdf/',

  // Occupancy
  occupancyCurrent: BASE + '/occupancy/current/',
  occupancyActiveReservations: BASE + '/occupancy/active-reservations/',
  occupancyDailyEvolution: BASE + '/occupancy/daily-evolution/',
  occupancyUsersSummary: BASE + '/occupancy/users-summary/',
  occupancyResourcesSummary: BASE + '/occupancy/resources-summary/',

  // Reports
  reportsRevenue: BASE + '/reports/revenue/',
  reportsRevenueExport: BASE + '/reports/revenue-export/',
}
