import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { ENDPOINTS } from '@/config/api'
import { useTokenStore } from './tokenStore'
import { apiFetch } from '@/composables/apiClient'
import { checkResponse } from '@/composables/checkResponse'

export const usePaymentMethodStore = defineStore('paymentMethods', () => {
  const allPaymentMethods = ref([])
  const paymentMethods = ref([])
  const loading = ref(false)
  const error = ref(null)
  const page = ref(1)
  const pageSize = ref(3)

  const count = computed(() => allPaymentMethods.value.length)
  const totalPages = computed(() => Math.max(1, Math.ceil(count.value / pageSize.value)))

  const tokenStore = useTokenStore()

  function applyPagination() {
    const start = (page.value - 1) * pageSize.value
    paymentMethods.value = allPaymentMethods.value.slice(start, start + pageSize.value)
  }

  function setPage(newPage) {
    if (newPage < 1 || newPage > totalPages.value) return
    page.value = newPage
    applyPagination()
  }

  function setPageSize(newPageSize) {
    pageSize.value = newPageSize
    page.value = 1
    applyPagination()
  }

  async function fetchPaymentMethods() {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(ENDPOINTS.paymentMethods, {}, tokenStore)
      await checkResponse(response, 'Error al cargar métodos de pago')

      const data = await response.json()
      allPaymentMethods.value = Array.isArray(data) ? data : data.results || []
      page.value = 1
      applyPagination()

      return data
    } catch (err) {
      error.value = err.message || 'Error al cargar métodos de pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function createPaymentMethod(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.paymentMethodCreate,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al crear el método de pago')

      await fetchPaymentMethods()
      return paymentMethods.value
    } catch (err) {
      error.value = err.message || 'Error al crear el método de pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updatePaymentMethod(payload) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.paymentMethodUpdate,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al actualizar el método de pago')

      await fetchPaymentMethods()
      return paymentMethods.value
    } catch (err) {
      error.value = err.message || 'Error al actualizar el método de pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deletePaymentMethod(name) {
    loading.value = true
    error.value = null
    try {
      const response = await apiFetch(
        ENDPOINTS.paymentMethodDelete,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        },
        tokenStore,
      )

      await checkResponse(response, 'Error al eliminar el método de pago')

      await fetchPaymentMethods()
      return true
    } catch (err) {
      error.value = err.message || 'Error al eliminar el método de pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  function clearPaymentMethods() {
    allPaymentMethods.value = []
    paymentMethods.value = []
    error.value = null
    page.value = 1
    pageSize.value = 3
  }

  return {
    allPaymentMethods,
    paymentMethods,
    loading,
    error,
    count,
    page,
    pageSize,
    totalPages,
    fetchPaymentMethods,
    createPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setPage,
    setPageSize,
    clearPaymentMethods,
  }
})
