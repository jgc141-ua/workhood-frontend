<script setup>
const props = defineProps({
  startTime: {
    type: String,
    default: '',
  },
  endTime: {
    type: String,
    default: '',
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['sm', 'md'].includes(value),
  },
})

function parseDatetime(value) {
  if (!value) return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) return null
  const [, year, month, day, hour, minute] = match
  return { year, month, day, hour, minute }
}

function formatDateOnly(value) {
  const parsed = parseDatetime(value)
  if (!parsed) return '-'
  return `${parsed.day}/${parsed.month}/${parsed.year}`
}

function formatTimeOnly(value) {
  const parsed = parseDatetime(value)
  if (!parsed) return '-'
  return `${parsed.hour}:${parsed.minute}`
}
</script>

<template>
  <div class="reservation-date-range" :class="`size-${size}`">
    <div class="reservation-date">
      <span class="reservation-date-label">Inicio</span>
      <span class="reservation-date-time">{{ formatTimeOnly(startTime) }}</span>
      <span class="reservation-date-date">{{ formatDateOnly(startTime) }}</span>
    </div>

    <span class="reservation-date-separator">→</span>

    <div class="reservation-date">
      <span class="reservation-date-label">Fin</span>
      <span class="reservation-date-time">{{ formatTimeOnly(endTime) }}</span>
      <span class="reservation-date-date">{{ formatDateOnly(endTime) }}</span>
    </div>
  </div>
</template>

<style scoped>
.reservation-date-range {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.reservation-date {
  display: flex;
  flex-direction: column;
  min-width: 60px;
}

.reservation-date-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #9ca3af;
}

.reservation-date-time {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--on-surface);
}

.reservation-date-date {
  font-size: 0.75rem;
  color: #6b7280;
}

.reservation-date-separator {
  font-weight: 700;
  color: var(--primary);
}

/* Variante grande (tarjetas de miembro) */
.size-md .reservation-date {
  min-width: 70px;
  align-items: center;
  text-align: center;
}

.size-md .reservation-date-time {
  font-size: 1.2rem;
  line-height: 1.2;
}

.size-md .reservation-date-separator {
  font-size: 1rem;
}
</style>
