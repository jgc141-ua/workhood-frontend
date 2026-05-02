<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
})
</script>

<template>
  <svg class="icon" :class="{ rotate: isOpen }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
    stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
</template>

<style scoped>
.icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  color: #6b7280;
  transition: transform 0.25s ease;
}

.icon.rotate {
  transform: rotate(180deg);
}
</style>
