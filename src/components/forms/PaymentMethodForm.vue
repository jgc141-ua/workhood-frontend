<script setup>
import { ref, watch, computed } from 'vue'
import FormInput from '@/components/forms/FormInput.vue'
import FormActions from '@/components/forms/FormActions.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'
import { usePaymentMethodStore } from '@/stores/paymentMethodStore'
import { useDuplicateNameCheck } from '@/composables/useDuplicateNameCheck'

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      name: '',
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

const paymentMethodStore = usePaymentMethodStore()

const form = ref({
  name: '',
  is_active: true,
  member_visible: true,
})

function syncForm(val) {
  form.value = {
    name: val.name ?? '',
    is_active: val.is_active !== false,
    member_visible: val.member_visible !== false,
  }
}

watch(() => props.modelValue, syncForm, { deep: true, immediate: true })

const trimmedName = computed(() => form.value.name?.trim() || '')

const { error: nameError, validate: validateName } = useDuplicateNameCheck(
  computed(() => form.value.name),
  computed(() => paymentMethodStore.allPaymentMethods),
  'Ya existe un método de pago con ese nombre.',
)

const canSubmit = computed(() => {
  return trimmedName.value && trimmedName.value.length <= 50
})

function handleSubmit() {
  const targetName = trimmedName.value

  if (!validateName(targetName, props.initialName)) {
    return
  }

  const payload = {
    name: props.isEdit ? props.initialName : targetName,
    is_active: !!form.value.is_active,
    member_visible: !!form.value.member_visible,
  }

  if (props.isEdit && props.initialName && targetName !== props.initialName) {
    payload.new_name = targetName
  }

  emit('submit', payload)
}
</script>

<template>
  <form class="payment-method-form" @submit.prevent="handleSubmit">
    <FormInput v-model="form.name" label="Nombre" placeholder="Ej: Tarjeta bancaria" required maxlength="50" />
    <p v-if="nameError" class="input-hint error">{{ nameError }}</p>

    <PrettyCheckbox v-model="form.is_active" text="Activo" />
    <PrettyCheckbox v-model="form.member_visible" text="Visible para el miembro" />

    <FormActions :submit-label="isEdit ? 'Guardar cambios' : 'Crear'" :disabled="!canSubmit" @cancel="emit('cancel')" />
  </form>
</template>

<style scoped>
.payment-method-form {
  display: flex;
  flex-direction: column;
}
</style>
