<script setup>
import { ref, watch } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  title: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['isValid'])

const errors = ref({})
const touched = ref({})

const postalCodeRegex = /^[0-9]{5}$/

const validateField = (fieldName) => {
  const value = props.form[fieldName]
  errors.value[fieldName] = ''

  if (!value?.trim()) {
    errors.value[fieldName] = 'Este campo es requerido'
    return
  }

  if (fieldName === 'postal_code' && !postalCodeRegex.test(value)) {
    errors.value[fieldName] = 'Código postal no válido'
  }
}

const checkValidity = () => {
  const hasErrors = Object.values(errors.value).some((err) => err !== '')
  const hasTouched = Object.keys(touched.value).length >= 0

  emit('isValid', !hasErrors && hasTouched)
}

const verifyValidity = () => {
  const fields = ['street', 'city', 'state', 'postal_code', 'country']

  fields.forEach(field => {
    touched.value[field] = true
    validateField(field)
  })

  checkValidity()
}

const handleBlur = (fieldName) => {
  touched.value[fieldName] = true
  validateField(fieldName)
  checkValidity()
}

const handleInput = (fieldName) => {
  if (errors.value[fieldName]) {
    errors.value[fieldName] = ''
  }

  if (fieldName === 'postal_code') {
    validateField(fieldName)
  }

  checkValidity()
}

watch(() => props.form, checkValidity, { deep: true })

defineExpose({ verifyValidity })
</script>

<template>
  <div class="address-form">
    <h3 v-if="title" class="section-title">{{ title }}</h3>

    <FormInput
      :model-value="props.form.street"
      label="Calle"
      placeholder="Calle Mayor, 123"
      hint="Incluye número, piso y puerta"
      :error="touched.street ? errors.street : ''"
      required
      @update:model-value="(v) => props.form.street = v"
      @blur="handleBlur('street')"
      @input="handleInput('street')"
    />

    <div class="row-fields">
      <FormInput
        :model-value="props.form.city"
        label="Ciudad"
        placeholder="Madrid"
        :error="touched.city ? errors.city : ''"
        required
        @update:model-value="(v) => props.form.city = v"
        @blur="handleBlur('city')"
        @input="handleInput('city')"
      />

      <FormInput
        :model-value="props.form.state"
        label="Provincia"
        placeholder="Madrid"
        :error="touched.state ? errors.state : ''"
        required
        @update:model-value="(v) => props.form.state = v"
        @blur="handleBlur('state')"
        @input="handleInput('state')"
      />
    </div>

    <div class="row-fields">
      <FormInput
        :model-value="props.form.postal_code"
        label="Código postal"
        placeholder="28001"
        :error="touched.postal_code ? errors.postal_code : ''"
        required
        @update:model-value="(v) => props.form.postal_code = v"
        @blur="handleBlur('postal_code')"
        @input="handleInput('postal_code')"
      />

      <FormInput
        :model-value="props.form.country"
        label="País"
        placeholder="España"
        :error="touched.country ? errors.country : ''"
        required
        @update:model-value="(v) => props.form.country = v"
        @blur="handleBlur('country')"
        @input="handleInput('country')"
      />
    </div>
  </div>
</template>
