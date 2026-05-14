<script setup>
import { ref, computed } from 'vue'
import { useClickOutside } from '@/composables/useClickOutside'
import IconDropdown from '@/assets/icons/IconDropdown.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [],
  },
  options: {
    type: Array,
    default: () => [],
  },
  label: {
    type: String,
    default: '',
  },
  placeholder: {
    type: String,
    default: 'Selecciona una o más opciones',
  },
  searchPlaceholder: {
    type: String,
    default: 'Buscar...',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const search = ref('')
const dropdownRef = ref(null)
const triggerId = `multi-selector-${Math.random().toString(36).slice(2, 9)}`

const selectedValues = computed(() => new Set(props.modelValue))

const selectedLabels = computed(() =>
  props.options
    .filter((option) => selectedValues.value.has(option.value))
    .map((option) => option.label)
)

const triggerText = computed(() => {
  if (!selectedLabels.value.length) return props.placeholder
  if (selectedLabels.value.length === 1) return selectedLabels.value[0]
  return `${selectedLabels.value.length} seleccionados`
})

const filteredOptions = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return props.options
  return props.options.filter((option) => option.label.toLowerCase().includes(query))
})

// Abre o cierra el dropdown
function toggle() {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) search.value = ''
}

// Añade o quita una opción de la selección
function toggleOption(option) {
  const current = new Set(props.modelValue)
  if (current.has(option.value)) {
    current.delete(option.value)
  } else {
    current.add(option.value)
  }
  emit('update:modelValue', Array.from(current))
}

function close() {
  isOpen.value = false
}

useClickOutside(dropdownRef, close)
</script>

<template>
  <div ref="dropdownRef" class="field pretty-multi-selector" :class="{ open: isOpen, disabled }">
    <label v-if="label" :for="triggerId">{{ label }}</label>

    <button :id="triggerId" type="button" class="selector-trigger" :disabled="disabled" @click="toggle">
      <span class="selector-value" :class="{ placeholder: !selectedLabels.length }">
        {{ triggerText }}
      </span>
      <IconDropdown :is-open="isOpen" class="selector-arrow" />
    </button>

    <div v-if="isOpen" class="selector-dropdown" @click.stop>
      <input v-model="search" type="text" class="selector-search" :placeholder="searchPlaceholder"
        @keydown.esc="close" />
      <ul class="selector-options">
        <li v-for="option in filteredOptions" :key="option.value" class="selector-option">
          <PrettyCheckbox :model-value="selectedValues.has(option.value)" :text="option.label"
            @update:model-value="toggleOption(option)" />
        </li>
        <li v-if="!filteredOptions.length" class="selector-option selector-option--empty">
          No se encontraron resultados
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.pretty-multi-selector {
  position: relative;
  width: 100%;
}

.selector-trigger {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  font: inherit;
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: 0.2s ease;
}

.selector-trigger:hover:not(:disabled) {
  border-color: var(--secondary);
  background: rgba(0, 108, 79, 0.04);
}

.pretty-multi-selector.open .selector-trigger {
  border-color: var(--secondary);
}

.selector-trigger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.selector-value {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.selector-value.placeholder {
  color: #9ca3af;
}

.selector-arrow {
  flex: 0 0 auto;
}

.selector-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  flex-direction: column;
  max-height: 260px;
  background: var(--surface-container-lowest);
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.selector-search {
  width: 100%;
  padding: 16px;
  border: none;
  border-bottom: 1px solid var(--outline-variant);
  background: transparent;
  color: var(--on-surface);
  font: inherit;
  font-size: 0.9rem;
  outline: none;
}

.selector-search::placeholder {
  color: #9ca3af;
}

.selector-options {
  list-style: none;
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  flex: 1;
}

.selector-option {
  margin: 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: 0.15s ease;
}

.selector-option:hover {
  background: rgba(0, 108, 79, 0.08);
}

.selector-option--empty {
  color: #9ca3af;
  cursor: default;
  font-size: 0.9rem;
}

.selector-option--empty:hover {
  background: transparent;
}
</style>
