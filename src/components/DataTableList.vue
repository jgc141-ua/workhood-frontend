<script setup>
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

// Genera una clave única para cada fila
function getItemKey(item, index) {
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
    </div>

    <DataTablePagination v-if="pagination" :pagination="pagination" :loading="loading" :items-length="items.length"
      @prev-page="emit('prev-page')" @next-page="emit('next-page')" />
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

.data-table-list {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid var(--outline-variant);
}

.data-table-list-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-4);
  border-bottom: 1px solid var(--outline-variant);
  min-width: 0;
  width: 100%;
  box-sizing: border-box;
  flex-wrap: nowrap;
  align-items: center;
  overflow-wrap: break-word;
  word-break: break-word;
}

.data-table-list-item:first-child {
  padding-top: var(--space-2);
}

.data-table-list-item:last-child {
  border-bottom: 0;
}

@media (max-width: 600px) {
  .data-table-list-item {
    gap: var(--space-3);
    flex-wrap: wrap;
    align-items: flex-start;
  }

  .data-table-pagination {
    text-align: center;
    align-items: center;
    justify-content: center;
    flex-direction: column;
  }
}
</style>
