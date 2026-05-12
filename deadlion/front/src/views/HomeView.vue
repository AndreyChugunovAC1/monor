<template>
  <div>
    <div class="home-header">
      <h1>Motivations</h1>
      <button class="green-button" @click="router.push('add')">
        +
      </button>
    </div>

    <div v-if="mots.length > 0" class="motivations-list">
      <div v-for="mot in mots" class="motivation-card">
        <div class="motivation-content">
          <div class="motivation-title">{{ cropped(mot.title, 20) }}</div>
          <div class="motivation-descr">{{ cropped(mot.descr, 100) }}</div>
          <div class="motivation-details">
            <div class="motivation-asi">
              ASI: {{ formatAsi(mot.asi) }} day(s)
            </div>
          </div>
        </div>
        <div class="motivation-actions">
          <button class="blue-button" @click="router.push(`/edit/${mot.id}`)">
            Edit
          </button>
        </div>
      </div>
    </div>

    <div class="exit-container">
      <button v-if="noSub()" class="blue-button" @click="setupPush()">
        Subscribe
      </button>
      <button class="red-button" @click="logout()">
        Exit
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useMots } from '../composables/useMots'
import { onMounted, ref } from 'vue'
import type { Mot } from '@/types/types'

const router = useRouter()
const { getMots } = useMots()

const mots = ref<Mot[]>([])

onMounted(async () => {
  mots.value = await getMots()
})

const noSub = () => !localStorage.getItem('push_sub')

const setupPush = async () => {
  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    const registration = await navigator.serviceWorker.register('/sw.js');

    function urlBase64ToUint8Array(base64String: string) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');
      const rawData = window.atob(base64);
      return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }

    const applicationServerKey = urlBase64ToUint8Array('BK40FM91GypTIcogYBH09a5Tz5VHq35mwS1hjnBIJbNk2OV_QTW1EFeVSURXpMAJ7wfEQDScuTmkNMzY1SPQPDw')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    });

    if (!localStorage.getItem('push_sub')) {
      const strSub = JSON.stringify({ sub: subscription })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: strSub
      })
      localStorage.setItem('push_sub', "true")
    }
  }
}

const cropped = (text: string, maxLen = 100): string => {
  const stripped = text.trim()
  if (stripped.length < maxLen) {
    return stripped
  }
  return stripped.slice(0, maxLen).trimEnd() + '...'
}

const formatAsi = (asi: number): string => {
  return asi.toFixed(2).replace(/\.?0+$/, '')
}

const logout = async () => {
  localStorage.removeItem('auth_token')
  localStorage.removeItem('push_sub')
  router.push('/login')
}
</script>