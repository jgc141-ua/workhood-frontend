<script setup>
import { IonButton } from '@ionic/vue'

const props = defineProps({
  submitLabel: {
    type: String,
    default: 'Guardar',
  },
  cancelLabel: {
    type: String,
    default: 'Cancelar',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['cancel'])
</script>

<template>
  <div class="form-actions">
    <ion-button class="btn-secondary" type="button" :disabled="loading" @click="emit('cancel')">
      <span>{{ cancelLabel }}</span>
    </ion-button>
    <ion-button class="btn-primary" type="submit" :disabled="disabled || loading">
      <span>{{ loading ? 'Guardando...' : submitLabel }}</span>
    </ion-button>
  </div>
</template>

<style scoped>
.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}
</style>
