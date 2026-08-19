<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md q-gutter-x-sm">
      <div class="text-h4 text-weight-bold text-dark">Setup & Configuration</div>
      <div class="bg-lime text-weight-bold text-caption" style="padding: 4px 10px; border-radius: 9999px; color: #020617 !important;">
        <q-icon name="bolt" size="xs" /> SYSTEM CONFIG
      </div>
    </div>
    
    <q-card class="setup-card shadow-3">
      <q-tabs
        v-model="tab"
        dense
        class="text-grey-7"
        indicator-color="transparent"
        align="left"
        content-class="q-gutter-x-sm q-pa-sm"
        style="background: transparent;"
      >
        <q-tab name="buildings" icon="domain" label="BUILDINGS" class="bento-tab" no-caps />
        <q-tab name="offices" icon="meeting_room" label="OFFICES" class="bento-tab" no-caps />
        <q-tab name="meters" icon="speed" label="METERS" class="bento-tab" no-caps />
      </q-tabs>

      <q-separator />

      <q-tab-panels v-model="tab" animated>
        
        <!-- Buildings Panel -->
        <q-tab-panel name="buildings">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="text-h6 q-mb-sm">Add New Building</div>
              <q-form @submit="onAddBuilding" class="q-gutter-md">
                <q-input outlined v-model="buildingForm.name" label="Building Name *" lazy-rules :rules="[val => !!val || 'Field is required']" />
                <q-input outlined v-model="buildingForm.address" label="Address *" lazy-rules :rules="[val => !!val || 'Field is required']" />
                <q-input outlined v-model="buildingForm.pinCode" label="Pin Code *" lazy-rules :rules="[val => !!val || 'Field is required']" />
                <q-btn label="Save Building" type="submit" class="full-width bg-lime text-dark text-weight-bold" unelevated />
              </q-form>
            </div>
            <div class="col-12 col-md-8">
              <q-table
                title="Registered Buildings"
                :rows="store.buildings"
                :columns="buildingColumns"
                row-key="id"
                flat
                bordered
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- Offices Panel -->
        <q-tab-panel name="offices">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-4">
              <div class="text-h6 q-mb-sm">Add New Office</div>
              <q-form @submit="onAddOffice" class="q-gutter-md">
                <q-select outlined v-model="officeForm.buildingId" :options="buildingOptions" label="Select Building *" emit-value map-options lazy-rules :rules="[val => !!val || 'Field is required']" />
                <q-input outlined v-model="officeForm.officeNumber" label="Office Number *" lazy-rules :rules="[val => !!val || 'Field is required']" />
                <q-input outlined v-model="officeForm.tenantName" label="Tenant Name" />
                <q-input outlined v-model="officeForm.contactNo" label="Contact No" />
                <q-btn label="Save Office" type="submit" class="full-width bg-lime text-dark text-weight-bold" unelevated />
              </q-form>
            </div>
            <div class="col-12 col-md-8">
              <q-select outlined v-model="selectedBuildingForOffices" :options="buildingOptions" label="Filter by Building" emit-value map-options class="q-mb-md" @update:model-value="loadOffices" />
              <q-table
                title="Offices"
                :rows="store.offices"
                :columns="officeColumns"
                row-key="id"
                flat
                bordered
              />
            </div>
          </div>
        </q-tab-panel>

        <!-- Meters Panel -->
        <q-tab-panel name="meters">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-5">
              <div class="text-h6 q-mb-sm">Link Meter to Office</div>
              <q-form @submit="onAddMeter" class="q-gutter-md">
                <q-select outlined v-model="selectedBuildingForMeters" :options="buildingOptions" label="Select Building *" emit-value map-options @update:model-value="loadOffices" />
                <q-select outlined v-model="meterForm.officeId" :options="officeOptions" label="Select Office *" emit-value map-options lazy-rules :rules="[val => !!val || 'Field is required']" :disable="!selectedBuildingForMeters" />
                <q-input outlined v-model="meterForm.meterSerialId" label="Meter Serial ID *" lazy-rules :rules="[val => !!val || 'Field is required']" />
                <q-select outlined v-model="meterForm.meterType" :options="['ELECTRICITY', 'WATER', 'GAS']" label="Meter Type" />
                <q-btn label="Link Meter" type="submit" class="full-width bg-lime text-dark text-weight-bold" unelevated />
              </q-form>
            </div>
            <div class="col-12 col-md-7">
              <q-table
                title="Linked Meters"
                :rows="store.meters"
                :columns="meterColumns"
                row-key="id"
                flat
                bordered
                :filter="meterSearch"
              >
                <template v-slot:top-right>
                  <q-input borderless dense debounce="300" v-model="meterSearch" placeholder="Search Meters">
                    <template v-slot:append>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </template>
                <template v-slot:body-cell-meterType="props">
                  <q-td :props="props">
                    <q-badge :color="props.row.meterType === 'ELECTRICITY' ? 'blue' : props.row.meterType === 'GAS' ? 'orange' : 'cyan'">
                      {{ props.row.meterType || 'ELECTRICITY' }}
                    </q-badge>
                  </q-td>
                </template>
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat round color="negative" icon="delete" size="sm" @click="onDeleteMeter(props.row.id)" />
                  </q-td>
                </template>
              </q-table>
            </div>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useBillingStore } from '../stores/billing'
import { useQuasar } from 'quasar'

const store = useBillingStore()
const $q = useQuasar()

const tab = ref('buildings')

const buildingForm = ref({ name: '', address: '', pinCode: '' })
const officeForm = ref({ buildingId: '', officeNumber: '', tenantName: '', contactNo: '' })
const meterForm = ref({ officeId: '', meterSerialId: '', meterType: 'ELECTRICITY' })

const selectedBuildingForOffices = ref('')
const selectedBuildingForMeters = ref('')
const meterSearch = ref('')

const buildingColumns = [
  { name: 'name', label: 'Name', field: 'name', align: 'left' as const },
  { name: 'address', label: 'Address', field: 'address', align: 'left' as const },
  { name: 'pinCode', label: 'Pin Code', field: 'pinCode', align: 'left' as const },
  { name: 'offices', label: 'Offices Count', field: (row: any) => row._count?.offices || 0, align: 'center' as const }
]

const officeColumns = [
  { name: 'officeNumber', label: 'Office No', field: 'officeNumber', align: 'left' as const },
  { name: 'tenantName', label: 'Tenant Name', field: 'tenantName', align: 'left' as const },
  { name: 'contactNo', label: 'Contact', field: 'contactNo', align: 'left' as const },
  { name: 'meters', label: 'Meters', field: (row: any) => row.meters?.length || 0, align: 'center' as const }
]

const meterColumns = [
  { name: 'meterSerialId', label: 'Meter ID', field: 'meterSerialId', align: 'left' as const },
  { name: 'buildingName', label: 'Building', field: (row: any) => row.office?.building?.name || '-', align: 'left' as const },
  { name: 'officeNumber', label: 'Office No', field: (row: any) => row.office?.officeNumber || '-', align: 'left' as const },
  { name: 'meterType', label: 'Type', field: 'meterType', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const }
]

const buildingOptions = computed(() => {
  return store.buildings.map(b => ({ label: b.name, value: b.id }))
})

const officeOptions = computed(() => {
  return store.offices.map(o => ({ label: `${o.officeNumber} (${o.tenantName || 'Vacant'})`, value: o.id }))
})

onMounted(() => {
  store.fetchBuildings()
  store.fetchMeters()
})

async function onAddBuilding() {
  await store.createBuilding(buildingForm.value)
  $q.notify({ type: 'positive', message: 'Building saved successfully' })
  buildingForm.value = { name: '', address: '', pinCode: '' }
}

async function loadOffices(buildingId: string) {
  if (buildingId) {
    await store.fetchOffices(buildingId)
  }
}

async function onAddOffice() {
  const success = await store.createOffice(officeForm.value)
  if (success) {
    $q.notify({ type: 'positive', message: 'Office saved successfully' })
    if (selectedBuildingForOffices.value === officeForm.value.buildingId) {
      loadOffices(officeForm.value.buildingId)
    }
    officeForm.value.officeNumber = ''
    officeForm.value.tenantName = ''
    officeForm.value.contactNo = ''
  } else {
    $q.notify({ type: 'negative', message: 'Failed to save office' })
  }
}

async function onAddMeter() {
  const success = await store.createMeter(meterForm.value)
  if (success) {
    $q.notify({ type: 'positive', message: 'Meter successfully linked to office!', position: 'top-right', timeout: 3000 })
    meterForm.value.meterSerialId = ''
    store.fetchMeters()
  } else {
    $q.notify({ type: 'negative', message: 'Failed to link meter', position: 'top-right' })
  }
}

async function onDeleteMeter(id: string) {
  $q.dialog({
    title: 'Confirm Unlink',
    message: 'Are you sure you want to unlink this meter?',
    cancel: true,
    persistent: true
  }).onOk(async () => {
    const success = await store.deleteMeter(id)
    if (success) {
      $q.notify({ type: 'positive', message: 'Meter unlinked successfully', position: 'top-right' })
      store.fetchMeters()
    } else {
      $q.notify({ type: 'negative', message: 'Failed to unlink meter', position: 'top-right' })
    }
  })
}
</script>

<style scoped>
.setup-card {
  border-radius: 20px;
  background: transparent;
  box-shadow: none !important;
}

.bento-tab {
  background: rgba(255, 255, 255, 0.6);
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 8px 16px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.bento-tab:hover {
  background: white;
  border-color: #CCFF00;
}

.q-tab--active.bento-tab {
  background: #18181B !important;
  color: #CCFF00 !important;
  border-color: #18181B !important;
}

body.body--dark .bento-tab {
  background: #1E293B !important;
  border-color: #334155 !important;
  color: #CBD5E1 !important;
}

body.body--dark .bento-tab:hover {
  background: #334155 !important;
  color: #F8FAFC !important;
}

body.body--dark .q-tab--active.bento-tab {
  background: #0F172A !important;
  border-color: rgba(163, 230, 53, 0.3) !important;
  color: #CCFF00 !important;
}
</style>
