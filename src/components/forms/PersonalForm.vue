<script setup>
import { ref, watch } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'
import PhoneInput from '../PhoneInput.vue'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  phoneData: {
    type: Object,
    required: true
  },
})

const emit = defineEmits(['isValid'])

const errors = ref({})
const touched = ref({})

// Valida un campo concreto según su tipo
function validateField(fieldName) {
  const value = props.form[fieldName]
  errors.value[fieldName] = ''

  if ((fieldName === 'first_name' || fieldName === 'last_name') && value) {
    if (value.length < 2) {
      errors.value[fieldName] = 'Debe ser mayor a dos caracteres'
    }
  }

  if (fieldName === 'email' && value) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!emailRegex.test(value)) {
      errors.value[fieldName] = 'Email no válido'
    }
  }

  if (fieldName === 'phone' && value) {
    const phoneRegex = /\+(\d{1,4})\s(\d{9,15})/
    if (!phoneRegex.test(value)) {
      errors.value[fieldName] = 'Teléfono no válido'
    }
  }

  if (fieldName === 'nif_cif' && value) {
    const nifNieRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]|[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
    const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i
    if (!nifNieRegex.test(value) && !cifRegex.test(value)) {
      errors.value[fieldName] = 'NIF/CIF no válido'
    }
  }

  if (!value?.trim()) {
    errors.value[fieldName] = 'Este campo es requerido'
  }
}

// Emite el estado global de validez del formulario
function checkValidity() {
  const hasErrors = Object.values(errors.value).some((err) => err !== '')
  const hasTouched = Object.keys(touched.value).length > 0
  emit('isValid', !hasErrors && hasTouched)
}

// Fuerza la validación de todos los campos
function verifyValidity() {
  handleBlur('email')
  handleBlur('first_name')
  handleBlur('last_name')
  handleBlur('phone')
  handleBlur('nif_cif')
  checkValidity()
}

function handleBlur(fieldName) {
  touched.value[fieldName] = true
  validateField(fieldName)
}

function handleInput(fieldName) {
  if (fieldName == "phone") {
    props.form.phone = props.phoneData.phoneCode + " " + props.phoneData.phone.trim()
  }

  if (errors.value[fieldName]) {
    errors.value[fieldName] = ''
  }
}

watch([errors, touched], checkValidity, { deep: true })

defineExpose({
  verifyValidity
})
</script>

<template>
  <div class="step">
    <FormInput :model-value="props.form.email" label="Email" type="email" placeholder="nombre@email.com"
      :error="touched.email ? errors.email : ''" required @update:model-value="(v) => props.form.email = v"
      @blur="handleBlur('email')" @input="handleInput('email')" />

    <div class="row-fields">
      <FormInput :model-value="props.form.first_name" label="Nombre" placeholder="Juan"
        :error="touched.first_name ? errors.first_name : ''" required
        @update:model-value="(v) => props.form.first_name = v" @blur="handleBlur('first_name')"
        @input="handleInput('first_name')" />

      <FormInput :model-value="props.form.last_name" label="Apellidos" placeholder="Pérez García"
        :error="touched.last_name ? errors.last_name : ''" required
        @update:model-value="(v) => props.form.last_name = v" @blur="handleBlur('last_name')"
        @input="handleInput('last_name')" />
    </div>

    <PhoneInput :phone-data="props.phoneData" :touched="touched" :errors="errors" @field-blur="handleBlur"
      @field-input="handleInput" />

    <FormInput :model-value="props.form.nif_cif" label="NIF/CIF" placeholder="12345678Z"
      :error="touched.nif_cif ? errors.nif_cif : ''" required @update:model-value="(v) => props.form.nif_cif = v"
      @blur="handleBlur('nif_cif')" @input="handleInput('nif_cif')" />
  </div>
</template>
