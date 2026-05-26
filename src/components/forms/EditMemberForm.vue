<script setup>
import { ref, watch, computed, useTemplateRef, nextTick, onMounted } from 'vue'
import { IonButton } from '@ionic/vue'
import PersonalForm from '@/components/forms/PersonalForm.vue'
import AddressForm from '@/components/forms/AddressForm.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'

const props = defineProps({
  memberData: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['submit', 'cancel'])

const step = ref(1)

const isPersonalValid = ref(false)
const isAddressValid = ref(false)
const isBillingAddressValid = ref(true)

const personalFormRef = useTemplateRef('personalForm')
const addressFormRef = useTemplateRef('addressForm')
const billingAddressFormRef = useTemplateRef('billingAddressForm')

// Extrae el prefiso y el número de un teléfono combinado
function parsePhone(phone) {
  if (!phone) return { phoneCode: '+34', phone: '' }
  const match = phone.match(/\+(\d{1,4})\s*(.*)/)
  if (match) {
    return { phoneCode: '+' + match[1], phone: match[2].trim() }
  }
  return { phoneCode: '+34', phone: phone.trim() }
}

const parsedPhone = parsePhone(props.memberData.phone)

const phoneData = ref({
  phoneCode: parsedPhone.phoneCode,
  phone: parsedPhone.phone,
})

const form = ref({
  email: props.memberData.email || '',
  first_name: props.memberData.first_name || '',
  last_name: props.memberData.last_name || '',
  phone: props.memberData.phone || '',
  nif_cif: props.memberData.nif_cif || '',
  address: props.memberData.address
    ? { ...props.memberData.address }
    : { street: '', city: '', state: '', postal_code: '', country: '' },
  billing_same_as_address: props.memberData.billing_same_as_address !== false,
  billing_address: props.memberData.billing_address
    ? { ...props.memberData.billing_address }
    : { street: '', city: '', state: '', postal_code: '', country: '' },
})

const isStepValid = computed(() => {
  if (step.value === 1) return isPersonalValid.value
  if (step.value === 2) {
    return form.value.billing_same_as_address
      ? isAddressValid.value
      : isAddressValid.value && isBillingAddressValid.value
  }
  return false
})

// Avanza al siguiente paso validando el actual
async function next() {
  if (step.value === 1) personalFormRef.value?.verifyValidity()
  if (step.value === 2) {
    addressFormRef.value?.verifyValidity()
    if (!form.value.billing_same_as_address) {
      billingAddressFormRef.value?.verifyValidity()
    }
  }

  await nextTick()

  if (isStepValid.value && step.value < 2) {
    step.value++
  }
}

// Retrocede al paso anterior
async function prev() {
  if (step.value > 1) step.value--
  if (step.value === 2) {
    await nextTick()
    addressFormRef.value?.verifyValidity()
    if (!form.value.billing_same_as_address) {
      billingAddressFormRef.value?.verifyValidity()
    }
  }
}

// Envía el formulario de edición completo
function handleSubmit() {
  if (form.value.billing_same_as_address) {
    form.value.billing_address = form.value.address
  }
  emit('submit', { ...form.value })
}

watch(
  () => form.value.billing_same_as_address,
  (val) => {
    if (val) {
      isBillingAddressValid.value = true
    } else {
      isBillingAddressValid.value = false
    }
  },
)

// Actualiza el teléfono cuando cambia el prefijo o el número
watch(phoneData, () => {
  form.value.phone = phoneData.value.phoneCode + ' ' + phoneData.value.phone.trim()
}, { deep: true })

onMounted(async () => {
  await nextTick()
  personalFormRef.value?.verifyValidity()
})
</script>

<template>
  <div>
    <div class="steps">
      <span :class="{ active: step === 1 }">1</span>
      <span :class="{ active: step === 2 }">2</span>
    </div>

    <form @submit.prevent="handleSubmit">
      <!-- Paso 1: Datos personales -->
      <PersonalForm v-if="step === 1" :form="form" :phoneData="phoneData" @isValid="isPersonalValid = $event"
        ref="personalForm" />

      <!-- Paso 2: Dirección -->
      <div v-else-if="step === 2">
        <AddressForm :form="form.address" title="Dirección principal" @isValid="isAddressValid = $event"
          ref="addressForm" />

        <PrettyCheckbox v-model="form.billing_same_as_address" text="La dirección de facturación es la misma" />

        <transition name="slide-down">
          <div v-if="!form.billing_same_as_address">
            <AddressForm :form="form.billing_address" title="Dirección de facturación"
              @isValid="isBillingAddressValid = $event" ref="billingAddressForm" />
          </div>
        </transition>
      </div>

      <!-- Navegación -->
      <div class="nav-row">
        <ion-button v-if="step !== 1" type="button" class="btn-secondary" @click="prev()">Atrás</ion-button>
        <ion-button v-if="step !== 2" type="button" class="btn-primary" :disabled="!isStepValid"
          @click="next()">Siguiente</ion-button>
        <ion-button v-if="step === 2" type="submit" class="btn-primary" :disabled="!isStepValid">Guardar
          cambios</ion-button>
      </div>
    </form>
  </div>
</template>
