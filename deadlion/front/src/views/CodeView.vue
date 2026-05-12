<template>
  <div class="login-container">
    <h2 class="login-title">Verification Code</h2>
    <div class="input-group">
      <input v-model="code" class="basic-input-login" type="text" placeholder="Enter verification code" />
    </div>
    <div class="button-wrapper">
      <button class="blue-button" @click="sendCode">
        Send Verification Code
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import router from '../router'
import { ref } from 'vue'

const code = ref('')

const route = useRoute()
const email = route.query.email

const sendCode = async () => {
  const response = await fetch("/api/auth/code", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: email,
      code: code.value
    })
  })
  if (response.ok) {
    const data = await response.json()
    localStorage.setItem('auth_token', data?.token)
    router.push('/home')
  }
}
</script>