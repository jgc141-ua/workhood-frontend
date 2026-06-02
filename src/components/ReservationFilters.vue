<script setup>
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'

const props = defineProps({
  state: {
    type: String,
    default: 'all',
  },
  time: {
    type: String,
    default: 'all',
  },
})

const emit = defineEmits(['update:state', 'update:time'])

const stateOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'Confirmed', label: 'Confirmadas' },
  //{ value: 'Pending', label: 'Pendientes' },
  { value: 'Cancelled', label: 'Canceladas' },
]

const timeOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'upcoming', label: 'Próximas' },
  { value: 'past', label: 'Pasadas' },
]
</script>

<template>
  <div class="reservation-filters">
    <PrettyInputSelector :model-value="state" label="Estado" :options="stateOptions" placeholder="Selecciona un estado"
      @update:model-value="$emit('update:state', $event)" />
    <PrettyInputSelector :model-value="time" label="Periodo" :options="timeOptions" placeholder="Selecciona un periodo"
      @update:model-value="$emit('update:time', $event)" />
  </div>
</template>

<style scoped>
.reservation-filters {
  display: flex;
  align-items: flex-end;
  gap: var(--space-4);
  flex-wrap: wrap;
}

@media (max-width: 1024px) {
  .reservation-filters {
    width: 100%;
  }
}
</style>
