<script setup>
import AppModal from '@/components/AppModal.vue'
import { useInvoiceStore } from '@/stores/invoiceStore'
import { showToast } from '@/composables/toast'

const props = defineProps({
  show: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  invoice: { type: Object, default: null },
  showMember: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const invoiceStore = useInvoiceStore()

async function handleDownloadPdf() {
  if (!props.invoice) return
  try {
    await invoiceStore.downloadPdf(props.invoice.id, props.showMember)
  } catch (err) {
    showToast(err.message || 'Error al descargar el PDF')
  }
}

const stateLabels = {
  EMITIDA: 'Emitida',
  PAGADA: 'Pagada',
  VENCIDA: 'Vencida',
  ANULADA: 'Anulada',
}

function formatDateTime(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString('es-ES')
}

function formatPrice(value) {
  if (value == null) return '-'
  return `${Number(value).toFixed(2)} €`
}
</script>

<template>
  <AppModal :show="show" title="Detalle de factura" @close="emit('close')">
    <div v-if="loading" class="server-state">Cargando...</div>
    <div v-else-if="invoice" class="invoice-detail">
      <div class="detail-section">
        <button type="button" class="btn btn-secondary pdf-btn" @click="handleDownloadPdf">Descargar PDF</button>
      </div>

      <div class="detail-section">
        <div class="header-row-content">
          <div class="detail-row">
            <span class="detail-label">Número</span>
            <span class="detail-value">{{ invoice.invoice_number }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Concepto</span>
            <span class="detail-value">{{ invoice.concept }}</span>
          </div>
          <div v-if="showMember" class="detail-row">
            <span class="detail-label">Miembro</span>
            <span class="detail-value">{{ invoice.user_email }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Estado</span>
            <span class="detail-value">
              <span class="invoice-badge" :class="`invoice-badge--${invoice.state.toLowerCase()}`">
                {{ stateLabels[invoice.state] || invoice.state }}
              </span>
            </span>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4 class="detail-title">Datos del emisor</h4>
        <p class="detail-text">{{ invoice.issuer_name }}</p>
        <p class="detail-text">NIF/CIF: {{ invoice.issuer_nif }}</p>
        <p class="detail-text">{{ invoice.issuer_address }}</p>
      </div>

      <div class="detail-section">
        <h4 class="detail-title">Datos del receptor</h4>
        <p class="detail-text">{{ invoice.user_name }}</p>
        <p class="detail-text">NIF/CIF: {{ invoice.user_nif }}</p>
        <p class="detail-text">{{ invoice.user_address }}</p>
      </div>

      <div class="detail-section">
        <h4 class="detail-title">Conceptos</h4>
        <div v-for="item in invoice.items" :key="item.id" class="detail-item">
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
          <span class="detail-value">{{ formatPrice(invoice.tax_base) }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">IVA ({{ (Number(invoice.iva_rate) * 100).toFixed(0) }}%)</span>
          <span class="detail-value">{{ formatPrice(invoice.iva_amount) }}</span>
        </div>
        <div class="detail-row detail-row-total">
          <span class="detail-label">Total</span>
          <span class="detail-value detail-value-total">{{ formatPrice(invoice.total) }}</span>
        </div>
      </div>

      <div class="detail-section">
        <h4 class="detail-title">Pagos registrados</h4>
        <div v-if="!invoice.payments.length" class="detail-empty">
          No hay pagos registrados.
        </div>
        <div v-for="payment in invoice.payments" :key="payment.id" class="detail-item">
          <div>
            <p class="detail-text">{{ formatPrice(payment.amount) }}</p>
            <p class="detail-subtext">
              {{ payment.method_name }} · {{ formatDateTime(payment.payment_date) }}
            </p>
          </div>
          <span class="detail-item-subtotal">{{ payment.registered_by_email }}</span>
        </div>
      </div>

      <div v-if="invoice.cancelled_reason" class="detail-section detail-cancelled">
        <h4 class="detail-title">Motivo de anulación</h4>
        <p class="detail-text">{{ invoice.cancelled_reason }}</p>
      </div>
    </div>
  </AppModal>
</template>

<style scoped>
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

.header-row-content {
  flex: 1;
  min-width: 0;
}

.pdf-btn {
  white-space: nowrap;
  flex-shrink: 0;
  padding: 10px;
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
</style>
