import { defineStore } from 'pinia'
import { ref } from 'vue'
import { auth, type SessionData } from '../api'

export const useAuthStore = defineStore('auth', () => {
  const stage = ref(0)
  const username = ref<string | null>(null)
  const loading = ref(true)
  const error = ref<string | null>(null)

  async function checkSession() {
    try {
      const res = await auth.session()
      stage.value = res.data.stage
      username.value = res.data.username
    } catch {
      stage.value = 0
      username.value = null
    } finally {
      loading.value = false
    }
  }

  async function login(name: string, password: string) {
    error.value = null
    try {
      const res = await auth.login(name, password)
      stage.value = res.data.stage
      username.value = res.data.username
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        error.value = axiosErr.response?.data?.error || 'Login failed'
      } else {
        error.value = 'Login failed'
      }
      throw err
    }
  }

  async function unlock(phrase: string) {
    error.value = null
    try {
      const res = await auth.mnemonic(phrase)
      stage.value = res.data.stage
      username.value = res.data.username
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } }
        error.value = axiosErr.response?.data?.error || 'Invalid mnemonic phrase'
      } else {
        error.value = 'Invalid mnemonic phrase'
      }
      throw err
    }
  }

  async function logout() {
    await auth.logout()
    stage.value = 0
    username.value = null
  }

  return { stage, username, loading, error, checkSession, login, unlock, logout }
})
