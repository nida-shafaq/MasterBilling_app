<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-xl q-mt-sm">
      <div>
        <div class="text-h4 text-weight-bold">Preferences & Appearance</div>
        <div class="text-subtitle1 text-grey-6 q-mt-xs">Customize your workspace experience.</div>
      </div>
    </div>
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-6">
        <div class="bento-card q-pa-lg">
          <div class="text-h6 text-weight-bold q-mb-md">Appearance</div>
          <q-list>
            <q-item tag="label" v-ripple class="q-px-none">
              <q-item-section>
                <q-item-label class="text-weight-bold text-dark">Dark Mode</q-item-label>
                <q-item-label caption class="text-grey-7">Toggle high-contrast dark theme</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="isDark" @update:model-value="toggleTheme" color="lime" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="bento-card q-pa-lg">
          <div class="text-h6 text-weight-bold q-mb-md">Notifications</div>
          <q-list>
            <q-item tag="label" v-ripple class="q-px-none">
              <q-item-section>
                <q-item-label class="text-weight-bold text-dark">Email Alerts</q-item-label>
                <q-item-label caption class="text-grey-7">Receive weekly billing reports</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="emailAlerts" color="primary" />
              </q-item-section>
            </q-item>
            <q-item tag="label" v-ripple class="q-px-none">
              <q-item-section>
                <q-item-label class="text-weight-bold text-dark">System Anomalies</q-item-label>
                <q-item-label caption class="text-grey-7">Get notified on sudden consumption spikes</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-toggle v-model="anomalyAlerts" color="primary" />
              </q-item-section>
            </q-item>
          </q-list>
        </div>
      </div>
    </div>
    
    <!-- Tariff Configuration Row -->
    <div class="row q-col-gutter-lg q-mt-sm">
      <div class="col-12">
        <div class="bento-card q-pa-lg">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-h6 text-weight-bold">Tariff Configuration</div>
            <q-btn unelevated color="primary" label="Save Tariff Rates" class="border-radius-full q-px-md text-weight-bold" @click="saveTariff" />
          </div>
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input outlined v-model.number="tariffForm.gridRate" type="number" label="Grid Rate" dense bg-color="white">
                <template v-slot:append><span class="text-caption text-weight-bold text-grey-7">$/kWh</span></template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-input outlined v-model.number="tariffForm.solarCreditRate" type="number" label="Solar Credit Rate" dense bg-color="white">
                <template v-slot:append><span class="text-caption text-weight-bold text-grey-7">$/kWh</span></template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-input outlined v-model.number="tariffForm.generatorRate" type="number" label="Generator Rate" dense bg-color="white">
                <template v-slot:append><span class="text-caption text-weight-bold text-grey-7">$/kWh</span></template>
              </q-input>
            </div>
            <div class="col-12 col-md-3">
              <q-input outlined v-model.number="tariffForm.fixedMaintenance" type="number" label="Fixed Maintenance Fee" dense bg-color="white">
                <template v-slot:prepend><span class="text-caption text-weight-bold text-grey-7">$</span></template>
              </q-input>
            </div>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useBillingStore } from '../stores/billing'

const $q = useQuasar()
const store = useBillingStore()
const isDark = ref(false)
const emailAlerts = ref(true)
const anomalyAlerts = ref(true)

const tariffForm = ref({
  gridRate: 35,
  solarCreditRate: 25,
  generatorRate: 90,
  fixedMaintenance: 50
})

onMounted(() => {
  isDark.value = $q.dark.isActive
  tariffForm.value = { ...store.rates }
})

const toggleTheme = (val) => {
  $q.dark.set(val)
  localStorage.setItem('theme', val ? 'dark' : 'light')
}

const saveTariff = () => {
  store.updateRates(tariffForm.value)
  $q.notify({
    type: 'positive',
    message: 'Custom Tariff Rates saved successfully!',
    position: 'top',
    icon: 'check_circle'
  })
}
</script>
