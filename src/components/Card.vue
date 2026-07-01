<script setup>
import { RouterLink } from 'vue-router'
import { computed } from 'vue'

const props = defineProps({
  label: String,
  value: String,
  to: { type: [String, Object], default: null },
})

const tag = computed(() => (props.to ? RouterLink : 'div'))
</script>

<template>
  <component :is="tag" :to="to" class="card" :class="{ clickable: !!to }">
    <p class="label">{{ props.label }}</p>
    <strong class="value">{{ props.value }}</strong>
  </component>
</template>

<style scoped>
.label {
  margin: 0 0 12px;
  font-size: 13px;
  color: #4f5968;
}

.value {
  font-size: 26px;
  line-height: 1;
  color: #003544;
}

.card.clickable {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.card.clickable:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(26, 28, 30, 0.1);
}

@media (max-width: 600px) {
  .label {
    font-size: 15px;
    margin-bottom: 8px;
  }

  .value {
    font-size: 20px;
  }
}
</style>
