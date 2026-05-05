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
      quantity: '',
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
  quantity: '',
})

const unlimited = ref(false)

function syncForm(val) {
  form.value = {
    name: val.name ?? '',
    description: val.description ?? '',
    quantity: val.quantity ?? '',
  }
  unlimited.value = val.quantity === null || val.quantity === undefined || val.quantity === ''
}

watch(() => props.modelValue, syncForm, { deep: true, immediate: true })

watch(unlimited, (isUnlimited) => {
  if (isUnlimited) {
    form.value.quantity = ''
  }
})

const trimmedName = computed(() => form.value.name?.trim() || '')
const trimmedDescription = computed(() => form.value.description?.trim() || '')

const canSubmit = computed(() => {
  const nameValid = trimmedName.value && trimmedName.value.length <= 50
  const descriptionValid = trimmedDescription.value.length <= 100
  const quantityValid = unlimited.value || (form.value.quantity !== '' && Number(form.value.quantity) > 0)
  return nameValid && descriptionValid && quantityValid
})

function handleSubmit() {
  const payload = {
    name: props.isEdit ? props.initialName : trimmedName.value,
    description: trimmedDescription.value,
    quantity: unlimited.value ? null : Number(form.value.quantity),
  }

  if (props.isEdit && props.initialName && trimmedName.value !== props.initialName) {
    payload.new_name = trimmedName.value
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="benefit-form" @submit.prevent="handleSubmit">
    <FormInput v-model="form.name" label="Nombre" placeholder="Ej: WiFi Alta Velocidad" required maxlength="50" />

    <FormInput v-model="form.description" label="Descripción" placeholder="Descripción del beneficio" maxlength="100" />

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

.checkbox-group {
  display: flex;
  gap: var(--space-3);
  flex-direction: row;
  justify-content: center;
}

.checkbox-group .field {
  margin-bottom: 0;
}

.quantity-row {
  align-items: flex-end;
}

.quantity-row .checkbox-group {
  margin-bottom: var(--space-3);
  flex: 0 0 auto;
}
</style>
