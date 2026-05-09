<script setup>
import { ref, watch } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  optional: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['isValid'])

const errors = ref({})
const touched = ref({})

const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

function bothEmpty() {
  return !props.form.password?.trim() && !props.form.password_confirm?.trim()
}

// Valida un campo de contraseña según reglas de fortaleza y coincidencia
function validateField(fieldName) {
  const value = props.form[fieldName]
  errors.value[fieldName] = ''

  // Si es opcional y ambos están vacíos, no validamos nada
  if (props.optional && bothEmpty()) {
    return
  }

  if (!value?.trim()) {
    errors.value[fieldName] = 'Este campo es requerido'
    return
  }

  if (fieldName === 'password') {
    if (value.length < 8) {
      errors.value[fieldName] = 'La contraseña debe tener al menos 8 caracteres'
      return
    }

    if (!passwordRegex.test(value)) {
      errors.value[fieldName] =
        'Debe incluir al menos una mayúscula, un número y un carácter especial'
      return
    }
  }

  if (fieldName === 'password_confirm') {
    if (props.form.password && value !== props.form.password) {
      errors.value[fieldName] = 'Las contraseñas no coinciden'
    }
  }
}

// Emite el estado global de validez del formulario
function checkValidity() {
  // Si es opcional y ambos vacíos → siempre válido
  if (props.optional && bothEmpty()) {
    emit('isValid', true)
    return
  }

  const hasErrors = Object.values(errors.value).some((err) => err !== '')
  emit('isValid', !hasErrors)
}

function handleBlur(fieldName) {
  touched.value[fieldName] = true
  validateField(fieldName)

  if (fieldName === 'password') {
    validateField('password_confirm')
  }

  checkValidity()
}

function handleInput(fieldName) {
  if (errors.value[fieldName]) {
    errors.value[fieldName] = ''
  }

  if (fieldName === 'password' && touched.value.password_confirm) {
    validateField('password_confirm')
  }

  checkValidity()
}

function verifyValidity() {
  validateField('password')
  validateField('password_confirm')
  checkValidity()
}

watch(() => props.form.password, checkValidity)
watch(() => props.form.password_confirm, checkValidity)

defineExpose({ verifyValidity })
</script>

<template>
  <div class="step">
    <FormInput :model-value="props.form.password" label="Contraseña" type="password" placeholder="••••••••"
      :required="!optional" :error="touched.password ? errors.password : ''"
      hint="Mínimo 8 caracteres, incluye al menos una letra mayúscula, un número y un carácter especial"
      @update:model-value="(v) => props.form.password = v" @blur="handleBlur('password')"
      @input="handleInput('password')" />

    <FormInput :model-value="props.form.password_confirm" label="Confirmar contraseña" type="password"
      placeholder="••••••••" :required="!optional" :error="touched.password_confirm ? errors.password_confirm : ''"
      @update:model-value="(v) => props.form.password_confirm = v" @blur="handleBlur('password_confirm')"
      @input="handleInput('password_confirm')" />
  </div>
</template>
