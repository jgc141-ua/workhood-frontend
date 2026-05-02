<script setup>
import { ref, watch, onMounted } from 'vue'
import PhoneInput from '../PhoneInput.vue'

const { form, phoneData } = defineProps({
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

const validateField = (fieldName) => {
  const value = form[fieldName]
  errors.value[fieldName] = ''

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

const checkValidity = () => {
  const hasErrors = Object.values(errors.value).some((err) => err !== '')
  const hasTouched = Object.keys(touched.value).length > 0
  emit('isValid', !hasErrors && hasTouched)
}

const verifyValidity = () => {
  handleBlur('email')
  handleBlur('first_name')
  handleBlur('last_name')
  handleBlur('phone')
  handleBlur('nif_cif')
  checkValidity()
}

const handleBlur = (fieldName) => {
  touched.value[fieldName] = true
  validateField(fieldName)
}

const handleInput = (fieldName) => {
  if (fieldName == "phone") {
    form.phone = phoneData.phoneCode + " " + phoneData.phone.trim()
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
    <div class="field">
      <label for="email">Email</label>
      <div class="input-wrap">
        <input id="email" v-model="form.email" type="email" placeholder="nombre@email.com" required
          @blur="handleBlur('email')" @input="handleInput('email')" />
      </div>
      <div v-if="touched.email && errors.email" class="error-message">
        {{ errors.email }}
      </div>
    </div>

    <div class="row-fields">
      <div class="field">
        <label for="first_name">Nombre</label>
        <div class="input-wrap">
          <input id="first_name" v-model="form.first_name" type="text" placeholder="Juan" required
            @blur="handleBlur('first_name')" @input="handleInput('first_name')" />
        </div>
        <div v-if="touched.first_name && errors.first_name" class="error-message">
          {{ errors.first_name }}
        </div>
      </div>

      <div class="field">
        <label for="last_name">Apellidos</label>
        <div class="input-wrap">
          <input id="last_name" v-model="form.last_name" type="text" placeholder="Pérez García" required
            @blur="handleBlur('last_name')" @input="handleInput('last_name')" />
        </div>
        <div v-if="touched.last_name && errors.last_name" class="error-message">
          {{ errors.last_name }}
        </div>
      </div>
    </div>

    <PhoneInput :phone-data="phoneData" :touched="touched" :errors="errors" @field-blur="handleBlur"
      @field-input="handleInput" />

    <div class="field">
      <label for="nif_cif">NIF/CIF</label>
      <div class="input-wrap">
        <input id="nif_cif" v-model="form.nif_cif" type="text" placeholder="12345678Z" required
          @blur="handleBlur('nif_cif')" @input="handleInput('nif_cif')" />
      </div>
      <div v-if="touched.nif_cif && errors.nif_cif" class="error-message">
        {{ errors.nif_cif }}
      </div>
    </div>
  </div>
</template>