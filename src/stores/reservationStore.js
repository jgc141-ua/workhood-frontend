import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const useReservationStore = defineStore('reservations', () => {
  // State
  const reservations = ref([])
  const count = ref(0)
  const next = ref(null)
  const previous = ref(null)
  const page = ref(1)
  const pageSize = ref(5)

  const recentReservations = ref([])

  const allReservations = ref([])
  const allCount = ref(0)
  const allPage = ref(1)
  const allPageSize = ref(10)
  const allNext = ref(null)
  const allPrevious = ref(null)

  const loading = ref(false)
  const error = ref(null)

  // Getters
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))
  const hasNextPage = computed(() => !!next.value)
  const hasPreviousPage = computed(() => !!previous.value)

  // Modal de cancelación compartido entre vistas
  const isCancelModalOpen = ref(false)
  const reservationToCancel = ref(null)

  // Modal global de "nueva reserva" disparado desde el sidebar
  const isNewReservationModalOpen = ref(false)

  const tokenStore = useTokenStore()

  async function setMyPage(newPage) {
    if (newPage < 1 || newPage > totalPages.value) return
    await fetchMyReservations({ page: newPage })
  }

  async function setMyPageSize(newPageSize) {
    pageSize.value = newPageSize
    await fetchMyReservations({ page: 1 })
  }

  // Actions
  async function fetchMyReservations(params = {}) {
    loading.value = true
    error.value = null
    try {
      const currentPage = params.page ?? page.value
      const currentPageSize = params.page_size ?? pageSize.value

      const query = new URLSearchParams()
      query.set('page', currentPage)
      query.set('page_size', currentPageSize)

      if (params.state) query.set('state', params.state)
      if (params.resource_type) query.set('resource_type', params.resource_type)
      if (params.upcoming != null) query.set('upcoming', params.upcoming)

      const response = await apiFetch(
        `${ENDPOINTS.myReservations}?${query.toString()}`,
        {},
        tokenStore,
      )
      await checkResponse(response, 'Error al cargar tus reservas')

      const data = await response.json()
      reservations.value = data.results || []
      count.value = data.count || 0
      next.value = data.next
      previous.value = data.previous
      page.value = currentPage
      pageSize.value = currentPageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar tus reservas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchRecentReservations(limit = 2) {
    try {
      const response = await apiFetch(
        `${ENDPOINTS.myReservations}?page_size=${limit}&today=true`,
        {},
        tokenStore,
      )
      await checkResponse(response, 'Error al cargar tus reservas recientes')

      const data = await response.json()
      recentReservations.value = data.results || []
      return recentReservations.value
    } catch (err) {
      error.value = err.message || 'Error al cargar tus reservas recientes'
      throw err
    }
  }

  async function fetchAllReservations(params = {}) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()

      const page = params.page ?? allPage.value
      const pageSize = params.pageSize ?? allPageSize.value

      query.set('page', page)
      query.set('page_size', pageSize)

      if (params.state) query.set('state', params.state)
      if (params.resource_type) query.set('resource_type', params.resource_type)
      if (params.upcoming != null) query.set('upcoming', params.upcoming)

      const response = await apiFetch(
        `${ENDPOINTS.allReservations}?${query.toString()}`,
        {},
        tokenStore,
      )
      await checkResponse(response, 'Error al cargar las reservas')

      const data = await response.json()
      allReservations.value = data.results || []
      allCount.value = data.count || 0
      allNext.value = data.next
      allPrevious.value = data.previous
      allPage.value = page
      allPageSize.value = pageSize

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar las reservas'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelReservation(reservationId) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.cancelReservation,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: reservationId }),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al cancelar la reserva')

      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error al cancelar la reserva'
      throw err
    } finally {
      loading.value = false
    }
  }

  function openCancelModal(reservation) {
    reservationToCancel.value = reservation
    isCancelModalOpen.value = true
  }

  function closeCancelModal() {
    isCancelModalOpen.value = false
  }

  function resetCancelModal() {
    reservationToCancel.value = null
  }

  function openNewReservationModal() {
    isNewReservationModalOpen.value = true
  }

  function closeNewReservationModal() {
    isNewReservationModalOpen.value = false
  }

  async function confirmCancel(onSuccess) {
    if (!reservationToCancel.value) return

    try {
      await cancelReservation(reservationToCancel.value.id)
      closeCancelModal()
      onSuccess?.()
    } catch (err) {
      throw err
    }
  }

  async function createReservation(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.createReservation,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al crear la reserva')

      const created = await response.json()
      await fetchMyReservations()
      return created
    } catch (err) {
      error.value = err.message || 'Error al crear la reserva'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function checkAvailability(resource, startTime, endTime) {
    error.value = null
    try {
      const query = new URLSearchParams()
      query.set('resource', resource)
      query.set('start_time', startTime)
      query.set('end_time', endTime)

      const response = await apiFetch(
        `${ENDPOINTS.checkAvailability}?${query.toString()}`,
        {},
        tokenStore,
      )
      await checkResponse(response, 'Error al comprobar disponibilidad')

      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error al comprobar disponibilidad'
      throw err
    }
  }

  async function fetchResourceSchedule(resourceId, date) {
    error.value = null
    try {
      const query = new URLSearchParams()
      query.set('resource', resourceId)
      query.set('date', date)

      const response = await apiFetch(
        `${ENDPOINTS.resourceSchedule}?${query.toString()}`,
        {},
        tokenStore,
      )
      await checkResponse(response, 'Error al cargar el horario del recurso')

      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error al cargar el horario del recurso'
      throw err
    }
  }

  return {
    reservations,
    recentReservations,
    count,
    next,
    previous,
    page,
    pageSize,
    totalPages,
    hasNextPage,
    hasPreviousPage,
    allReservations,
    allCount,
    allPage,
    allPageSize,
    allNext,
    allPrevious,
    loading,
    error,
    isCancelModalOpen,
    reservationToCancel,
    isNewReservationModalOpen,
    fetchMyReservations,
    fetchRecentReservations,
    fetchAllReservations,
    setMyPage,
    setMyPageSize,
    createReservation,
    cancelReservation,
    openCancelModal,
    closeCancelModal,
    resetCancelModal,
    openNewReservationModal,
    closeNewReservationModal,
    confirmCancel,
    checkAvailability,
    fetchResourceSchedule,
  }
})
