<script setup>
const props = defineProps({
  label: String,
  value: String,
  delta: String,
})
</script>

<template>
  <div class="card">
    <p class="label">{{ props.label }}</p>
    <div class="valueRow">
      <strong class="value">{{ props.value }}</strong>
      <span v-if="props.delta" class="delta">{{ props.delta }}</span>
    </div>
  </div>
</template>

<style scoped>
.label {
  margin: 0 0 12px;
  font-size: 13px;
  color: #4f5968;
}

.valueRow {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.value {
  font-size: 26px;
  line-height: 1;
  color: #003544;
}

.delta {
  font-size: 15px;
  color: #006c4f;
}

@media (max-width: 1180px) {
  .valueRow {
    flex-direction: column;
  }
}

@media (max-width: 600px) {
  .valueRow {
    flex-direction: column;
  }

  .label {
    font-size: 15px;
    margin-bottom: 8px;
  }

  .value {
    font-size: 20px;
  }
}
</style>
