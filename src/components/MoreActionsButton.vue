<script setup>
import { ref, onUnmounted } from 'vue'
import IconMoreActions from '@/assets/icons/IconMoreActions.vue'
import { useClickOutside } from '@/composables/useClickOutside'

const props = defineProps({
  options: { // icon, label, action, danger
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select'])

const open = ref(false)
const wrapperRef = ref(null)
const menuStyle = ref({})
let scrollListener = null

useClickOutside(wrapperRef, () => {
  if (open.value) open.value = false
})

// Calcula la posición del menú desplegable
function updateMenuStyle() {
  if (!wrapperRef.value) return

  const rect = wrapperRef.value.getBoundingClientRect()
  const estimatedMenuHeight = 44 * props.options.length + 12
  const spaceBelow = window.innerHeight - rect.bottom
  const showAbove = spaceBelow < estimatedMenuHeight && rect.top > estimatedMenuHeight

  menuStyle.value = {
    position: 'fixed',
    right: `${window.innerWidth - rect.right}px`,
    top: showAbove
      ? `${rect.top - 6}px`
      : `${rect.bottom + 6}px`,
    transform: showAbove ? 'translateY(-100%)' : 'none',
    zIndex: 9999,
  }
}

function removeScrollListener() {
  if (scrollListener) {
    window.removeEventListener('scroll', scrollListener, true)
    scrollListener = null
  }
}

// Abre o cierra el menú de acciones
function toggle() {
  if (!open.value) {
    updateMenuStyle()
    scrollListener = () => {
      open.value = false
    }
    window.addEventListener('scroll', scrollListener, true)
  } else {
    removeScrollListener()
  }
  open.value = !open.value
}

function close() {
  open.value = false
  removeScrollListener()
}

onUnmounted(() => {
  removeScrollListener()
})

function handleOption(option) {
  close()
  emit('select', option)
}
</script>

<template>
  <div ref="wrapperRef" class="moreActionsWrap" tabindex="-1">
    <button class="btn-action moreActionsBtn" type="button" @click.stop="toggle" aria-haspopup="true"
      :aria-expanded="open">
      <IconMoreActions />
    </button>

    <transition name="menu">
      <div v-if="open && props.options.length" class="menu" role="menu" :style="menuStyle">
        <button v-for="(option, index) in props.options" :key="index" class="menuItem"
          :class="{ 'menuItem-danger': option.danger }" role="menuitem" type="button" @click="handleOption(option)">
          <component v-if="option.icon" :is="option.icon" class="menuItemIcon" />
          <span>{{ option.label }}</span>
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.moreActionsWrap {
  position: relative;
  display: inline-block;
  outline: none;
}

.moreActionsBtn {
  cursor: pointer;
}

.menu {
  min-width: 160px;
  padding: 6px;
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-floating);
  border: 1px solid var(--outline-variant);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.menuItem {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--on-surface);
  font-size: 0.85rem;
  font-weight: 500;
  text-align: left;
  border: none;
  cursor: pointer;
  transition: var(--transition-fast);
}

.menuItem:hover {
  background: var(--surface-container-low);
}

.menuItem-danger {
  color: var(--error);
}

.menuItem-danger:hover {
  background: rgba(220, 38, 38, 0.08);
}

.menuItemIcon {
  width: 16px;
  height: 16px;
  flex-shrink: 1;
}

.menu-enter-active,
.menu-leave-active {
  transition: opacity 120ms var(--ease-standard), transform 120ms var(--ease-standard);
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
