<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginForm from '../components/LoginForm.vue'

const router = useRouter()
const auth = useAuthStore()

async function handleLogin(username: string, password: string) {
  await auth.login(username, password)
  router.push('/unlock')
}
</script>

<template>
  <div class="login-page">
    <div class="login-box">
      <h1 class="title">MAIN LJ</h1>
      <LoginForm :error="auth.error" @submit="handleLogin" />
    </div>
  </div>
</template>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  background: #111;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, 'Noto Sans SC', sans-serif;
}

.login-box {
  width: 320px;
}

.title {
  text-align: center;
  color: #666;
  font-size: 1.3rem;
  font-weight: 400;
  letter-spacing: 0.2em;
  margin: 0 0 1.5rem;
}
</style>
