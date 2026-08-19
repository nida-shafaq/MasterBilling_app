<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-xl q-mt-sm">
      <div>
        <div class="text-h4 text-weight-bold">System Logs</div>
        <div class="text-subtitle1 text-grey-6 q-mt-xs">Audit trail and system activity history.</div>
      </div>
    </div>
    <div class="bento-card q-pa-none">
      <q-table
        :rows="logs"
        :columns="columns"
        row-key="id"
        flat
        class="bg-transparent"
        :pagination="{ rowsPerPage: 10 }"
      >
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge :color="props.row.status === 'Success' ? 'positive' : (props.row.status === 'Warning' ? 'warning' : 'negative')" :label="props.row.status" class="text-weight-bold" />
          </q-td>
        </template>
      </q-table>
    </div>
  </q-page>
</template>
<script setup>
import { ref } from 'vue'

const columns = [
  { name: 'timestamp', label: 'TIMESTAMP', field: 'timestamp', align: 'left', sortable: true },
  { name: 'action', label: 'ACTION', field: 'action', align: 'left' },
  { name: 'user', label: 'USER', field: 'user', align: 'left' },
  { name: 'ip', label: 'IP ADDRESS', field: 'ip', align: 'left' },
  { name: 'status', label: 'STATUS', field: 'status', align: 'center' }
]

const logs = ref([
  { id: 1, timestamp: '2026-08-19 14:30:12', action: 'Invoice Generated', user: 'Nida Shafaq', ip: '192.168.1.45', status: 'Success' },
  { id: 2, timestamp: '2026-08-19 14:15:05', action: 'Meter Scanned', user: 'Nida Shafaq', ip: '192.168.1.45', status: 'Success' },
  { id: 3, timestamp: '2026-08-19 12:00:22', action: 'Failed Login Attempt', user: 'Unknown', ip: '203.0.113.1', status: 'Warning' },
  { id: 4, timestamp: '2026-08-18 09:45:11', action: 'Building Setup Changed', user: 'Admin', ip: '192.168.1.100', status: 'Success' },
  { id: 5, timestamp: '2026-08-18 08:30:00', action: 'System Backup', user: 'System', ip: '127.0.0.1', status: 'Success' }
])
</script>
