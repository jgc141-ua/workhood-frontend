<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormActions from '@/components/forms/FormActions.vue'
import { useResourceTypeStore } from '@/stores/resourceTypeStore'
import { useDuplicateNameCheck } from '@/composables/useDuplicateNameCheck'

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

const resourceTypeStore = useResourceTypeStore()

const form = ref({
  name: '',
  description: '',
})

// Sincroniza el formulario con los datos recibidos
function syncForm(val) {
  form.value = {
    name: val.name ?? '',
    description: val.description ?? '',
  }
}

watch(() => props.modelValue, syncForm, { deep: true, immediate: true })

onMounted(() => {
  if (!resourceTypeStore.allResourceTypes.length) {
    resourceTypeStore.fetchResourceTypes().catch(() => { })
  }
})

const trimmedName = computed(() => form.value.name?.trim() || '')
const trimmedDescription = computed(() => form.value.description?.trim() || '')

const { error: nameError, validate: validateName } = useDuplicateNameCheck(
  computed(() => form.value.name),
  computed(() => resourceTypeStore.allResourceTypes),
  'Ya existe un tipo de recurso con ese nombre.',
)

const canSubmit = computed(() => {
  const nameValid = trimmedName.value && trimmedName.value.length <= 25
  const descriptionValid = trimmedDescription.value.length <= 50
  return nameValid && descriptionValid
})

// Envía el formulario si pasa la validación de nombre duplicado
function handleSubmit() {
  const targetName = trimmedName.value

  if (!validateName(targetName, props.initialName)) {
    return
  }

  const payload = {
    name: props.isEdit ? props.initialName : targetName,
    description: trimmedDescription.value,
  }

  if (props.isEdit && props.initialName && targetName !== props.initialName) {
    payload.new_name = targetName
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="resource-type-form" @submit.prevent="handleSubmit">
    <FormInput v-model="form.name" label="Nombre" placeholder="Ej: Sala de reuniones" required maxlength="25" />
    <p v-if="nameError" class="input-hint error">{{ nameError }}</p>

    <FormInput v-model="form.description" label="Descripción" placeholder="Descripción del tipo de recurso"
      maxlength="50" />

    <FormActions :submit-label="isEdit ? 'Guardar cambios' : 'Crear'" :disabled="!canSubmit" @cancel="emit('cancel')" />
  </form>
</template>

<style scoped>
.resource-type-form {
  display: flex;
  flex-direction: column;
}
</style>
