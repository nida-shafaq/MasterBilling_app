<template>
  <q-page class="q-pa-lg">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-xl q-mt-sm">
      <div>
        <div class="text-h4 text-weight-bold">Invoices & Collections</div>
        <div class="text-subtitle1 text-grey-6 q-mt-xs">Manage all generated utility bills and track payments.</div>
      </div>
      <q-btn unelevated color="primary" icon="download" label="Export CSV" class="border-radius-full q-px-md" />
    </div>

    <!-- Filter Bar -->
    <div class="bento-card q-pa-md q-mb-lg row q-gutter-md items-center">
      <q-input 
        outlined 
        dense 
        v-model="searchQuery" 
        placeholder="Search by Tenant or Office..."
        class="col-12 col-md-4"
        bg-color="white"
      >
        <template v-slot:prepend><q-icon name="search" /></template>
      </q-input>

      <q-select 
        outlined 
        dense 
        v-model="statusFilter" 
        :options="['All', 'PAID', 'UNPAID']" 
        label="Payment Status" 
        class="col-12 col-md-2"
        bg-color="white"
      />

      <q-space />
      <div class="text-caption text-grey-6 text-weight-bold">{{ filteredInvoices.length }} Invoices Found</div>
    </div>

    <!-- Data Table -->
    <div class="bento-card overflow-hidden">
      <q-table
        :rows="filteredInvoices"
        :columns="columns"
        row-key="id"
        flat
        bordered
        :pagination="{ rowsPerPage: 10 }"
        class="glass-table"
        @row-click="onRowClick"
      >
        <!-- Building & Office Column -->
        <template v-slot:body-cell-location="props">
          <q-td :props="props">
            <div class="text-weight-bold">{{ props.row.reading?.meter?.office?.building?.name || 'N/A' }}</div>
            <div class="text-caption text-grey-7">Office {{ props.row.reading?.meter?.office?.officeNumber || 'N/A' }}</div>
          </q-td>
        </template>

        <!-- Status Badge -->
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge 
              :color="props.row.status === 'PAID' ? 'positive' : 'orange-8'"
              rounded 
              class="q-px-sm q-py-xs text-weight-bold"
            >
              {{ props.row.status }}
            </q-badge>
          </q-td>
        </template>

        <!-- Amount -->
        <template v-slot:body-cell-amount="props">
          <q-td :props="props">
            <span class="text-weight-bold text-dark">${{ formatNumber(props.row.totalAmount) }}</span>
          </q-td>
        </template>

        <!-- Actions -->
        <template v-slot:body-cell-actions="props">
          <q-td :props="props" @click.stop>
            <q-btn flat round color="primary" icon="visibility" size="sm" @click="viewInvoice(props.row)">
              <q-tooltip>View Details</q-tooltip>
            </q-btn>
            <q-btn flat round color="secondary" icon="picture_as_pdf" size="sm">
              <q-tooltip>Download PDF</q-tooltip>
            </q-btn>
            <q-btn flat round color="green" icon="share" size="sm">
              <q-tooltip>Share on WhatsApp</q-tooltip>
            </q-btn>
            <q-btn 
              flat 
              round 
              :color="props.row.status === 'PAID' ? 'orange' : 'positive'" 
              :icon="props.row.status === 'PAID' ? 'remove_done' : 'check_circle'" 
              size="sm" 
              @click="toggleStatus(props.row)"
            >
              <q-tooltip>Mark as {{ props.row.status === 'PAID' ? 'UNPAID' : 'PAID' }}</q-tooltip>
            </q-btn>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Invoice Detail Modal -->
    <q-dialog v-model="invoiceModalOpen" position="right" maximized transition-show="slide-left" transition-hide="slide-right">
      <q-card class="column full-height" style="width: 500px; max-width: 100vw;">
        <q-card-section class="row items-center bg-primary text-white q-pa-md">
          <div class="text-h6">Invoice Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="col q-pa-lg scroll">
          <div v-if="selectedInvoice">
            <!-- Header Info -->
            <div class="row justify-between items-center q-mb-lg">
              <div>
                <div class="text-h4 text-weight-bolder text-primary">${{ formatNumber(selectedInvoice.totalAmount) }}</div>
                <q-badge :color="selectedInvoice.status === 'PAID' ? 'positive' : 'orange-8'" rounded>{{ selectedInvoice.status }}</q-badge>
              </div>
              <div class="text-right">
                <div class="text-caption text-grey-6">Invoice ID</div>
                <div class="text-weight-bold font-mono">{{ selectedInvoice.id.split('-')[0].toUpperCase() }}</div>
                <div class="text-caption text-grey-6 q-mt-sm">Date Issued</div>
                <div class="text-weight-bold">{{ formatDate(selectedInvoice.createdAt) }}</div>
              </div>
            </div>

            <q-separator class="q-my-md" />

            <!-- Customer Details -->
            <div class="q-mb-md">
              <div class="text-caption text-primary text-weight-bold text-uppercase q-mb-xs">Billed To</div>
              <div class="text-h6">{{ selectedInvoice.reading?.meter?.office?.tenantName || 'Unknown Tenant' }}</div>
              <div class="text-body2 text-grey-8">{{ selectedInvoice.reading?.meter?.office?.building?.name }} - Office {{ selectedInvoice.reading?.meter?.office?.officeNumber }}</div>
              <div class="text-body2 text-grey-8">Meter: {{ selectedInvoice.reading?.meter?.meterSerialId }}</div>
            </div>

            <!-- Itemized Breakdown -->
            <div class="bento-card q-pa-md q-mb-lg bg-blue-1 shadow-0 border-primary-alpha">
              <div class="text-subtitle2 text-weight-bold q-mb-md">Reading Details</div>
              
              <!-- Private Sub-Meter Reading Breakdowns -->
              <template v-if="selectedInvoice.reading?.meterType === 'Private Sub-Meter'">
                <div class="row justify-between text-caption q-mb-xs">
                  <span class="text-grey-7">Grid Import:</span>
                  <span class="text-weight-bold">{{ selectedInvoice.reading?.gridImport || 0 }} kWh</span>
                </div>
                <div class="row justify-between text-caption q-mb-xs">
                  <span class="text-grey-7">Solar Export:</span>
                  <span class="text-weight-bold">{{ selectedInvoice.reading?.solarExport || 0 }} kWh</span>
                </div>
                <div class="row justify-between text-caption q-mb-xs">
                  <span class="text-grey-7">Generator:</span>
                  <span class="text-weight-bold">{{ selectedInvoice.reading?.generatorReading || 0 }} kWh</span>
                </div>
                <q-separator class="q-my-sm" />
                <div class="row justify-between text-subtitle2 text-primary">
                  <span>Net Grid Units:</span>
                  <span class="text-weight-bold">{{ Math.max(0, (selectedInvoice.reading?.gridImport || 0) - (selectedInvoice.reading?.solarExport || 0)) }} units</span>
                </div>
              </template>

              <!-- Standard Meter Reading Breakdowns -->
              <template v-else>
                <div class="row justify-between text-caption q-mb-xs">
                  <span class="text-grey-7">Previous Reading:</span>
                  <span class="text-weight-bold">{{ selectedInvoice.reading?.previousReading }} units</span>
                </div>
                <div class="row justify-between text-caption q-mb-xs">
                  <span class="text-grey-7">Current Reading:</span>
                  <span class="text-weight-bold">{{ selectedInvoice.reading?.currentReading }} units</span>
                </div>
                <q-separator class="q-my-sm" />
                <div class="row justify-between text-subtitle2 text-primary">
                  <span>Total Units Consumed:</span>
                  <span class="text-weight-bold">{{ selectedInvoice.reading?.unitsConsumed || (selectedInvoice.reading?.currentReading - selectedInvoice.reading?.previousReading) }} units</span>
                </div>
              </template>
            </div>

            <!-- Financial Breakdown -->
            <div class="bento-card q-pa-md shadow-0 border-grey">
              <div class="text-subtitle2 text-weight-bold q-mb-md">Charges Breakdown</div>
              
              <template v-if="selectedInvoice.reading?.meterType === 'Private Sub-Meter'">
                <div class="row justify-between text-body2 q-mb-sm">
                  <span class="text-grey-8">Grid Consumption (${{ invoiceRates.gridRate }}/unit)</span>
                  <span class="font-mono">${{ formatNumber(Math.max(0, (selectedInvoice.reading?.gridImport || 0) - (selectedInvoice.reading?.solarExport || 0)) * invoiceRates.gridRate) }}</span>
                </div>
                <div class="row justify-between text-body2 q-mb-sm">
                  <span class="text-grey-8">Generator Usage (${{ invoiceRates.generatorRate }}/unit)</span>
                  <span class="font-mono">${{ formatNumber((selectedInvoice.reading?.generatorReading || 0) * invoiceRates.generatorRate) }}</span>
                </div>
                <div class="row justify-between text-body2 q-mb-sm">
                  <span class="text-grey-8">Fixed Maintenance</span>
                  <span class="font-mono">${{ formatNumber(invoiceRates.fixedMaintenance) }}</span>
                </div>
                <div class="row justify-between text-body2 q-mb-sm">
                  <span class="text-grey-8">Taxes ({{ invoiceRates.taxPercentage }}%)</span>
                  <span class="font-mono">${{ formatNumber(((Math.max(0, (selectedInvoice.reading?.gridImport || 0) - (selectedInvoice.reading?.solarExport || 0)) * invoiceRates.gridRate) + ((selectedInvoice.reading?.generatorReading || 0) * invoiceRates.generatorRate) + invoiceRates.fixedMaintenance) * (invoiceRates.taxPercentage / 100)) }}</span>
                </div>
                <q-separator class="q-my-md" />
                <div class="row justify-between text-h6 text-weight-bold">
                  <span>Total Payable</span>
                  <span>${{ formatNumber(((Math.max(0, (selectedInvoice.reading?.gridImport || 0) - (selectedInvoice.reading?.solarExport || 0)) * invoiceRates.gridRate) + ((selectedInvoice.reading?.generatorReading || 0) * invoiceRates.generatorRate) + invoiceRates.fixedMaintenance) * (1 + (invoiceRates.taxPercentage / 100))) }}</span>
                </div>
              </template>
              
              <template v-else>
                <div class="row justify-between text-body2 q-mb-sm">
                  <span class="text-grey-8">Base Tariff Charges</span>
                  <span class="font-mono">${{ formatNumber(selectedInvoice.totalAmount - (selectedInvoice.totalAmount * (invoiceRates.taxPercentage / 100)) - invoiceRates.fixedMaintenance) }}</span>
                </div>
                <div class="row justify-between text-body2 q-mb-sm">
                  <span class="text-grey-8">Fixed Maintenance</span>
                  <span class="font-mono">${{ formatNumber(invoiceRates.fixedMaintenance) }}</span>
                </div>
                <div class="row justify-between text-body2 q-mb-sm">
                  <span class="text-grey-8">Taxes ({{ invoiceRates.taxPercentage }}%)</span>
                  <span class="font-mono">${{ formatNumber((selectedInvoice.totalAmount - invoiceRates.fixedMaintenance) / (1 + (invoiceRates.taxPercentage / 100)) * (invoiceRates.taxPercentage / 100)) }}</span>
                </div>
                <q-separator class="q-my-md" />
                <div class="row justify-between text-h6 text-weight-bold">
                  <span>Total Payable</span>
                  <span>${{ formatNumber(selectedInvoice.totalAmount) }}</span>
                </div>
              </template>
            </div>

            <!-- Proof Image -->
            <div v-if="selectedInvoice.reading?.imageUrl" class="q-mt-xl">
              <div class="text-subtitle2 text-weight-bold q-mb-sm">Meter Photo Proof</div>
              <img :src="selectedInvoice.reading.imageUrl" style="width: 100%; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
            </div>

          </div>
        </q-card-section>

        <q-separator />
        
        <q-card-actions class="q-pa-md bg-white">
          <q-btn label="Download PDF" color="primary" outline class="col" />
          <q-btn label="Mark as Paid" color="positive" class="col q-ml-sm" v-if="selectedInvoice?.status === 'UNPAID'" @click="toggleStatus(selectedInvoice)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBillingStore } from '../stores/billing'
import { useQuasar } from 'quasar'

const store = useBillingStore()
const $q = useQuasar()

const searchQuery = ref('')
const statusFilter = ref('All')

const invoiceModalOpen = ref(false)
const selectedInvoice = ref<any>(null)

const invoiceRates = computed(() => {
  if (selectedInvoice.value && selectedInvoice.value.reading?.ratesSnapshot) {
    return selectedInvoice.value.reading.ratesSnapshot
  }
  return store.rates // fallback for old invoices
})

const columns = [
  { name: 'id', label: 'Invoice #', field: (row: any) => row.id.split('-')[0].toUpperCase(), align: 'left' as const },
  { name: 'location', label: 'Building & Office', field: 'location', align: 'left' as const },
  { name: 'tenant', label: 'Tenant Name', field: (row: any) => row.reading?.meter?.office?.tenantName || 'N/A', align: 'left' as const },
  { name: 'date', label: 'Reading Date', field: (row: any) => formatDate(row.createdAt), align: 'left' as const },
  { name: 'units', label: 'Consumed (kWh)', field: (row: any) => row.reading?.unitsConsumed, align: 'center' as const },
  { name: 'amount', label: 'Total Amount', field: 'amount', align: 'right' as const },
  { name: 'status', label: 'Status', field: 'status', align: 'center' as const },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const }
]

onMounted(() => {
  store.fetchInvoices()
})

const fallbackData = [
  {
    id: "INV-1001-XXXX-XXXX",
    createdAt: "2026-08-01T10:00:00Z",
    totalAmount: 12600,
    status: "UNPAID",
    reading: {
      unitsConsumed: 420,
      meter: {
        office: {
          officeNumber: "101",
          tenantName: "Tech Corp",
          building: { name: "Wasilay Plaza" }
        }
      }
    }
  },
  {
    id: "INV-1002-XXXX-XXXX",
    createdAt: "2026-08-02T11:00:00Z",
    totalAmount: 16672.50,
    status: "PAID",
    reading: {
      meterType: "Private Sub-Meter",
      gridImport: 320,
      solarExport: 120,
      generatorReading: 80,
      unitsConsumed: 280, // net Grid + Generator
      ratesSnapshot: {
        gridRate: 35,
        solarCreditRate: 25,
        generatorRate: 90,
        taxPercentage: 17,
        fixedMaintenance: 50
      },
      meter: {
        office: {
          officeNumber: "204",
          tenantName: "Global Imports LLC",
          building: { name: "Wasilay Plaza" }
        }
      }
    }
  },
]

const filteredInvoices = computed(() => {
  let list = store.invoices && store.invoices.length > 0 ? store.invoices : fallbackData

  if (statusFilter.value && statusFilter.value.toUpperCase() !== 'ALL') {
    list = list.filter(i => i.status === statusFilter.value.toUpperCase())
  }

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(i => {
      const invoiceId = (i.id || '').toLowerCase()
      const tenant = (i.reading?.meter?.office?.tenantName || '').toLowerCase()
      const office = (i.reading?.meter?.office?.officeNumber || '').toLowerCase()
      const building = (i.reading?.meter?.office?.building?.name || '').toLowerCase()
      return invoiceId.includes(q) || tenant.includes(q) || office.includes(q) || building.includes(q)
    })
  }

  return list
})

function formatNumber(num: number) {
  if (!num) return '0.00'
  return Number(num).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function onRowClick(evt: Event, row: any) {
  viewInvoice(row)
}

function viewInvoice(invoice: any) {
  selectedInvoice.value = invoice
  invoiceModalOpen.value = true
}

async function toggleStatus(invoice: any) {
  const success = await store.toggleInvoiceStatus(invoice.id, invoice.status)
  if (success) {
    $q.notify({ type: 'positive', message: 'Invoice status updated!', position: 'top-right' })
    store.fetchInvoices()
    if (selectedInvoice.value && selectedInvoice.value.id === invoice.id) {
      selectedInvoice.value.status = invoice.status === 'PAID' ? 'UNPAID' : 'PAID'
    }
  } else {
    $q.notify({ type: 'negative', message: 'Failed to update status', position: 'top-right' })
  }
}
</script>

<style scoped>
.bento-card {
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
}

.border-radius-full {
  border-radius: 9999px;
}

.glass-table {
  background: transparent;
}

.glass-table :deep(th) {
  background: #F9FAFB !important;
  color: #6B7280;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.font-mono {
  font-family: monospace;
}

.border-primary-alpha {
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.border-grey {
  border: 1px solid #E5E7EB;
}
</style>
