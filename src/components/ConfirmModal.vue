<script setup>
import { IonButton } from '@ionic/vue'
import AppModal from './AppModal.vue'

defineProps({
  show: { type: Boolean, default: false },
  title: { type: String, default: 'Confirmar eliminación' },
  message: { type: String, default: '¿Estás seguro?' },
  itemName: { type: String, default: '' },
  hint: { type: String, default: 'Esta acción no se puede deshacer.' },
  confirmLabel: { type: String, default: 'Eliminar' },
  cancelLabel: { type: String, default: 'Cancelar' },
  confirmDanger: { type: Boolean, default: true },
})

defineEmits(['confirm', 'close', 'after-close'])
</script>

<template>
  <AppModal :show="show" :title="title" @close="$emit('close')" @after-close="$emit('after-close')">
    <div class="confirm-modal">
      <p class="confirm-modal-text">
        {{ message }}
        <strong v-if="itemName">{{ itemName }}</strong>?
      </p>
      <p class="confirm-modal-hint">{{ hint }}</p>
    </div>

    <template #footer>
      <ion-button class="btn-secondary" type="button" @click="$emit('close')">
        <span>{{ cancelLabel }}</span>
      </ion-button>
      <ion-button class="btn-primary" :class="{ 'btn-danger': confirmDanger }" type="button" @click="$emit('confirm')">
        <span>{{ confirmLabel }}</span>
      </ion-button>
    </template>
  </AppModal>
</template>

<style scoped>
/* Confirm content */
.confirm-modal {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  text-align: center;
}

.confirm-modal-text {
  margin: 0;
  font-size: 1rem;
  color: var(--on-surface);
  line-height: 1.5;
}

.confirm-modal-hint {
  margin: 0;
  font-size: 1rem;
  color: var(--error);
  font-weight: 700;
}

/* Danger button */
.btn-danger {
  background: var(--error) !important;
}

ion-button.btn-danger {
  --background: var(--error) !important;
  --background-hover: var(--error) !important;
  --color: #fff;
  transition: var(--transition-fast);
}

ion-button.btn-danger:hover {
  opacity: 0.85;
}
</style>
