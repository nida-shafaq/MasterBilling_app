<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-xl q-mt-sm">
      <div>
        <div class="text-h4 text-weight-bold">Profile Settings</div>
        <div class="text-subtitle1 text-grey-6 q-mt-xs">Manage your account details and security.</div>
      </div>
    </div>
    
    <!-- Profile Info Card -->
    <div class="bento-card q-pa-lg q-mb-lg">
      <div class="row items-center q-mb-lg">
        <q-avatar size="80px" class="q-mr-lg avatar-ring">
          <img src="https://cdn.quasar.dev/img/avatar.png" />
        </q-avatar>
        <div>
          <div class="text-h5 text-weight-bold text-dark">{{ authStore.profile.name }}</div>
          <div class="text-subtitle2 text-grey-7">{{ authStore.profile.email }}</div>
          <q-badge color="lime" text-color="dark" label="Admin" class="text-weight-bold q-mt-sm" />
        </div>
      </div>
      <q-separator class="q-my-lg" />
      <div class="row q-col-gutter-md">
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.name" label="Full Name" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.email" label="Email Address" type="email" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.phone" label="Phone Number" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="form.role" label="Role" disable />
        </div>
      </div>
      <div class="q-mt-xl text-right">
        <q-btn unelevated color="primary" label="Save Changes" class="border-radius-full q-px-lg text-weight-bold" @click="confirmSave" />
      </div>
    </div>

    <!-- Security & Password Card -->
    <div class="bento-card q-pa-lg">
      <div class="text-h5 text-weight-bold text-dark q-mb-md">Security & Password</div>
      <q-separator class="q-mb-lg" />
      <div class="row q-col-gutter-md">
        <div class="col-12">
          <q-input outlined v-model="passwordForm.current" label="Current Password" type="password" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="passwordForm.new" label="New Password" type="password" />
        </div>
        <div class="col-12 col-md-6">
          <q-input outlined v-model="passwordForm.confirm" label="Confirm New Password" type="password" />
        </div>
      </div>
      <div class="q-mt-xl text-right">
        <q-btn unelevated color="dark" label="Update Password" class="border-radius-full q-px-lg text-weight-bold text-white" @click="updatePassword" />
      </div>
    </div>

  </q-page>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../stores/auth'

const $q = useQuasar()
const authStore = useAuthStore()

const form = ref({
  name: '',
  email: '',
  phone: '',
  role: 'Administrator'
})

const passwordForm = ref({
  current: '',
  new: '',
  confirm: ''
})

onMounted(() => {
  form.value.name = authStore.profile.name
  form.value.email = authStore.profile.email
  form.value.phone = authStore.profile.phone
})

const confirmSave = () => {
  $q.dialog({
    title: 'Confirm Profile Update',
    message: 'Are you sure you want to apply these profile changes?',
    cancel: true,
    persistent: true,
    ok: { label: 'Confirm / Apply', color: 'primary', unelevated: true },
    cancel: { label: 'Cancel', color: 'grey-7', flat: true }
  }).onOk(() => {
    authStore.updateProfile({
      name: form.value.name,
      email: form.value.email,
      phone: form.value.phone
    })
    $q.notify({ type: 'positive', message: 'Profile updated successfully!', position: 'top' })
  })
}

const updatePassword = () => {
  if (passwordForm.value.new.length < 6) {
    $q.notify({ type: 'negative', message: 'New password must be at least 6 characters long.', position: 'top' })
    return
  }
  if (passwordForm.value.new !== passwordForm.value.confirm) {
    $q.notify({ type: 'negative', message: 'Passwords do not match!', position: 'top' })
    return
  }
  
  $q.notify({ type: 'positive', message: 'Password updated successfully!', position: 'top' })
  passwordForm.value.current = ''
  passwordForm.value.new = ''
  passwordForm.value.confirm = ''
}
</script>
