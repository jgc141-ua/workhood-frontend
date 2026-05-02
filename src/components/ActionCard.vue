<script setup>
const props = defineProps({
  icon: String,
  title: String,
  meta: String,
  detail: String,
  buttons: {
    type: Array,
    default: () => [],
  },
  primaryButton: {
    type: String,
    default: '',
  },
})
</script>

<template>
  <div class="card actionCard">
    <div class="header">
      <div class="icon">{{ props.icon }}</div>
      <div>
        <h4>{{ props.title }}</h4>
        <p>{{ props.meta }}</p>
        <p>{{ props.detail }}</p>
      </div>
    </div>
    <div v-if="props.buttons.length > 0" class="buttons">
      <button
        v-for="button in props.buttons"
        :key="button"
        class="button"
        :class="{ 'button primary': button === props.primaryButton }"
        type="button"
      >
        {{ button }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.actionCard {
  min-height: unset;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.actionCard + .actionCard {
  margin-top: 12px;
}

.icon {
  width: 34px;
  height: 34px;
  border-radius: 12px;
  background: #e6d6c9;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

h4 {
  margin: 0 0 4px;
  font-size: 14px;
  color: #1a1c1e;
}

p {
  margin: 0;
  font-size: 12px;
  color: #667085;
}

.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.button {
  height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  background: #e8e8ea;
  color: #425466;
  font-size: 13px;
}

.primary {
  background: #006c4f;
  color: #fff;
}
</style>
