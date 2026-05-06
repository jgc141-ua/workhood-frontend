<script setup>
import { computed } from 'vue'

const props = defineProps({
  pagination: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  itemsLength: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['prev-page', 'next-page'])

const paginationInfo = computed(() => {
  const { page, pageSize, total } = props.pagination
  const start = total ? (page - 1) * pageSize + 1 : 0
  const end = Math.min(page * pageSize, total)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return { start, end, total, page, totalPages }
})

const canPrev = computed(() => paginationInfo.value.page > 1)
const canNext = computed(() => paginationInfo.value.page < paginationInfo.value.totalPages)
</script>

<template>
  <div class="data-table-pagination">
    <p class="data-table-pagination-info">
      <template v-if="loading && itemsLength">
        <span class="loading-hint">
          <span class="loading-dot"></span>
          Actualizando...
        </span>
      </template>
      <template v-else>
        Mostrando {{ paginationInfo.start }}-{{ paginationInfo.end }}
        de {{ paginationInfo.total }} resultados
      </template>
    </p>

    <div class="data-table-pagination-controls">
      <button type="button" class="data-table-page-btn" :disabled="!canPrev || loading" @click="emit('prev-page')">
        Anterior
      </button>

      <span class="data-table-pagination-current">
        Página {{ paginationInfo.page }} de {{ paginationInfo.totalPages }}
      </span>

      <button type="button" class="data-table-page-btn" :disabled="!canNext || loading" @click="emit('next-page')">
        Siguiente
      </button>
    </div>
  </div>
</template>

<style scoped>
.data-table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-3);
}

.data-table-pagination-info {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
}

.data-table-pagination-controls {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.data-table-pagination-current {
  color: var(--on-surface);
  font-size: 0.92rem;
  font-weight: 600;
}

.data-table-page-btn {
  min-height: 38px;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  font: inherit;
  font-weight: 600;
  transition: var(--transition-fast);
}

.data-table-page-btn:hover:not(:disabled) {
  background: var(--surface-container-low);
}

.data-table-page-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.loading-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  animation: pulse-dot 1s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% {
    opacity: 0.4;
    transform: scale(0.8);
  }
  50% {
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 600px) {
  .data-table-pagination {
    text-align: center;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}
</style>
