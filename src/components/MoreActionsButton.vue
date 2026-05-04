<script setup>
import { ref } from 'vue'
import IconMoreActions from '@/assets/icons/IconMoreActions.vue'

const props = defineProps({
  options: { // icon, label, action, danger
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['select'])

const open = ref(false)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function handleOption(option) {
  close()
  emit('select', option)
}

function onBlur(e) {
  if (!e.currentTarget.contains(e.relatedTarget)) {
    close()
  }
}
</script>

<template>
  <div class="moreActionsWrap" @blur="onBlur" tabindex="-1">
    <button class="btn-action moreActionsBtn" type="button" @click="toggle" aria-haspopup="true" :aria-expanded="open">
      <IconMoreActions />
    </button>

    <transition name="menu">
      <div v-if="open && props.options.length" class="menu" role="menu">
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
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 160px;
  padding: 6px;
  background: var(--surface-container-lowest);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-floating);
  border: 1px solid var(--outline-variant);
  display: flex;
  flex-direction: column;
  gap: 2px;
  z-index: 100;
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
