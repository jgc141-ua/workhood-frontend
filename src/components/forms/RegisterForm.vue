<script setup>
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue'
import { IonButton } from '@ionic/vue'
import PersonalForm from '@/components/forms/PersonalForm.vue'
import PasswordForm from '@/components/forms/PasswordForm.vue'
import AddressForm from '@/components/forms/AddressForm.vue'
import PrettyCheckbox from '@/components/PrettyCheckbox.vue'

const emit = defineEmits(['submit'])

const step = ref(1)

const isPersonalValid = ref(false)
const isPasswordValid = ref(false)
const isAddressValid = ref(false)
const isBillingAddressValid = ref(true)

const personalFormRef = useTemplateRef('personalForm')
const addressFormRef = useTemplateRef('addressForm')
const billingAddressFormRef = useTemplateRef('billingAddressForm')

const phoneData = ref({
    phoneCode: '+34',
    phone: '',
})

const form = ref({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    nif_cif: '',
    password: '',
    password_confirm: '',
    address: { street: '', city: '', state: '', postal_code: '', country: '' },
    billing_same_as_address: true,
    billing_address: { street: '', city: '', state: '', postal_code: '', country: '' },
    user_legal: {
        terms: false,
        terms_date: null,
        privacy: false,
        privacy_date: null,
        marketing: false,
        marketing_date: null,
    },
})

const isStepValid = computed(() => {
    if (step.value === 1) return isPersonalValid.value
    if (step.value === 2) return isPasswordValid.value
    if (step.value === 3) {
        return form.value.billing_same_as_address
            ? isAddressValid.value
            : isAddressValid.value && isBillingAddressValid.value
    }
    if (step.value === 4) return form.value.user_legal.terms && form.value.user_legal.privacy
    return false
})

async function next() {
    if (step.value === 1) personalFormRef.value?.verifyValidity()
    if (step.value === 3) {
        addressFormRef.value?.verifyValidity()
        if (!form.value.billing_same_as_address) {
            billingAddressFormRef.value?.verifyValidity()
        }
    }

    await nextTick()

    if (isStepValid.value && step.value < 4) {
        step.value++
    }
}

async function prev() {
    if (step.value > 1) step.value--
    if (step.value === 3) {
        await nextTick()
        addressFormRef.value?.verifyValidity()
        if (!form.value.billing_same_as_address) {
            billingAddressFormRef.value?.verifyValidity()
        }
    }
}

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

watch(
    () => form.value.user_legal.terms,
    (timestamp) => {
        form.value.user_legal.terms_date = timestamp ? new Date().toISOString() : null
    },
)

watch(
    () => form.value.user_legal.privacy,
    (timestamp) => {
        form.value.user_legal.privacy_date = timestamp ? new Date().toISOString() : null
    },
)

watch(
    () => form.value.user_legal.marketing,
    (timestamp) => {
        form.value.user_legal.marketing_date = timestamp ? new Date().toISOString() : null
    },
)
</script>

<template>
    <div>
        <div class="steps">
            <span :class="{ active: step === 1 }">1</span>
            <span :class="{ active: step === 2 }">2</span>
            <span :class="{ active: step === 3 }">3</span>
            <span :class="{ active: step === 4 }">4</span>
        </div>

        <form @submit.prevent="handleSubmit">
            <!-- Paso 1 -->
            <PersonalForm v-if="step === 1" :form="form" :phoneData="phoneData" @isValid="isPersonalValid = $event"
                ref="personalForm" />

            <!-- Paso 2 -->
            <PasswordForm v-else-if="step === 2" :form="form" @isValid="isPasswordValid = $event" />

            <!-- Paso 3 -->
            <div v-else-if="step === 3">
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

            <!-- Paso 4 -->
            <div v-else-if="step === 4">
                <h3 class="section-title">Consentimientos</h3>
                <PrettyCheckbox v-model="form.user_legal.terms" text="Acepto los " linkText="términos y condiciones"
                    linkTo="/terms" />
                <PrettyCheckbox v-model="form.user_legal.privacy" text="He leído y acepto la "
                    linkText="política de privacidad" linkTo="/privacy" />
                <PrettyCheckbox v-model="form.user_legal.marketing" text="Acepto recibir comunicaciones comerciales" />
            </div>

            <!-- Navegación -->
            <div class="nav-row">
                <ion-button v-if="step !== 1" type="button" class="btn-secondary" @click="prev()">Atrás</ion-button>
                <ion-button v-if="step !== 4" type="button" class="btn-primary" :disabled="!isStepValid"
                    @click="next()">Siguiente</ion-button>
                <ion-button v-if="step === 4" type="submit" class="btn-primary"
                    :disabled="!isStepValid">Solicitar</ion-button>
            </div>
        </form>
    </div>
</template>

<style scoped>
.steps {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 10px 0 20px;
}

.steps span {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: #e5e7eb;
    color: #6b7280;
    font-weight: 600;
}

.steps span.active {
    background: var(--primary);
    color: #fff;
}

.nav-row {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 20px;
}

@media (max-width: 600px) {
    .steps {
        gap: 6px;
    }
}
</style>