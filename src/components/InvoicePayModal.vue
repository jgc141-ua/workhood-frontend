<script setup>
import { ref, watch } from 'vue'
import AppModal from '@/components/AppModal.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
import FormActions from '@/components/forms/FormActions.vue'

const props = defineProps({
  show: { type: Boolean, default: false },
  invoice: { type: Object, default: null },
  title: { type: String, default: 'Pagar factura' },
  submitLabel: { type: String, default: 'Pagar' },
  showMember: { type: Boolean, default: false },
  paymentMethodOptions: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['close', 'pay'])

const selectedMethodId = ref('')
const paymentReference = ref('')

watch(() => props.show, (val) => {
  if (val) {
    selectedMethodId.value = ''
    paymentReference.value = ''
  }
})

function formatPrice(value) {
  if (value == null) return '-'
  return `${Number(value).toFixed(2)} €`
}

function handleSubmit() {
  if (!selectedMethodId.value) return
  emit('pay', {
    method: Number(selectedMethodId.value),
    reference: paymentReference.value || undefined,
  })
}
</script>

<template>
  <AppModal :show="show" :title="title" @close="emit('close')">
    <form class="pay-form" @submit.prevent="handleSubmit">
      <p class="pay-hint" v-if="invoice">
        Factura: <strong>{{ invoice.invoice_number }}</strong><br />
        <template v-if="showMember">
          Miembro: <strong>{{ invoice.user_email }}</strong><br />
        </template>
        Total: <strong>{{ formatPrice(invoice.total) }}</strong>
      </p>
      <PrettyInputSelector v-model="selectedMethodId" :options="paymentMethodOptions"
        placeholder="Selecciona un método de pago" class="pay-method-selector" required />
      <p v-if="error" class="error-message">{{ error }}</p>
      <FormActions :submit-label="submitLabel" :disabled="!selectedMethodId || loading"
        :loading="loading" @cancel="emit('close')" />
    </form>
  </AppModal>
</template>

<style scoped>
.pay-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.pay-hint {
  margin: 0;
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.6;
}

.pay-method-selector {
  width: 100%;
}

.error-message {
  color: var(--error);
  font-size: 0.9rem;
  margin: 0;
}
</style>
