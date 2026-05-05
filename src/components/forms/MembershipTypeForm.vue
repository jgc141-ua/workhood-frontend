<script setup>
import { ref, watch, computed } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormActions from '@/components/forms/FormActions.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
      description: '',
      monthly_price: '',
      is_fixed: false,
      is_active: true,
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

const form = ref({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    form.value = { ...val }
  },
  { deep: true },
)

const trimmedName = computed(() => form.value.name?.trim() || '')
const trimmedDescription = computed(() => form.value.description?.trim() || '')

const canSubmit = computed(() => {
  return (
    trimmedName.value &&
    trimmedName.value.length <= 50 &&
    trimmedDescription.value.length <= 100 &&
    form.value.monthly_price !== '' &&
    Number(form.value.monthly_price) >= 0
  )
})

function handleSubmit() {
  const payload = {
    name: props.isEdit ? props.initialName : trimmedName.value,
    description: trimmedDescription.value,
    monthly_price: form.value.monthly_price,
    is_fixed: !!form.value.is_fixed,
    is_active: !!form.value.is_active,
  }

  if (props.isEdit && props.initialName) {
    payload.new_name = trimmedName.value
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="membership-type-form" @submit.prevent="handleSubmit">
    <FormInput v-model="form.name" label="Nombre" placeholder="Ej: Flex Desk" required maxlength="50" />

    <FormInput v-model="form.description" label="Descripción" placeholder="Descripción de la membresía" maxlength="100" />

    <FormInput v-model="form.monthly_price" label="Precio mensual" type="number" step="0.01" min="0" placeholder="0.00"
      required />

    <div class="field checkbox-group">
      <PrettyCheckbox v-model="form.is_fixed" text="Escritorio fijo" />
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
