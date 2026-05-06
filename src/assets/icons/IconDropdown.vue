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
  width: 16px;
  height: 16px;
  transition: transform 0.3s ease;
}

.icon.rotate {
  transform: rotate(180deg);
}
</style>
