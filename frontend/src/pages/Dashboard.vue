<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-xl q-mt-sm" style="flex-wrap: wrap; gap: 16px;">
      <div>
        <div class="text-h4 text-weight-bold">Overview</div>
        <div class="text-subtitle1 text-grey-6 q-mt-xs">Your utility billing performance this month.</div>
      </div>
      <q-btn unelevated color="primary" label="+ NEW INVOICE" class="border-radius-full q-px-lg text-weight-bold" to="/meter-reading" />
    </div>

    <div class="row q-col-gutter-lg">
      <!-- Main Analytics Card (Funnel / Bar) -->
      <div class="col-12 col-md-8">
        <div class="bento-card q-pa-lg relative-position" style="height: 400px; display: flex; flex-direction: column;">
          <div class="row justify-between items-center q-mb-md">
            <div class="text-h6 text-weight-bold">Utility Consumption Funnel</div>
            <div class="glass-pill text-caption text-weight-bold text-primary bg-blue-1">Live Data</div>
          </div>
          <div class="flex-grow-1" style="min-height: 250px;">
            <v-chart class="chart" :option="funnelOptions" autoresize />
          </div>
          
          <!-- AI Prompt Bar -->
          <div class="ai-prompt-bar absolute-bottom q-ma-md q-pa-sm row items-center glass-pill shadow-2">
            <q-icon name="auto_awesome" color="accent" size="sm" class="q-ml-sm q-mr-md" />
            <input type="text" placeholder="Ask AI: What is the trend for commercial offices this week?" class="ai-input col" />
            <q-btn round dense flat icon="arrow_upward" color="white" class="bg-primary q-ml-sm" />
          </div>
        </div>
      </div>

      <!-- Right Side Summary Card -->
      <div class="col-12 col-md-4">
        <div class="bento-card q-pa-lg" style="height: 400px; display: flex; flex-direction: column;">
          <div class="text-subtitle2 text-grey-6 text-uppercase text-weight-bold q-mb-xs">Gross Billing</div>
          <div class="text-h3 text-weight-bolder text-primary q-mb-lg">${{ formatNumber(stats.totalRevenue) }}</div>
          
          <div class="q-mt-auto">
            <div class="text-subtitle2 text-weight-bold q-mb-sm">Revenue Distribution</div>
            
            <div class="q-mb-md">
              <div class="row justify-between text-caption q-mb-xs">
                <span>Commercial Offices</span>
                <span class="text-weight-bold">65%</span>
              </div>
              <q-linear-progress size="8px" :value="0.65" color="secondary" class="rounded-borders" />
            </div>

            <div class="q-mb-md">
              <div class="row justify-between text-caption q-mb-xs">
                <span>Retail Shops</span>
                <span class="text-weight-bold">25%</span>
              </div>
              <q-linear-progress size="8px" :value="0.25" color="accent" class="rounded-borders" />
            </div>

            <div class="q-mb-sm">
              <div class="row justify-between text-caption q-mb-xs">
                <span>Parking Meters</span>
                <span class="text-weight-bold">10%</span>
              </div>
              <q-linear-progress size="8px" :value="0.1" color="info" class="rounded-borders" />
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Left: Trend -->
      <div class="col-12 col-md-4">
        <div class="bento-card q-pa-lg" style="height: 250px;">
          <div class="text-h6 text-weight-bold q-mb-sm">Consumption Trend</div>
          <v-chart class="chart" :option="trendOptions" autoresize style="height: 160px;" />
        </div>
      </div>

      <!-- Bottom Middle: Dot Matrix -->
      <div class="col-12 col-md-4">
        <div class="bento-card q-pa-lg" style="height: 250px;">
          <div class="text-h6 text-weight-bold q-mb-sm">Peak Usage Heatmap</div>
          <v-chart class="chart" :option="scatterOptions" autoresize style="height: 160px;" />
        </div>
      </div>

      <!-- Bottom Right: Smart Insights -->
      <div class="col-12 col-md-4">
        <div class="bento-card mesh-gradient q-pa-lg text-white relative-position overflow-hidden" style="height: 250px;">
          <div class="absolute-top-right q-pa-md">
            <q-icon name="insights" size="xl" style="opacity: 0.3;" />
          </div>
          
          <div class="glass-pill d-inline-block text-caption text-weight-bold q-mb-md border-white-alpha">
            <q-icon name="wb_incandescent" class="q-mr-xs" /> Smart Insight
          </div>
          
          <div class="text-h6 text-weight-bold" style="line-height: 1.4;">
            Meter #102 recorded a <span class="text-warning">14% abnormal spike</span> compared to last month.
          </div>
          
          <div class="absolute-bottom q-pa-lg">
            <q-btn flat class="bg-white text-primary text-weight-bold border-radius-full" label="Investigate" no-caps />
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useBillingStore } from '../stores/billing'
import { useQuasar } from 'quasar'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, LineChart, ScatterChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, GraphicComponent } from 'echarts/components'
import VChart from 'vue-echarts'

use([CanvasRenderer, BarChart, LineChart, ScatterChart, GridComponent, TooltipComponent, GraphicComponent])

const store = useBillingStore()

const stats = computed(() => store.dashboardStats || {
  totalRevenue: 41500,
  paidRevenue: 0,
  totalUnits: 0,
  unpaidCount: 0,
  paidCount: 0
})

onMounted(() => {
  store.fetchDashboardStats()
})

function formatNumber(num: number) {
  if (!num) return '0'
  return Number(num).toLocaleString('en-US', { maximumFractionDigits: 0 })
}

// Chart Options
const funnelOptions = {
  tooltip: { trigger: 'axis', backgroundColor: 'rgba(255,255,255,0.9)', borderColor: '#E5E7EB', textStyle: { color: '#111827' } },
  grid: { top: 20, right: 0, bottom: 20, left: 0, containLabel: true },
  xAxis: { type: 'category', data: ['Buildings', 'Offices', 'Readings', 'Invoices', 'Collected'], axisLine: { show: false }, axisTick: { show: false }, splitLine: { show: false } },
  yAxis: { type: 'value', show: false },
  series: [{
    data: [120, 85, 70, 60, 45],
    type: 'bar',
    barWidth: '40%',
    itemStyle: {
      borderRadius: [8, 8, 0, 0],
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: '#06B6D4' }, { offset: 1, color: '#3B82F6' }]
      }
    }
  }]
}

const trendOptions = {
  grid: { top: 10, right: 0, bottom: 20, left: -20, containLabel: true },
  xAxis: { type: 'category', data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], show: false },
  yAxis: { type: 'value', show: false },
  series: [{
    data: [150, 230, 224, 218, 135, 147, 260],
    type: 'line',
    smooth: true,
    step: 'middle',
    symbol: 'none',
    lineStyle: { color: '#EC4899', width: 3 },
    areaStyle: {
      color: {
        type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [{ offset: 0, color: 'rgba(236,72,153,0.3)' }, { offset: 1, color: 'rgba(236,72,153,0)' }]
      }
    }
  }]
}

const scatterData = []
for (let i = 0; i < 7; i++) {
  for (let j = 0; j < 5; j++) {
    scatterData.push([i, j, Math.random() * 10])
  }
}
const scatterOptions = {
  grid: { top: 10, right: 10, bottom: 20, left: 0, containLabel: true },
  xAxis: { show: false },
  yAxis: { show: false },
  series: [{
    type: 'scatter',
    data: scatterData,
    symbolSize: (val) => val[2] * 2 + 4,
    itemStyle: { color: '#10B981', opacity: 0.7 }
  }]
}

</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}

.ai-prompt-bar {
  border: 1px solid rgba(229, 231, 235, 0.8);
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
}

.ai-input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #111827;
}

.ai-input::placeholder {
  color: #9CA3AF;
  font-weight: 500;
}

.border-radius-full {
  border-radius: 9999px;
}

.border-white-alpha {
  border: 1px solid rgba(255,255,255,0.4);
}
</style>
