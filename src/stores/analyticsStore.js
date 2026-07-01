import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const useAnalyticsStore = defineStore('analytics', () => {
  // State y getters
  const activeCheckins = ref([])
  const activeCheckinsCount = ref(0)
  const activeReservations = ref([])
  const activeReservationsCount = ref(0)
  const dailyEvolution = ref([])
  const dailyEvolutionDate = ref(null)
  const usersSummary = ref({ members_total: 0, members_miembro: 0, members_itinerante: 0 })
  const resourcesSummary = ref({ resources_total: 0, resources_active: 0 })
  const revenue = ref({
    period: 'month',
    date: null,
    facturado: 0,
    cobrado: 0,
    by_membership: [],
    by_service: [],
    trend: [],
  })
  const loading = ref(false)
  const error = ref(null)

  const tokenStore = useTokenStore()

  // Actions
  async function fetchCurrent() {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(ENDPOINTS.occupancyCurrent, {}, tokenStore)
      await checkResponse(response, 'Error al cargar la ocupación actual')
      const data = await response.json()
      activeCheckins.value = data.active_checkins || []
      activeCheckinsCount.value = data.count || 0
      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar la ocupación actual'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchActiveReservations() {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(ENDPOINTS.occupancyActiveReservations, {}, tokenStore)
      await checkResponse(response, 'Error al cargar las reservas activas')
      const data = await response.json()
      activeReservations.value = data.active_reservations || []
      activeReservationsCount.value = data.count || 0
      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar las reservas activas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchOccupancy() {
    loading.value = true
    error.value = null
    try {
      await Promise.all([fetchCurrent(), fetchActiveReservations()])
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchDailyEvolution(date = null) {
    loading.value = true
    error.value = null
    try {
      const url = date
        ? `${ENDPOINTS.occupancyDailyEvolution}?date=${date}`
        : ENDPOINTS.occupancyDailyEvolution
      const response = await apiFetch(url, {}, tokenStore)
      await checkResponse(response, 'Error al cargar la evolución diaria')
      const data = await response.json()
      dailyEvolution.value = data.evolution || []
      dailyEvolutionDate.value = data.date || null
      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar la evolución diaria'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchUsersSummary() {
    try {
      const response = await apiFetch(ENDPOINTS.occupancyUsersSummary, {}, tokenStore)
      await checkResponse(response, 'Error al cargar el resumen de miembros')
      usersSummary.value = await response.json()
    } catch (err) {
      error.value = err.message || 'Error al cargar el resumen de miembros'
    }
  }

  async function fetchResourcesSummary() {
    try {
      const response = await apiFetch(ENDPOINTS.occupancyResourcesSummary, {}, tokenStore)
      await checkResponse(response, 'Error al cargar el resumen de recursos')
      resourcesSummary.value = await response.json()
    } catch (err) {
      error.value = err.message || 'Error al cargar el resumen de recursos'
    }
  }

  async function fetchAnalyticsSummary() {
    loading.value = true
    error.value = null
    try {
      await Promise.all([fetchOccupancy(), fetchUsersSummary(), fetchResourcesSummary()])
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function fetchRevenue(period = 'month', date = null) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      query.set('period', period)
      if (date) query.set('date', date)
      const response = await apiFetch(
        `${ENDPOINTS.reportsRevenue}?${query.toString()}`,
        {},
        tokenStore,
      )
      await checkResponse(response, 'Error al cargar el informe de ingresos')
      revenue.value = await response.json()
    } catch (err) {
      error.value = err.message || 'Error al cargar el informe de ingresos'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function downloadRevenueCsv(period = 'month', date = null) {
    const query = new URLSearchParams()
    query.set('period', period)
    if (date) query.set('date', date)
    try {
      const response = await apiFetch(
        `${ENDPOINTS.reportsRevenueExport}?${query.toString()}`,
        {},
        tokenStore,
      )
      if (!response.ok) throw new Error('Error al descargar el CSV')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ingresos_${date || new Date().toISOString().split('T')[0]}_${period}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      error.value = err.message || 'Error al descargar el CSV'
      throw err
    }
  }

  return {
    activeCheckins,
    activeCheckinsCount,
    activeReservations,
    activeReservationsCount,
    dailyEvolution,
    dailyEvolutionDate,
    usersSummary,
    resourcesSummary,
    revenue,
    loading,
    error,
    fetchCurrent,
    fetchActiveReservations,
    fetchOccupancy,
    fetchDailyEvolution,
    fetchUsersSummary,
    fetchResourcesSummary,
    fetchAnalyticsSummary,
    fetchRevenue,
    downloadRevenueCsv,
  }
})
