<script setup>
import { computed } from 'vue'
import DataTablePagination from './DataTablePagination.vue'

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
    <div class="table-scroll-area">
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
    </div>

    <DataTablePagination v-if="pagination" :pagination="pagination" :loading="loading"
      :items-length="items.length" @prev-page="emit('prev-page')" @next-page="emit('next-page')" />
  </div>
</template>

<style scoped>
.card {
  padding-bottom: 0;
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

.data-table {
  width: 100%;
  min-width: 600px;
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

.data-table-row:last-child {
  border-bottom: 1px solid var(--outline-variant);
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
