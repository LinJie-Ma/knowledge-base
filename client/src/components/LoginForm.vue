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
    <div class="field">
      <label for="username">用户名</label>
      <input
        id="username"
        v-model="username"
        type="text"
        placeholder="输入用户名"
        autocomplete="username"
      />
    </div>
    <div class="field">
      <label for="password">密码</label>
      <input
        id="password"
        v-model="password"
        type="password"
        placeholder="输入密码"
        autocomplete="current-password"
      />
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <button type="submit" :disabled="submitting" class="btn-login">
      {{ submitting ? '验证中...' : '登 录' }}
    </button>
  </form>
</template>

<style scoped>
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field label {
  display: block;
  color: #6b4c34;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  letter-spacing: 0.05em;
}

.field input {
  width: 100%;
  padding: 0.65rem 0.8rem;
  border: 1px solid #c4a882;
  border-radius: 3px;
  background: #fdfaf6;
  font-size: 0.95rem;
  color: #3d2214;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.field input:focus {
  border-color: #8b5a2b;
  box-shadow: 0 0 0 2px rgba(139, 90, 43, 0.15);
}

.error {
  color: #b33a3a;
  font-size: 0.85rem;
  text-align: center;
  margin: 0;
}

.btn-login {
  padding: 0.7rem;
  background: linear-gradient(180deg, #5a3825 0%, #3d2214 100%);
  color: #e8d5c0;
  border: 1px solid #6b4c34;
  border-radius: 3px;
  font-size: 1rem;
  cursor: pointer;
  letter-spacing: 0.2em;
  font-family: inherit;
  transition: all 0.2s;
  margin-top: 0.5rem;
}

.btn-login:hover:not(:disabled) {
  background: linear-gradient(180deg, #6b4c34 0%, #5a3825 100%);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
