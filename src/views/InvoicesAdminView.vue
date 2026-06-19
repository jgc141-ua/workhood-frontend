<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { IonContent } from '@ionic/vue'
import MobileHeader from '@/components/MobileHeader.vue'
import AppModal from '@/components/AppModal.vue'
import DataTableColumns from '@/components/DataTableColumns.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { useAuthStore } from '@/stores/authStore'
import { showToast } from '@/composables/toast'

const invoiceStore = useInvoiceStore()
const authStore = useAuthStore()

const selectedState = ref('all')
const selectedEmail = ref('')
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

const invoiceColumns = [
  { key: 'invoice_number', label: 'NÚMERO', width: '1fr' },
  { key: 'concept', label: 'CONCEPTO', width: '1.5fr' },
  { key: 'user_email', label: 'MIEMBRO', width: '1fr' },
  { key: 'issue_date', label: 'EMISIÓN', width: '0.75fr' },
  { key: 'due_date', label: 'VENCIM.', width: '0.75fr' },
  { key: 'state', label: 'ESTADO', width: '0.75fr' },
  { key: 'total', label: 'TOTAL', width: '0.5fr' },
]

const pagination = computed(() => ({
  page: invoiceStore.allPage,
  pageSize: invoiceStore.allPageSize,
  total: invoiceStore.allCount,
}))

async function loadInvoices(page = 1) {
  try {
    await invoiceStore.fetchAllInvoices({
      page,
      state: selectedState.value !== 'all' ? selectedState.value : undefined,
      email: selectedEmail.value || undefined,
    })
  } catch (err) {
    showToast(err.message || 'Error al cargar las facturas')
  }
}

async function openDetail(invoice) {
  isDetailModalOpen.value = true
  isLoadingDetail.value = true
  try {
    await invoiceStore.fetchAdminInvoiceDetail(invoice.id)
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
  if (invoiceStore.allPage > 1) loadInvoices(invoiceStore.allPage - 1)
}

function nextPage() {
  if (invoiceStore.allNext) loadInvoices(invoiceStore.allPage + 1)
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

let emailSearchTimeout = null
watch(selectedEmail, () => {
  clearTimeout(emailSearchTimeout)
  emailSearchTimeout = setTimeout(() => {
    loadInvoices(1)
  }, 500)
})

onMounted(() => {
  if (!authStore.isAuthenticated) return
  loadInvoices()
})
</script>

<template>
  <MobileHeader title="Facturas" />
  <ion-content :fullscreen="true" class="ion-padding">
    <section class="page-admin">
      <header class="page-header">
        <p class="eyebrow">FACTURACIÓN</p>
        <h1 class="title">Todas las facturas</h1>
      </header>

      <div class="filters">
        <PrettyInputSelector v-model="selectedState" :options="stateOptions" placeholder="Selecciona un estado"
          class="invoices-filter-selector" />
        <input v-model="selectedEmail" type="text" class="invoices-filter-email" placeholder="Filtrar por email" />
      </div>
    </section>

    <DataTableColumns :columns="invoiceColumns" :items="invoiceStore.allInvoices" key-field="id"
      :loading="invoiceStore.loading" :error="!!invoiceStore.error" :pagination="pagination" @prev-page="prevPage"
      @next-page="nextPage">

      <template #cell-invoice_number="{ item }">
        <button type="button" class="invoice-link" @click="openDetail(item)">
          {{ item.invoice_number }}
        </button>
      </template>

      <template #cell-concept="{ item }">
        <div class="data-table-text text-truncate" :title="item.concept">{{ item.concept }}</div>
      </template>

      <template #cell-issue_date="{ item }">
        <div class="data-table-text">{{ formatDate(item.issue_date) }}</div>
      </template>

      <template #cell-due_date="{ item }">
        <div class="data-table-text">{{ formatDate(item.due_date) }}</div>
      </template>

      <template #cell-state="{ item }">
        <span class="invoice-badge" :class="`invoice-badge--${item.state.toLowerCase()}`">
          {{ stateLabels[item.state] || item.state }}
        </span>
      </template>

      <template #cell-total="{ item }">
        <div class="data-table-text data-table-text--primary">{{ formatPrice(item.total) }}</div>
      </template>
    </DataTableColumns>

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
            <span class="detail-label">Miembro</span>
            <span class="detail-value">{{ invoiceStore.currentInvoice.user_email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado</span>
            <span class="detail-value">
              <span class="invoice-badge" :class="`invoice-badge--${invoiceStore.currentInvoice.state.toLowerCase()}`">
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
  </ion-content>
</template>

<style scoped>
.invoices-filter-selector {
  min-width: 220px;
}

.invoices-filter-email {
  min-width: 260px;
  padding: 14px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  font: inherit;
  font-size: 0.95rem;
  height: 50px;
  box-sizing: border-box;
  align-self: flex-start;
}

.invoices-filter-email:focus {
  outline: none;
  border-color: var(--secondary);
}

.invoice-link {
  background: transparent;
  border: none;
  color: var(--primary);
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.invoice-link:hover {
  opacity: 0.8;
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
</style>
