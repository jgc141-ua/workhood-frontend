<script setup>
import { ref, watch } from 'vue'

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

const validateField = (fieldName) => {
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
      return
    }
  }
}

const checkValidity = () => {
  // Si es opcional y ambos vacíos → siempre válido
  if (props.optional && bothEmpty()) {
    emit('isValid', true)
    return
  }

  const hasErrors = Object.values(errors.value).some((err) => err !== '')
  emit('isValid', !hasErrors)
}

const handleBlur = (fieldName) => {
  touched.value[fieldName] = true
  validateField(fieldName)

  if (fieldName === 'password') {
    validateField('password_confirm')
  }

  checkValidity()
}

const handleInput = (fieldName) => {
  if (errors.value[fieldName]) {
    errors.value[fieldName] = ''
  }

  if (fieldName === 'password' && touched.value.password_confirm) {
    validateField('password_confirm')
  }

  checkValidity()
}

const verifyValidity = () => {
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
    <div class="field">
      <label for="password">Contraseña</label>
      <div class="input-wrap" :class="{ 'input-wrap--error': touched.password && errors.password }">
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="••••••••"
          minlength="8"
          :required="!optional"
          @blur="handleBlur('password')"
          @input="handleInput('password')"
        />
      </div>
      <div v-if="touched.password && errors.password" class="error-message">
        {{ errors.password }}
      </div>
      <p v-else class="hint">Mínimo 8 caracteres, incluye al menos una letra mayúscula, un número y un carácter especial</p>
    </div>

    <div class="field">
      <label for="password_confirm">Confirmar contraseña</label>
      <div class="input-wrap" :class="{ 'input-wrap--error': touched.password_confirm && errors.password_confirm }">
        <input
          id="password_confirm"
          v-model="form.password_confirm"
          type="password"
          placeholder="••••••••"
          :required="!optional"
          @blur="handleBlur('password_confirm')"
          @input="handleInput('password_confirm')"
        />
      </div>
      <div v-if="touched.password_confirm && errors.password_confirm" class="error-message">
        {{ errors.password_confirm }}
      </div>
    </div>
  </div>
</template>
