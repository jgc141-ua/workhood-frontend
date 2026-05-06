<script setup>
import { ref, watch, computed } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormActions from '@/components/forms/FormActions.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
    }),
  },
  initialName: {
    type: String,
    default: '',
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['submit', 'cancel', 'update:modelValue'])

const form = ref({
  name: '',
  description: '',
})

function syncForm(val) {
  form.value = {
    name: val.name ?? '',
    description: val.description ?? '',
  }
}

watch(() => props.modelValue, syncForm, { deep: true, immediate: true })

const trimmedName = computed(() => form.value.name?.trim() || '')
const trimmedDescription = computed(() => form.value.description?.trim() || '')

const canSubmit = computed(() => {
  const nameValid = trimmedName.value && trimmedName.value.length <= 50
  const descriptionValid = trimmedDescription.value.length <= 100
  return nameValid && descriptionValid
})

function handleSubmit() {
  const payload = {
    name: props.isEdit ? props.initialName : trimmedName.value,
    description: trimmedDescription.value,
  }

  if (props.isEdit && props.initialName && trimmedName.value !== props.initialName) {
    payload.new_name = trimmedName.value
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="resource-type-form" @submit.prevent="handleSubmit">
    <FormInput v-model="form.name" label="Nombre" placeholder="Ej: Sala de reuniones" required maxlength="50" />

    <FormInput v-model="form.description" label="Descripción" placeholder="Descripción del tipo de recurso" maxlength="100" />

    <FormActions :submit-label="isEdit ? 'Guardar cambios' : 'Crear'" :disabled="!canSubmit" @cancel="emit('cancel')" />
  </form>
</template>

<style scoped>
.resource-type-form {
  display: flex;
  flex-direction: column;
}
</style>
