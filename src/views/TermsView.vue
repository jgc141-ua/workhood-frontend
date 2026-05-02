<script setup>
import { inject } from 'vue'
import { IonPage, IonContent } from '@ionic/vue'

const BRAND = inject('BRAND')
const CONTACT_EMAIL = inject("CONTACT_EMAIL")
const ADDRESS = inject("ADDRESS")

const sections = [
  {
    title: '1. Identificación del responsable',
    paragraphs: [
      `${BRAND} (en adelante, "el Operador") es el responsable del espacio de coworking y de la plataforma de gestión accesible a través de esta aplicación. Dirección: ${ADDRESS}. Contacto: ${CONTACT_EMAIL}.`,
    ],
  },
  {
    title: '2. Objeto y ámbito de aplicación',
    paragraphs: [
      'Los presentes términos y condiciones regulan el acceso y uso de la plataforma de gestión de espacios de coworking, así como los servicios asociados: reserva de puestos y salas, gestión de membresías, facturación y comunicación entre miembros.',
      'El acceso a la plataforma implica la aceptación plena e incondicional de estas condiciones. Quien no las acepte deberá abstenerse de utilizar el servicio.',
    ],
  },
  {
    title: '3. Acceso y registro',
    paragraphs: [
      'El registro en la plataforma está sujeto a la aprobación del Operador. Una vez enviada la solicitud, la cuenta permanecerá en estado pendiente hasta su verificación.',
      'El usuario se compromete a proporcionar datos verídicos, completos y actualizados. El suministro de información falsa podrá derivar en la cancelación inmediata del acceso.',
    ],
  },
  {
    title: '4. Obligaciones del miembro',
    paragraphs: ['El miembro se compromete a:'],
    items: [
      'Respetar las normas de convivencia del espacio y a los demás miembros.',
      'Hacer un uso adecuado de las instalaciones, equipamiento y recursos compartidos.',
      'No ceder sus credenciales de acceso a terceros. La membresía es personal e intransferible.',
      'Abonar las tarifas correspondientes en los plazos establecidos.',
      'Notificar al Operador cualquier incidencia o desperfecto detectado.',
      'Cumplir con la normativa vigente aplicable a su actividad profesional.',
    ],
  },
  {
    title: '5. Uso del espacio y reservas',
    paragraphs: [
      'Las reservas de puestos y salas se realizan exclusivamente a través de la plataforma, quedando sujetas a disponibilidad y al plan de membresía contratado.',
      'Las cancelaciones deben realizarse con un mínimo de 24 horas de antelación. El incumplimiento reiterado podrá derivar en restricciones de uso.',
    ],
  },
  {
    title: '6. Condiciones económicas',
    paragraphs: [
      'Las tarifas aplicables son las vigentes en el momento de la contratación, disponibles en la plataforma. El Operador se reserva el derecho a modificarlas con un preaviso mínimo de 30 días.',
      'Los precios indicados incluyen el IVA correspondiente según la legislación española vigente. La factura se emitirá mensualmente y será accesible desde el panel del miembro.',
    ],
  },
  {
    title: '7. Responsabilidad',
    paragraphs: [
      `${BRAND} no se hace responsable de los daños, pérdidas o robos de bienes personales o equipos del miembro dentro del espacio. Se recomienda contratar un seguro de equipo individual.`,
      'El Operador tampoco asume responsabilidad por la actividad profesional o empresarial que el miembro desarrolle desde las instalaciones.',
    ],
  },
  {
    title: '8. Protección de datos (RGPD)',
    paragraphs: [
      `En cumplimiento del Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD), ${BRAND} trata los datos personales de los miembros con la finalidad de gestionar la relación contractual, el acceso a las instalaciones y la facturación.`,
      'Los datos no serán cedidos a terceros salvo obligación legal. El usuario tiene derecho a acceder, rectificar, suprimir, oponerse y solicitar la portabilidad de sus datos enviando un escrito a: ' +
      CONTACT_EMAIL,
      'Los datos se conservarán durante la vigencia de la relación contractual y el período legalmente exigido para obligaciones fiscales (mínimo 5 años según el art. 30 del Código de Comercio).',
    ],
  },
  {
    title: '9. Terminación del contrato',
    paragraphs: [
      'Cualquiera de las partes podrá resolver la relación con un preaviso mínimo de 15 días naturales. El Operador podrá resolver el contrato de forma inmediata ante incumplimiento grave de estas condiciones.',
      'Tras la baja, el acceso a la plataforma quedará desactivado y los datos personales serán conservados únicamente durante el período legalmente exigido.',
    ],
  },
  {
    title: '10. Legislación aplicable y jurisdicción',
    paragraphs: [
      'Estos términos se rigen por la legislación española. Para la resolución de conflictos, las partes se someten a los Juzgados y Tribunales del domicilio del Operador, salvo que la normativa de consumidores establezca otro fuero imperativo.',
    ],
  },
]
</script>

<template>
  <ion-page>
    <ion-content :fullscreen="true">
      <div class="page page-auth">
        <div class="card-base terms-card">
          <header class="terms-header">
            <p class="eyebrow">DOCUMENTO LEGAL</p>
            <h2 class="heading">Términos y Condiciones</h2>
            <p class="sub">Última actualización: abril de 2026</p>
          </header>

          <div class="terms-body">
            <section v-for="section in sections" :key="section.title" class="section">
              <h3>{{ section.title }}</h3>
              <p v-for="(p, i) in section.paragraphs" :key="i">{{ p }}</p>
              <ul v-if="section.items">
                <li v-for="item in section.items" :key="item">{{ item }}</li>
              </ul>
            </section>
          </div>

          <div class="terms-footer">
            <p class="sub">Al registrarte confirmas que has leído y aceptas estos términos.</p>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<style scoped>
.terms-card {
  width: min(780px, 96vw);
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  padding: var(--space-8) var(--space-10);
}

.terms-header {
  text-align: center;
}

.eyebrow {
  font-size: 0.75rem;
  letter-spacing: 0.12em;
  color: #6a7280;
  margin: 0 0 var(--space-2);
}

.heading {
  margin: 0 0 var(--space-2);
  font-family: var(--font-display);
  font-size: 1.75rem;
  color: var(--primary);
}

.sub {
  margin: 0;
  font-size: 0.875rem;
  color: #6a7280;
}

.terms-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.section h3 {
  font-family: var(--font-display);
  font-size: 1rem;
  color: var(--primary);
  margin: 0 0 var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--outline-variant);
}

.section p {
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.7;
  margin: 0 0 var(--space-2);
}

.section ul {
  margin: var(--space-2) 0 0 var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.section li {
  font-size: 0.9rem;
  color: #374151;
  line-height: 1.6;
}

.terms-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding-top: var(--space-4);
  border-top: 1px solid var(--outline-variant);
  text-align: center;
}

@media (max-width: 600px) {
  .terms-card {
    padding: var(--space-6) var(--space-4);
    width: 100%;
  }

  .heading {
    font-size: 1.5rem;
  }

  .section h3 {
    font-size: 0.95rem;
  }
}
</style>
