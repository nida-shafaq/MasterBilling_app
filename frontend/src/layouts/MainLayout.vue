<template>
  <q-layout view="hHh lpR fFf" class="bg-transparent">
    <!-- Top Floating Navigation -->
    <div class="bg-transparent q-pa-md q-pt-lg relative-position">
      <div class="glass-nav row items-center justify-between shadow-2 q-px-sm" style="flex-wrap: wrap; gap: 8px;">
        
        <div class="row items-center q-px-md no-wrap">
          <div class="logo-badge flex flex-center q-mr-sm">
            <q-icon name="bolt" size="sm" color="dark" />
          </div>
          <span class="text-weight-bold text-dark text-subtitle1" style="letter-spacing: -0.5px; white-space: nowrap;">MeterPulse</span>
        </div>

        <div class="row items-center q-gutter-x-sm nav-links gt-sm">
          <q-btn flat no-caps no-wrap label="Overview" to="/" exact active-class="nav-active" class="nav-btn" />
          <q-btn flat no-caps no-wrap label="Buildings" to="/building-setup" exact active-class="nav-active" class="nav-btn" />
          <q-btn flat no-caps no-wrap label="Meter Reading" to="/meter-reading" exact active-class="nav-active" class="nav-btn" />
          <q-btn flat no-caps no-wrap label="Invoices" to="/invoices" exact active-class="nav-active" class="nav-btn" />
        </div>

        <div class="row items-center q-px-md q-gutter-x-sm" style="flex-wrap: wrap; gap: 8px;">
          <q-btn 
            v-if="!isStandalone"
            unelevated 
            outline
            no-caps 
            icon="download"
            label="Install Desktop App" 
            color="primary"
            class="text-weight-bold"
            @click="installApp"
          />
          <!-- Theme Toggle -->
          <q-btn round flat :icon="$q.dark.isActive ? 'light_mode' : 'dark_mode'" @click="toggleTheme" color="grey-7" size="sm" class="gt-xs" />
          <q-btn round flat icon="notifications" color="grey-7" size="sm" />
          <q-btn round flat dense class="q-ml-sm">
            <q-avatar size="sm" class="avatar-ring">
              <img src="https://cdn.quasar.dev/img/avatar.png" />
            </q-avatar>
            
            <q-menu transition-show="scale" transition-hide="scale" anchor="bottom right" self="top right" class="bento-card" style="min-width: 250px; z-index: 50; padding: 0;">
              <div class="row no-wrap q-pa-md items-center">
                <q-avatar size="48px" class="q-mr-md avatar-ring">
                  <img src="https://cdn.quasar.dev/img/avatar.png" />
                </q-avatar>
                <div>
                  <div class="text-subtitle1 text-weight-bold" style="line-height: 1.2;">{{ authStore.profile.name }}</div>
                  <div class="text-caption text-grey-7 q-mb-xs">{{ authStore.profile.email }}</div>
                  <q-badge color="lime" text-color="dark" label="Admin" class="text-weight-bold" />
                </div>
              </div>
              <q-separator />
              <q-list class="q-py-sm">
                <q-item clickable v-close-popup to="/profile">
                  <q-item-section avatar style="min-width: 40px;"><q-icon name="person" size="sm" class="text-grey-7" /></q-item-section>
                  <q-item-section class="text-weight-medium">Profile Settings</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/preferences">
                  <q-item-section avatar style="min-width: 40px;"><q-icon name="settings" size="sm" class="text-grey-7" /></q-item-section>
                  <q-item-section class="text-weight-medium">Preferences / Appearance</q-item-section>
                </q-item>
                <q-item clickable v-close-popup to="/logs">
                  <q-item-section avatar style="min-width: 40px;"><q-icon name="description" size="sm" class="text-grey-7" /></q-item-section>
                  <q-item-section class="text-weight-medium">System Logs</q-item-section>
                </q-item>
                <q-separator class="q-my-sm" />
                <q-item clickable v-close-popup class="text-negative" @click="handleLogout">
                  <q-item-section avatar style="min-width: 40px;"><q-icon name="logout" size="sm" color="negative" /></q-item-section>
                  <q-item-section class="text-weight-bold">Sign Out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

      </div>
    </div>

    <q-page-container class="q-px-md q-pb-xl q-pt-md">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

    <!-- Mobile Bottom Navigation -->
    <q-footer class="bg-white text-dark lt-md" bordered :class="{ 'bg-dark text-white': $q.dark.isActive }">
      <q-tabs
        no-caps
        active-color="primary"
        indicator-color="transparent"
        class="text-grey-7"
        v-model="tab"
      >
        <q-route-tab name="overview" icon="dashboard" label="Overview" to="/" exact />
        <q-route-tab name="buildings" icon="domain" label="Buildings" to="/building-setup" exact />
        <q-route-tab name="meter" icon="speed" label="Reading" to="/meter-reading" exact />
        <q-route-tab name="invoices" icon="receipt" label="Invoices" to="/invoices" exact />
      </q-tabs>
    </q-footer>

    <!-- Manual Install Dialog -->
    <q-dialog v-model="showManualInstallDialog">
      <q-card style="width: 400px; max-width: 90vw;">
        <q-card-section class="row items-center bg-primary text-white">
          <div class="text-h6">Install Application</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md">
          <div class="text-subtitle1 text-weight-bold q-mb-sm">How to install manually:</div>
          <p class="text-grey-8">It looks like the automatic install prompt is not available right now. You can still install the app directly from your browser:</p>
          <ul class="text-grey-8">
            <li><strong>Chrome / Edge:</strong> Click the install icon (monitor with a down arrow) on the far right of your URL address bar.</li>
            <li><strong>Safari (iOS):</strong> Tap the Share button at the bottom and select "Add to Home Screen".</li>
            <li><strong>Android:</strong> Tap the 3-dot menu and select "Install app".</li>
          </ul>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Got it" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()
const showManualInstallDialog = ref(false)
const isStandalone = ref(false)
const tab = ref('overview')
const isProfileMenuOpen = ref(false)
let deferredPrompt: any = null

const handleBeforeInstallPrompt = (e: any) => {
  e.preventDefault()
  deferredPrompt = e
  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches
}

const handleLogout = () => {
  $q.notify({ type: 'info', message: 'Logged out successfully.' })
}

const toggleTheme = () => {
  $q.dark.toggle()
  localStorage.setItem('theme', $q.dark.isActive ? 'dark' : 'light')
}

onMounted(() => {
  // Load saved theme
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    $q.dark.set(savedTheme === 'dark')
  }

  isStandalone.value = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
})

const installApp = async () => {
  if (!deferredPrompt) {
    showManualInstallDialog.value = true
    return
  }
  deferredPrompt.prompt()
  const { outcome } = await deferredPrompt.userChoice
  deferredPrompt = null
}
</script>

<style scoped>
.glass-nav {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 9999px;
  height: auto;
  min-height: 60px;
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 4px;
  padding-bottom: 4px;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}
.glass-nav::-webkit-scrollbar {
  display: none;
}

.logo-badge {
  background: #CCFF00;
  border-radius: 8px;
  width: 32px;
  height: 32px;
  box-shadow: 0 0 10px rgba(204, 255, 0, 0.5);
}

.nav-links {
  background: rgba(243, 244, 246, 0.5);
  padding: 4px;
  border-radius: 9999px;
}

.nav-btn {
  border-radius: 9999px;
  color: #6B7280;
  font-weight: 600;
  transition: all 0.3s ease;
  padding: 8px 16px;
}

.nav-btn:hover {
  color: #111827;
  background: rgba(0, 0, 0, 0.03);
}

.nav-active {
  background: #111827 !important;
  color: #ffffff !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.btn-lime {
  background: #CCFF00;
  border-radius: 9999px;
  padding: 4px 16px;
  transition: all 0.3s ease;
}
.btn-lime:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(204, 255, 0, 0.4);
}

.avatar-ring {
  border: 2px solid #CCFF00;
  padding: 2px;
  background: white;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
