<script setup>
import { computed } from 'vue'

const props = defineProps({
  columns: {
    type: Array,
    required: true,
  },
  items: {
    type: Array,
    default: () => [],
  },
  keyField: {
    type: String,
    default: null,
  },
  pagination: {
    type: Object,
    default: null,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
  emptyText: {
    type: String,
    default: 'No hay datos para mostrar.',
  },
  variant: {
    type: String,
    default: 'grid',
    validator: (v) => ['grid', 'list'].includes(v),
  },
})

const emit = defineEmits(['prev-page', 'next-page'])

const gridTemplateColumns = computed(() =>
  props.columns.map((c) => c.width || '1fr').join(' ')
)

const getItemKey = (item, index) => {
  if (props.keyField && item[props.keyField] != null) {
    return item[props.keyField]
  }
  return index
}

const paginationInfo = computed(() => {
  if (!props.pagination) return null
  const { page, pageSize, total } = props.pagination
  const start = total ? (page - 1) * pageSize + 1 : 0
  const end = Math.min(page * pageSize, total)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  return { start, end, total, page, totalPages }
})

const canPrev = computed(() => {
  if (!paginationInfo.value) return false
  return paginationInfo.value.page > 1
})

const canNext = computed(() => {
  if (!paginationInfo.value) return false
  return paginationInfo.value.page < paginationInfo.value.totalPages
})
</script>

<template>
  <div v-if="loading && !items.length" class="server-state">
    Cargando...
  </div>

  <div v-else-if="error" class="server-state">
    Error con el servidor
  </div>

  <div v-else-if="!items.length" class="server-state">
    {{ emptyText }}
  </div>

  <div class="card table-card" v-else>
    <div class="table-scroll-area" :class="{ 'table-scroll-overflow': variant === 'grid' }">
      <!-- Grid variant -->
      <template v-if="variant === 'grid'">
        <div class="data-table">
          <div class="data-table-head" :style="{ gridTemplateColumns }">
            <div v-for="col in columns" :key="col.key">{{ col.label }}</div>
          </div>

          <div v-for="(item, index) in items" :key="getItemKey(item, index)" class="data-table-row"
            :style="{ gridTemplateColumns }">
            <div v-for="col in columns" :key="col.key">
              <slot :name="`cell-${col.key}`" :item="item" :index="index">
                {{ item[col.key] }}
              </slot>
            </div>
          </div>
        </div>
      </template>

      <!-- List variant -->
      <template v-if="variant === 'list'">
        <div class="data-table-list">
          <div v-for="(item, index) in items" :key="getItemKey(item, index)" class="data-table-list-item">
            <slot name="row" :item="item" :index="index">
              <div v-for="col in columns" :key="col.key">
                <slot :name="`cell-${col.key}`" :item="item" :index="index">
                  {{ item[col.key] }}
                </slot>
              </div>
            </slot>
          </div>
        </div>
      </template>
    </div>

    <div v-if="paginationInfo" class="data-table-pagination">
      <p class="data-table-pagination-info">
        <template v-if="loading && items.length">
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
  </div>
</template>

<style scoped>
.card {
  padding-bottom: 0;
}

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

.table-card {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  padding: var(--space-3);
  padding-bottom: 0;
  box-sizing: border-box;
}

.table-scroll-area {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.table-scroll-overflow {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  min-width: 600px;
}

.data-table-list {
  width: 100%;
  min-width: 0;
}

.data-table-head,
.data-table-row {
  display: grid;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-3) var(--space-4);
}

.data-table-head {
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #6b7280;
  text-transform: uppercase;
  padding-bottom: var(--space-3);
}

.data-table-row {
  padding: var(--space-4) var(--space-3);
  border-top: 1px solid var(--outline-variant);
  transition: background var(--transition-fast);
}

.data-table-row:hover {
  background: var(--surface-container-low);
}

/* List variant */
.data-table-list {
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--outline-variant);
}

.data-table-list-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4) 0;
  border-top: 1px solid var(--outline-variant);
  min-width: 0;
  overflow-wrap: break-word;
  word-break: break-word;
}

.data-table-list-item:first-child {
  border-top: 0;
  padding-top: 0;
}

.data-table-row:last-child {
  border-bottom: 1px solid var(--outline-variant);
}

@media (max-width: 600px) {
  .data-table-list-item {
    gap: var(--space-3);
  }

  .data-table-pagination {
    text-align: center;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}
</style>
