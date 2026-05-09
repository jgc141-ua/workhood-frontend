<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormActions from '@/components/forms/FormActions.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'
import PrettyMultiSelector from '@/components/PrettyMultiSelector.vue'
import { useBenefitStore } from '@/stores/benefitStore'
import { useMembershipTypeStore } from '@/stores/membershipTypeStore'
import { useDuplicateNameCheck } from '@/composables/useDuplicateNameCheck'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      monthly_price: '',
      is_fixed: false,
      is_active: true,
      benefits: [],
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

const benefitStore = useBenefitStore()
const membershipTypeStore = useMembershipTypeStore()

const benefitOptions = computed(() =>
  benefitStore.allBenefits.map((b) => ({ value: b.id, label: b.name })),
)

// Normaliza los beneficios para trabajar solo con identificadores
function normalizeBenefits(val) {
  if (!Array.isArray(val)) return []
  return val.map((b) => (typeof b === 'object' ? b.id : b))
}

const form = ref({
  ...props.modelValue,
  benefits: normalizeBenefits(props.modelValue.benefits),
})

watch(
  () => props.modelValue,
  (val) => {
    form.value = { ...val, benefits: normalizeBenefits(val?.benefits) }
  },
  { deep: true },
)

onMounted(() => {
  if (!benefitStore.allBenefits.length) {
    benefitStore.fetchBenefits().catch(() => { })
  }
})

const trimmedName = computed(() => form.value.name?.trim() || '')
const trimmedDescription = computed(() => form.value.description?.trim() || '')

const { error: nameError, validate: validateName } = useDuplicateNameCheck(
  computed(() => form.value.name),
  computed(() => membershipTypeStore.allMembershipTypes),
  'Ya existe un tipo de membresía con ese nombre.',
)

const canSubmit = computed(() => {
  const price = Number(String(form.value.monthly_price).replace(',', '.'))
  return (
    trimmedName.value &&
    trimmedName.value.length <= 25 &&
    trimmedDescription.value.length <= 50 &&
    form.value.monthly_price !== '' &&
    !Number.isNaN(price) &&
    price >= 0 &&
    price <= 999999.99
  )
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
    monthly_price: String(form.value.monthly_price).replace(',', '.'),
    is_fixed: !!form.value.is_fixed,
    is_active: !!form.value.is_active,
    benefits: form.value.benefits || [],
  }

  if (props.isEdit && props.initialName) {
    payload.new_name = targetName
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="membership-type-form" @submit.prevent="handleSubmit">
    <FormInput v-model="form.name" label="Nombre" placeholder="Ej: Flex Desk" required maxlength="25" />
    <p v-if="nameError" class="input-hint error">{{ nameError }}</p>

    <FormInput v-model="form.description" label="Descripción" placeholder="Descripción de la membresía"
      maxlength="50" />

    <FormInput v-model="form.monthly_price" label="Precio mensual" type="number" step="0.01" min="0" placeholder="0.00"
      required />

    <PrettyMultiSelector v-model="form.benefits" label="Beneficios incluidos" :options="benefitOptions"
      placeholder="Selecciona beneficios" search-placeholder="Buscar beneficio..." />

    <div class="field checkbox-group">
      <PrettyCheckbox v-model="form.is_fixed" text="Recurso fijo" />
      <PrettyCheckbox v-model="form.is_active" text="Activo" />
    </div>

    <FormActions :submit-label="isEdit ? 'Guardar cambios' : 'Crear'" :disabled="!canSubmit" @cancel="emit('cancel')" />
  </form>
</template>

<style scoped>
.membership-type-form {
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
