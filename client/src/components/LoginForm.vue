<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ error: string | null }>()
const emit = defineEmits<{ submit: [username: string, password: string] }>()

const username = ref('')
const password = ref('')
const submitting = ref(false)

async function onSubmit() {
  if (!username.value || !password.value) return
  submitting.value = true
  try {
    await emit('submit', username.value, password.value)
  } catch {
    // error handled by store
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="login-form">
    <input
      v-model="username"
      type="text"
      placeholder="用户名"
      autocomplete="username"
    />
    <input
      v-model="password"
      type="password"
      placeholder="密码"
      autocomplete="current-password"
    />
    <p v-if="error" class="error">{{ error }}</p>
    <button type="submit" :disabled="submitting">
      {{ submitting ? '验证中...' : '登录' }}
    </button>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

input {
  width: 100%;
  padding: 0.6rem 0.8rem;
  border: 1px solid #333;
  border-radius: 3px;
  background: #1a1a1a;
  color: #ccc;
  font-size: 0.9rem;
  outline: none;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s;
}

input:focus {
  border-color: #555;
}

input::placeholder {
  color: #555;
}

.error {
  color: #c44;
  font-size: 0.8rem;
  text-align: center;
  margin: 0;
}

button {
  padding: 0.6rem;
  background: #333;
  color: #999;
  border: none;
  border-radius: 3px;
  font-size: 0.9rem;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

button:hover:not(:disabled) {
  background: #444;
  color: #ccc;
}

button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
