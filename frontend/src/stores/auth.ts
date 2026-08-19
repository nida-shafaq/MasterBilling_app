import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const profile = ref({
    name: localStorage.getItem('profile_name') || 'Nida Shafaq',
    email: localStorage.getItem('profile_email') || 'admin@meterpulse.io',
    phone: localStorage.getItem('profile_phone') || '+1 234 567 890',
    role: 'Administrator'
  })

  function updateProfile(newProfile: any) {
    profile.value = { ...profile.value, ...newProfile }
    localStorage.setItem('profile_name', profile.value.name)
    localStorage.setItem('profile_email', profile.value.email)
    localStorage.setItem('profile_phone', profile.value.phone)
  }

  return { profile, updateProfile }
})
