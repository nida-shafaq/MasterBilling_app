import { defineStore } from 'pinia'
import { ref } from 'vue'

const API_URL = 'http://localhost:3000/api'

export const useBillingStore = defineStore('billing', () => {
  const buildings = ref<any[]>([])
  const offices = ref<any[]>([])
  const meters = ref<any[]>([])
  const invoices = ref<any[]>([])
  const dashboardStats = ref<any>({})
  
  // Dynamic Tariff Configuration
  const rates = ref({
    gridRate: 35, // $/kWh
    solarCreditRate: 25, // $/kWh
    generatorRate: 90, // $/kWh
    taxPercentage: 17, // %
    fixedMaintenance: 50 // $
  })

  function updateRates(newRates: any) {
    rates.value = { ...rates.value, ...newRates }
  }

  async function fetchBuildings() {
    const res = await fetch(`${API_URL}/buildings`)
    buildings.value = await res.json()
  }

  async function fetchInvoices() {
    const res = await fetch(`${API_URL}/invoices`)
    invoices.value = await res.json()
  }

  async function fetchMeters() {
    const res = await fetch(`${API_URL}/meters`)
    meters.value = await res.json()
  }

  async function createBuilding(data: any) {
    const res = await fetch(`${API_URL}/buildings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    if (res.ok) {
      await fetchBuildings()
    }
  }

  async function fetchOffices(buildingId: string) {
    const res = await fetch(`${API_URL}/offices/building/${buildingId}`)
    offices.value = await res.json()
  }

  async function createOffice(data: any) {
    const res = await fetch(`${API_URL}/offices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.ok
  }

  async function createMeter(data: any) {
    const res = await fetch(`${API_URL}/meters`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return res.ok
  }

  async function deleteMeter(id: string) {
    const res = await fetch(`${API_URL}/meters/${id}`, {
      method: 'DELETE'
    })
    return res.ok
  }

  async function fetchLatestReading(officeId: string) {
    const res = await fetch(`${API_URL}/meters/${officeId}/latest-reading`)
    if (!res.ok) return null
    return await res.json()
  }

  async function submitReading(data: any) {
    const res = await fetch(`${API_URL}/readings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return await res.json()
  }

  async function fetchInvoice(readingId: string) {
    const res = await fetch(`${API_URL}/invoices/${readingId}`)
    return await res.json()
  }

  async function updateInvoiceStatus(invoiceId: string, status: string) {
    const res = await fetch(`${API_URL}/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    })
    return res.ok
  }

  async function fetchDashboardStats() {
    const res = await fetch(`${API_URL}/invoices/stats/dashboard`)
    dashboardStats.value = await res.json()
  }

  async function toggleInvoiceStatus(id: string, currentStatus: string) {
    const newStatus = currentStatus === 'PAID' ? 'UNPAID' : 'PAID'
    const res = await fetch(`${API_URL}/invoices/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    })
    return res.ok
  }

  return {
    buildings,
    offices,
    meters,
    invoices,
    dashboardStats,
    rates,
    fetchBuildings,
    fetchMeters,
    fetchInvoices,
    createBuilding,
    fetchOffices,
    createOffice,
    createMeter,
    deleteMeter,
    fetchLatestReading,
    submitReading,
    fetchInvoice,
    updateInvoiceStatus,
    toggleInvoiceStatus,
    fetchDashboardStats,
    updateRates
  }
})
