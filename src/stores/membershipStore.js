import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const useMembershipStore = defineStore('membership', () => {
  // State
  const myMembership = ref(null)
  const availableResources = ref([])
  const loading = ref(false)
  const error = ref(null)

  const tokenStore = useTokenStore()

  // Getters
  const hasActiveMembership = computed(() => !!myMembership.value)

  // Actions
  async function fetchMyMembership() {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(ENDPOINTS.myMembership, {}, tokenStore)
      if (response.status === 404) {
        myMembership.value = null
        return null
      }
      await checkResponse(response, 'Error al cargar tu membresía')

      const data = await response.json()
      myMembership.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar tu membresía'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchAvailableResources(membershipTypeId) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      query.set('membership_type', membershipTypeId)

      const response = await apiFetch(
        `${ENDPOINTS.availableResources}?${query.toString()}`,
        {},
        tokenStore,
      )
      await checkResponse(response, 'Error al cargar recursos disponibles')

      const data = await response.json()
      availableResources.value = Array.isArray(data) ? data : data.results || []
      return availableResources.value
    } catch (err) {
      error.value = err.message || 'Error al cargar recursos disponibles'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function subscribe(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.subscribe,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al suscribirte')

      const data = await response.json()
      myMembership.value = data
      return data
    } catch (err) {
      error.value = err.message || 'Error al suscribirte'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function subscribeMember(email, payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.subscribeMember,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, ...payload }),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al suscribir al miembro')

      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error al suscribir al miembro'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchMemberMembership(email) {
    loading.value = true
    error.value = null
    try {
      const query = new URLSearchParams()
      query.set('email', email)

      const response = await apiFetch(
        `${ENDPOINTS.memberMembership}?${query.toString()}`,
        {},
        tokenStore,
      )
      if (response.status === 404) {
        return null
      }
      await checkResponse(response, 'Error al cargar la suscripción del miembro')

      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error al cargar la suscripción del miembro'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function cancelMemberMembership(email) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.cancelMembership,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al cancelar la suscripción')

      return await response.json()
    } catch (err) {
      error.value = err.message || 'Error al cancelar la suscripción'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearMembership() {
    myMembership.value = null
    availableResources.value = []
    error.value = null
  }

  return {
    myMembership,
    availableResources,
    loading,
    error,
    hasActiveMembership,
    fetchMyMembership,
    fetchAvailableResources,
    subscribe,
    fetchMemberMembership,
    subscribeMember,
    cancelMemberMembership,
    clearMembership,
  }
})
