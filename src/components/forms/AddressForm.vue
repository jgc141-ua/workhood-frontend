<script setup>
import { ref, watchEffect } from 'vue'

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

  if (fieldName === 'postal_code') {
    if (!postalCodeRegex.test(value)) {
      errors.value[fieldName] = 'Código postal no válido'
      return
    }
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

watchEffect(props.form, checkValidity(), { deep: true })

defineExpose({ verifyValidity })
</script>

<template>
  <div class="address-form">
    <h3 v-if="title" class="section-title">{{ title }}</h3>

    <div class="field">
      <label for="street">Calle</label>
      <div class="input-wrap" :class="{ 'input-wrap--error': touched.street && errors.street }">
        <input id="street" type="text" v-model="form.street" placeholder="Calle Mayor, 123" required
          @blur="handleBlur('street')" @input="handleInput('street')" />
      </div>
      <span class="hint">Incluye número, piso y puerta</span>
      <div v-if="touched.street && errors.street" class="error-message">
        {{ errors.street }}
      </div>
    </div>

    <div class="row-fields">
      <div class="field">
        <label for="city">Ciudad</label>
        <div class="input-wrap" :class="{ 'input-wrap--error': touched.city && errors.city }">
          <input id="city" v-model="form.city" type="text" placeholder="Madrid" required @blur="handleBlur('city')"
            @input="handleInput('city')" />
        </div>
        <div v-if="touched.city && errors.city" class="error-message">
          {{ errors.city }}
        </div>
      </div>

      <div class="field">
        <label for="state">Provincia</label>
        <div class="input-wrap" :class="{ 'input-wrap--error': touched.state && errors.state }">
          <input id="state" v-model="form.state" type="text" placeholder="Madrid" required @blur="handleBlur('state')"
            @input="handleInput('state')" />
        </div>
        <div v-if="touched.state && errors.state" class="error-message">
          {{ errors.state }}
        </div>
      </div>
    </div>

    <div class="row-fields">
      <div class="field">
        <label for="postal_code">Código postal</label>
        <div class="input-wrap" :class="{ 'input-wrap--error': touched.postal_code && errors.postal_code }">
          <input id="postal_code" v-model="form.postal_code" type="text" maxlength="5" placeholder="28001" required
            @blur="handleBlur('postal_code')" @input="handleInput('postal_code')" />
        </div>
        <div v-if="touched.postal_code && errors.postal_code" class="error-message">
          {{ errors.postal_code }}
        </div>
      </div>

      <div class="field">
        <label for="country">País</label>
        <div class="input-wrap" :class="{ 'input-wrap--error': touched.country && errors.country }">
          <input id="country" v-model="form.country" type="text" placeholder="España" required
            @blur="handleBlur('country')" @input="handleInput('country')" />
        </div>
        <div v-if="touched.country && errors.country" class="error-message">
          {{ errors.country }}
        </div>
      </div>
    </div>
  </div>
</template>