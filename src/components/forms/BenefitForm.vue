<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormActions from '@/components/forms/FormActions.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'
import PrettyInputSelector from '@/components/PrettyInputSelector.vue'
import { useResourceTypeStore } from '@/stores/resourceTypeStore'
import { useBenefitStore } from '@/stores/benefitStore'
import { useDuplicateNameCheck } from '@/composables/useDuplicateNameCheck'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      quantity: '',
      resource_type: '',
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

const resourceTypeStore = useResourceTypeStore()
const benefitStore = useBenefitStore()

const resourceTypeOptions = computed(() =>
  resourceTypeStore.allResourceTypes.map((rt) => ({ value: rt.id, label: rt.name })),
)

const emit = defineEmits(['submit', 'cancel', 'update:modelValue'])

const form = ref({
  name: '',
  description: '',
  quantity: '',
  resource_type: '',
})

const unlimited = ref(false)

// Sincroniza el formulario con los datos recibidos
function syncForm(val) {
  form.value = {
    name: val.name ?? '',
    description: val.description ?? '',
    quantity: val.quantity ?? '',
    resource_type: val.resource_type ?? '',
  }
  unlimited.value = val.quantity === null || val.quantity === undefined || val.quantity === ''
}

watch(() => props.modelValue, syncForm, { deep: true, immediate: true })

onMounted(() => {
  if (!resourceTypeStore.allResourceTypes.length) {
    resourceTypeStore.fetchResourceTypes().catch(() => { })
  }
})

// Limpia la cantidad cuando se marca como ilimitado
watch(unlimited, (isUnlimited) => {
  if (isUnlimited) {
    form.value.quantity = ''
  }
})

const trimmedName = computed(() => form.value.name?.trim() || '')
const trimmedDescription = computed(() => form.value.description?.trim() || '')

const { error: nameError, validate: validateName } = useDuplicateNameCheck(
  computed(() => form.value.name),
  computed(() => benefitStore.allBenefits),
  'Ya existe un beneficio con ese nombre.',
)

const canSubmit = computed(() => {
  const nameValid = trimmedName.value && trimmedName.value.length <= 25
  const descriptionValid = trimmedDescription.value.length <= 50
  const quantityValid = unlimited.value || (form.value.quantity !== '' && Number(form.value.quantity) > 0)
  return nameValid && descriptionValid && quantityValid
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
    quantity: unlimited.value ? null : Number(form.value.quantity),
    resource_type: form.value.resource_type ? Number(form.value.resource_type) : null,
  }

  if (props.isEdit && props.initialName && targetName !== props.initialName) {
    payload.new_name = targetName
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="benefit-form" @submit.prevent="handleSubmit">
    <FormInput v-model="form.name" label="Nombre" placeholder="Ej: WiFi Alta Velocidad" required maxlength="25" />
    <p v-if="nameError" class="input-hint error">{{ nameError }}</p>

    <FormInput v-model="form.description" label="Descripción" placeholder="Descripción del beneficio" maxlength="50" />

    <PrettyInputSelector v-model="form.resource_type" label="Tipo de recurso asociado (opcional)"
      :options="resourceTypeOptions" placeholder="Selecciona un tipo de recurso"
      search-placeholder="Buscar tipo de recurso..." />

    <PrettyCheckbox v-model="unlimited" text="Uso ilimitado" />
    <FormInput v-if="!unlimited" v-model="form.quantity" label="Cantidad" type="number" min="1" placeholder="1" />

    <FormActions :submit-label="isEdit ? 'Guardar cambios' : 'Crear'" :disabled="!canSubmit" @cancel="emit('cancel')" />
  </form>
</template>

<style scoped>
.benefit-form {
  display: flex;
  flex-direction: column;
}
</style>
