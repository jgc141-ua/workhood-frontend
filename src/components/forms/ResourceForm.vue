<script setup>
import { ref, watch, computed } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormActions from '@/components/forms/FormActions.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      capacity: '',
      availability: true,
      is_active: true,
      resource_type: '',
    }),
  },
  resourceTypeOptions: {
    type: Array,
    default: () => [],
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
  capacity: '',
  availability: true,
  is_active: true,
  resource_type: '',
})

function syncForm(val) {
  form.value = {
    name: val.name ?? '',
    description: val.description ?? '',
    capacity: val.capacity ?? '',
    availability: val.availability !== false,
    is_active: val.is_active !== false,
    resource_type: val.resource_type ?? '',
  }
}

watch(() => props.modelValue, syncForm, { deep: true, immediate: true })

const trimmedName = computed(() => form.value.name?.trim() || '')
const trimmedDescription = computed(() => form.value.description?.trim() || '')

const canSubmit = computed(() => {
  return (
    trimmedName.value &&
    trimmedName.value.length <= 100 &&
    trimmedDescription.value.length <= 100 &&
    form.value.capacity !== '' &&
    Number(form.value.capacity) > 0 &&
    !!form.value.resource_type
  )
})

function handleSubmit() {
  const payload = {
    name: trimmedName.value,
    description: trimmedDescription.value,
    capacity: Number(form.value.capacity),
    availability: !!form.value.availability,
    is_active: !!form.value.is_active,
    resource_type: Number(form.value.resource_type),
  }

  if (props.isEdit && props.modelValue?.id) {
    payload.id = props.modelValue.id
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="resource-form" @submit.prevent="handleSubmit">
    <FormInput v-model="form.name" label="Nombre" placeholder="Ej: Sala de Juntas A" required maxlength="100" />

    <FormInput v-model="form.description" label="Descripción" placeholder="Descripción del recurso" maxlength="100" />

    <PrettyInputSelector v-model="form.resource_type" label="Tipo de recurso" :options="resourceTypeOptions"
      placeholder="Selecciona un tipo" search-placeholder="Buscar tipo de recurso..." required />

    <FormInput v-model="form.capacity" label="Capacidad" type="number" min="1" placeholder="Ej: 8" required />

    <div class="field checkbox-group">
      <PrettyCheckbox v-model="form.availability" text="Disponible" />
      <PrettyCheckbox v-model="form.is_active" text="Activo" />
    </div>

    <FormActions :submit-label="isEdit ? 'Guardar cambios' : 'Crear'" :disabled="!canSubmit" @cancel="emit('cancel')" />
  </form>
</template>

<style scoped>
.resource-form {
  display: flex;
  flex-direction: column;
}

.checkbox-group {
  display: flex;
  gap: var(--space-3);
  flex-direction: row;
  justify-content: center;
}

.checkbox-group .field {
  margin-bottom: 0;
}
</style>
