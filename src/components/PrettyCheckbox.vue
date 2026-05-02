<script setup>
const checked = defineModel()
const emit = defineEmits(['change'])

const { text, linkText, linkTo, required, disabled } = defineProps({
  text: String,
  linkText: String,
  linkTo: String,
  required: Boolean,
  disabled: Boolean,
})

const hasLink = !!linkText && !!linkTo

function handleChange() {
  const now = new Date()
  emit('change', now.toISOString())
}
</script>

<template>
  <label class="pretty-checkbox" :class="{
    'consent-card': !linkText,
    required: required,
  }">
    <input v-model="checked" type="checkbox" :disabled="disabled" :required="required" @change="handleChange" />
    <span class="checkmark-box"></span>
    <span class="checkbox-text">
      <span v-if="!hasLink">{{ text }}</span>
      <span v-else>
        <span>{{ text }}</span>
        <a class="text-link" :href="linkTo" target="_blank">{{ linkText }}</a>
      </span>
    </span>
  </label>
</template>

<style scoped>
.pretty-checkbox {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid var(--outline-variant);
  border-radius: var(--radius-md);
  background: var(--surface-container-lowest);
  cursor: pointer;
  transition: 0.2s ease;
  text-align: left;
  margin-bottom: 12px;
}

.pretty-checkbox:hover {
  border-color: var(--secondary);
  background: rgba(0, 108, 79, 0.04);
}

.pretty-checkbox input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkmark-box {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  border: 2px solid #cbd5e1;
  background: white;
  flex: 0 0 20px;
  display: grid;
  place-items: center;
  transition: 0.2s ease;
}

.pretty-checkbox input:checked+.checkmark-box {
  background: var(--primary);
  border-color: var(--primary);
}

.pretty-checkbox input:checked+.checkmark-box::after {
  content: '✓';
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1;
}

.checkbox-text {
  font-size: 0.88rem;
  line-height: 1.4;
  color: #374151;
}
</style>
