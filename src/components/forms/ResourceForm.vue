<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormActions from '@/components/forms/FormActions.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
import { useResourceTypeStore } from '@/stores/resourceTypeStore'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      capacity: '',
      price: '',
      availability: true,
      is_active: true,
      is_bookable: true,
      resource_type: '',
    }),
  },
  isEdit: {
    type: Boolean,
    default: false,
  },
})

const resourceTypeStore = useResourceTypeStore()

const resourceTypeOptions = computed(() =>
  resourceTypeStore.allResourceTypes.map((rt) => ({ value: rt.id, label: rt.name })),
)

const emit = defineEmits(['submit', 'cancel', 'update:modelValue'])

const form = ref({
  name: '',
  description: '',
  capacity: '',
  price: '',
  availability: true,
  is_active: true,
  is_bookable: true,
  resource_type: '',
})

// Sincroniza el formulario con los datos recibidos
function syncForm(val) {
  form.value = {
    name: val.name ?? '',
    description: val.description ?? '',
    capacity: val.capacity ?? '',
    price: val.price ?? '',
    availability: val.availability !== false,
    is_active: val.is_active !== false,
    is_bookable: val.is_bookable !== false,
    resource_type: val.resource_type ?? '',
  }
}

watch(() => props.modelValue, syncForm, { deep: true, immediate: true })

onMounted(() => {
  resourceTypeStore.fetchResourceTypes().catch(() => { })
})

const trimmedName = computed(() => form.value.name?.trim() || '')
const trimmedDescription = computed(() => form.value.description?.trim() || '')

const canSubmit = computed(() => {
  return (
    trimmedName.value &&
    trimmedName.value.length <= 100 &&
    trimmedDescription.value.length <= 100 &&
    form.value.capacity !== '' &&
    Number(form.value.capacity) > 0 &&
    form.value.price !== '' &&
    Number(form.value.price) >= 0 &&
    !!form.value.resource_type
  )
})

// Envía el formulario con los datos del recurso
function handleSubmit() {
  const payload = {
    name: trimmedName.value,
    description: trimmedDescription.value,
    capacity: Number(form.value.capacity),
    price: Number(form.value.price),
    availability: !!form.value.availability,
    is_active: !!form.value.is_active,
    is_bookable: !!form.value.is_bookable,
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

    <FormInput v-model="form.price" label="Precio por hora (€)" type="number" min="0" step="0.01"
      placeholder="Ej: 15.50" required />

    <div class="field checkbox-group">
      <PrettyCheckbox v-model="form.availability" text="Disponible" />
      <PrettyCheckbox v-model="form.is_active" text="Activo" />
      <PrettyCheckbox v-model="form.is_bookable" text="Reservable" />
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
