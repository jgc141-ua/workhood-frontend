<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  label: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  required: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: '',
  },
  hint: {
    type: String,
    default: '',
  },
  step: {
    type: String,
    default: undefined,
  },
  min: {
    type: [String, Number],
    default: undefined,
  },
  max: {
    type: [String, Number],
    default: undefined,
  },
  id: {
    type: String,
    default: undefined,
  },
  maxlength: {
    type: [String, Number],
    default: undefined,
  }
})

const emit = defineEmits(['update:modelValue', 'blur'])

const inputId = props.id || `field-${Math.random().toString(36).slice(2, 9)}`

function handleInput(event) {
  emit('update:modelValue', event.target.value)
}

function handleBlur(event) {
  emit('blur', event)
}
</script>

<template>
  <div class="field">
    <label v-if="label" :for="inputId">{{ label }}</label>
    <div class="input-wrap" :class="{ 'input-wrap--error': !!error }">
      <input :id="inputId" :type="type" :value="modelValue" :maxlength="maxlength" :placeholder="placeholder"
        :required="required" :step="step" :min="min" :max="max" @input="handleInput" @blur="handleBlur" />
    </div>
    <span v-if="hint && !error" class="hint">{{ hint }}</span>
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>
