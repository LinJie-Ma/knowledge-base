import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

export function useMnemonicAuth() {
  const router = useRouter()
  const auth = useAuthStore()

  const now = ref(new Date())
  let timer: ReturnType<typeof setInterval>

  onMounted(() => {
    timer = setInterval(() => { now.value = new Date() }, 1000)
  })
  onUnmounted(() => clearInterval(timer))

  function timeStr() {
    return now.value.toLocaleTimeString('zh-CN', { hour12: false })
  }

  async function handleUnlock(phrase: string) {
    await auth.unlock(phrase)
    router.push('/dashboard')
  }

  return { auth, now, timeStr, handleUnlock }
}
