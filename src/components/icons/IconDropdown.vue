<script setup>
const props = defineProps({
  isOpen: { type: Boolean, default: false },
})
</script>

<template>
  <svg class="icon" viewBox="0 0 24 24" :class="{ rotate: isOpen }">
    <path d="M7 10l5 5 5-5z" fill="currentColor" />
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
