<template>
  <div class="login-container">
    <h2 class="login-title">Sign In</h2>
    <div class="input-group">
      <input v-if="loginMethod === 'email'" v-model="email" class="basic-input-login" type="email"
        placeholder="your email" />
      <input v-else-if="loginMethod === 'token'" v-model="secret" class="basic-input-login" type="email"
        placeholder="personal token" />
      <select v-model="loginMethod" class="select-email-token">
        <option value="email" class="login-option">📧</option>
        <option value="token" class="login-option">🔑</option>
      </select>
    </div>
    <div class="button-wrapper">
      <button v-if="loginMethod === 'email'" class="blue-button" @click="sendLogin">
        Send verification code
      </button>
      <button v-else-if="loginMethod === 'token'" class="blue-button" @click="sendSecret">
        Log in by token
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '../router'
import { ref } from 'vue'

const email = ref('')
const secret = ref('')
const loginMethod = ref<'email' | 'token'>('email')

const sendLogin = async () => {
  const response = await fetch("/api/auth/email", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 'email': email.value })
  })
  if (response.ok) {
    router.push({
      path: '/login/code',
      query: { email: email.value }
    })
  }
}

const sendSecret = async () => {
  const response = await fetch("/api/auth/secret", {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 'secret': secret.value })
  })
  if (response.ok) {
    const data = await response.json()
    if (data?.token) {
      localStorage.setItem('auth_token', data?.token)
      router.push('/home')
    }
  }
}
</script>
