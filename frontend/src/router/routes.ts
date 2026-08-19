import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('../pages/Dashboard.vue') },
      { path: 'building-setup', component: () => import('../pages/BuildingSetup.vue') },
      { path: 'meter-reading', component: () => import('../pages/MeterReading.vue') },
      { path: 'invoices', component: () => import('../pages/Invoices.vue') },
      { path: 'profile', component: () => import('../pages/ProfilePage.vue') },
      { path: 'preferences', component: () => import('../pages/PreferencesPage.vue') },
      { path: 'logs', component: () => import('../pages/LogsPage.vue') }
    ]
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('../pages/ErrorNotFound.vue')
  }
]

export default routes
