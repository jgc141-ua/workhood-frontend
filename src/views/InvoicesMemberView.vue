<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { IonContent, onIonViewWillEnter } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import AppModal from '@/components/AppModal.vue'
import DataTablePagination from '@/components/DataTablePagination.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'

const invoiceStore = useInvoiceStore()
const authStore = useAuthStore()

const selectedState = ref('all')
const isDetailModalOpen = ref(false)
const isLoadingDetail = ref(false)

const stateLabels = {
  EMITIDA: 'Emitida',
  PAGADA: 'Pagada',
  VENCIDA: 'Vencida',
  ANULADA: 'Anulada',
}

const stateOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'EMITIDA', label: 'Emitidas' },
  { value: 'PAGADA', label: 'Pagadas' },
  { value: 'VENCIDA', label: 'Vencidas' },
  { value: 'ANULADA', label: 'Anuladas' },
]

const pagination = computed(() => ({
  page: invoiceStore.myPage,
  pageSize: invoiceStore.myPageSize,
  total: invoiceStore.myCount,
}))

async function loadInvoices(page = 1) {
  try {
    await invoiceStore.fetchMyInvoices({
      page,
      state: selectedState.value !== 'all' ? selectedState.value : undefined,
    })
  } catch (err) {
    showToast(err.message || 'Error al cargar tus facturas')
  }
}

async function openDetail(invoice) {
  isDetailModalOpen.value = true
  isLoadingDetail.value = true
  try {
    await invoiceStore.fetchMyInvoiceDetail(invoice.id)
  } catch (err) {
    showToast(err.message || 'Error al cargar la factura')
  } finally {
    isLoadingDetail.value = false
  }
}

function closeDetail() {
  isDetailModalOpen.value = false
}

function prevPage() {
  if (invoiceStore.myPage > 1) loadInvoices(invoiceStore.myPage - 1)
}

function nextPage() {
  if (invoiceStore.myNext) loadInvoices(invoiceStore.myPage + 1)
}

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('es-ES')
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('es-ES')
}

function formatPrice(value) {
  if (value == null) return '-'
  return `${Number(value).toFixed(2)} €`
}

watch(selectedState, () => loadInvoices(1))

onMounted(() => {
  if (!authStore.isAuthenticated) return
  loadInvoices()
})

onIonViewWillEnter(() => {
  if (authStore.isAuthenticated) loadInvoices()
})
</script>

<template>
  <MobileHeader title="Facturas" />
  <ion-content :fullscreen="true" class="ion-padding">
    <section class="page-admin">
      <header class="page-header">
        <p class="eyebrow">FACTURACIÓN</p>
        <h1 class="title">Mis facturas</h1>
      </header>

      <div class="filters">
        <PrettyInputSelector v-model="selectedState" :options="stateOptions" placeholder="Selecciona un estado"
          class="invoices-filter-selector" />
      </div>

      <div v-if="invoiceStore.loading" class="server-state">Cargando facturas...</div>
      <div v-else-if="!invoiceStore.myInvoices.length" class="server-state">
        No tienes facturas.
      </div>

      <div v-else class="invoices-list">
        <article v-for="invoice in invoiceStore.myInvoices" :key="invoice.id" class="card invoice-card"
          @click="openDetail(invoice)">
          <div class="invoice-card-main">
            <h3 class="invoice-card-number">{{ invoice.invoice_number }}</h3>
            <p class="invoice-card-concept text-truncate">{{ invoice.concept }}</p>
            <p class="invoice-card-date">Emitida: {{ formatDate(invoice.issue_date) }}</p>
            <p class="invoice-card-date">Vencimiento: {{ formatDate(invoice.due_date) }}</p>
          </div>
          <div class="invoice-card-aside">
            <span class="invoice-badge" :class="`invoice-badge--${invoice.state.toLowerCase()}`">
              {{ stateLabels[invoice.state] || invoice.state }}
            </span>
            <span class="invoice-card-total">{{ formatPrice(invoice.total) }}</span>
          </div>
        </article>
      </div>

      <div v-if="invoiceStore.myInvoices.length" class="card pagination-card">
        <DataTablePagination :pagination="pagination" :loading="invoiceStore.loading"
          :items-length="invoiceStore.myInvoices.length" @prev-page="prevPage" @next-page="nextPage" />
      </div>

      <!-- Modal detalle -->
      <AppModal :show="isDetailModalOpen" title="Detalle de factura" @close="closeDetail">
        <div v-if="isLoadingDetail" class="server-state">Cargando...</div>
        <div v-else-if="invoiceStore.currentInvoice" class="invoice-detail">
          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">Número</span>
              <span class="detail-value">{{ invoiceStore.currentInvoice.invoice_number }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Concepto</span>
              <span class="detail-value">{{ invoiceStore.currentInvoice.concept }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Estado</span>
              <span class="detail-value">
                <span class="invoice-badge"
                  :class="`invoice-badge--${invoiceStore.currentInvoice.state.toLowerCase()}`">
                  {{ stateLabels[invoiceStore.currentInvoice.state] || invoiceStore.currentInvoice.state }}
                </span>
              </span>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="detail-title">Datos del emisor</h4>
            <p class="detail-text">{{ invoiceStore.currentInvoice.issuer_name }}</p>
            <p class="detail-text">NIF: {{ invoiceStore.currentInvoice.issuer_nif }}</p>
            <p class="detail-text">{{ invoiceStore.currentInvoice.issuer_address }}</p>
          </div>

          <div class="detail-section">
            <h4 class="detail-title">Datos del receptor</h4>
            <p class="detail-text">{{ invoiceStore.currentInvoice.user_name }}</p>
            <p class="detail-text">NIF: {{ invoiceStore.currentInvoice.user_nif }}</p>
            <p class="detail-text">{{ invoiceStore.currentInvoice.user_address }}</p>
          </div>

          <div class="detail-section">
            <h4 class="detail-title">Conceptos</h4>
            <div v-for="item in invoiceStore.currentInvoice.items" :key="item.id" class="detail-item">
              <div>
                <p class="detail-text">{{ item.description }}</p>
                <p class="detail-subtext">{{ item.quantity }} x {{ formatPrice(item.unit_price) }}</p>
              </div>
              <span class="detail-item-subtotal">{{ formatPrice(item.subtotal) }}</span>
            </div>
          </div>

          <div class="detail-section">
            <div class="detail-row">
              <span class="detail-label">Base imponible</span>
              <span class="detail-value">{{ formatPrice(invoiceStore.currentInvoice.tax_base) }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">IVA ({{ (Number(invoiceStore.currentInvoice.iva_rate) * 100).toFixed(0)
                }}%)</span>
              <span class="detail-value">{{ formatPrice(invoiceStore.currentInvoice.iva_amount) }}</span>
            </div>
            <div class="detail-row detail-row-total">
              <span class="detail-label">Total</span>
              <span class="detail-value detail-value-total">{{ formatPrice(invoiceStore.currentInvoice.total) }}</span>
            </div>
          </div>

          <div class="detail-section">
            <h4 class="detail-title">Pagos registrados</h4>
            <div v-if="!invoiceStore.currentInvoice.payments.length" class="detail-empty">
              No hay pagos registrados.
            </div>
            <div v-for="payment in invoiceStore.currentInvoice.payments" :key="payment.id" class="detail-item">
              <div>
                <p class="detail-text">{{ formatPrice(payment.amount) }}</p>
                <p class="detail-subtext">
                  {{ payment.method_name }} · {{ formatDateTime(payment.payment_date) }}
                </p>
              </div>
              <span class="detail-item-subtotal">{{ payment.registered_by_email }}</span>
            </div>
          </div>

          <div v-if="invoiceStore.currentInvoice.cancelled_reason" class="detail-section detail-cancelled">
            <h4 class="detail-title">Motivo de anulación</h4>
            <p class="detail-text">{{ invoiceStore.currentInvoice.cancelled_reason }}</p>
          </div>
        </div>
      </AppModal>
    </section>
  </ion-content>
</template>

<style scoped>
.invoices-filter-selector {
  min-width: 220px;
}

.invoices-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.invoice-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.invoice-card:hover {
  box-shadow: var(--shadow-floating);
}

.invoice-card-main {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.invoice-card-number {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
  color: var(--primary);
}

.invoice-card-concept {
  margin: 0;
  font-size: 0.9rem;
  color: #374151;
}

.invoice-card-date {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.invoice-card-aside {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
  flex-shrink: 0;
}

.invoice-card-total {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--primary);
}

.invoice-badge {
  padding: 0.25rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.02em;
  color: #fff;
  background: #9ca3af;
}

.invoice-badge--emitida {
  background: #2563eb;
}

.invoice-badge--pagada {
  background: #0f6a52;
}

.invoice-badge--vencida {
  background: #dc2626;
}

.invoice-badge--anulada {
  background: #6b7280;
}

.pagination-card {
  margin-top: var(--space-4);
  padding: var(--space-2) var(--space-3);
}

/* Modal detalle */
.invoice-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--outline-variant);
}

.detail-section:last-child {
  border-bottom: none;
}

.detail-title {
  margin: 0 0 var(--space-2);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--primary);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
}

.detail-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.detail-value {
  font-weight: 600;
  text-align: right;
}

.detail-row-total {
  padding-top: var(--space-2);
  border-top: 1px solid var(--outline-variant);
}

.detail-value-total {
  font-size: 1.1rem;
  color: var(--primary);
}

.detail-text {
  margin: 0;
  font-size: 0.9rem;
  color: #374151;
}

.detail-subtext {
  margin: 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) 0;
}

.detail-item-subtotal {
  font-weight: 600;
}

.detail-empty {
  color: #6b7280;
  font-size: 0.9rem;
}

.detail-cancelled {
  color: var(--error);
}

.server-state {
  text-align: center;
  color: #6b7280;
  padding: var(--space-4);
}

@media (max-width: 600px) {
  .invoice-card {
    flex-direction: column;
    align-items: flex-start;
  }

  .invoice-card-aside {
    flex-direction: row;
    align-items: center;
    width: 100%;
    justify-content: space-between;
  }
}
</style>
