<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ error: string | null }>()
const emit = defineEmits<{ submit: [phrase: string] }>()

const phrase = ref('')
const submitting = ref(false)

async function onSubmit() {
  if (!phrase.value.trim()) return
  submitting.value = true
  try {
    await emit('submit', phrase.value)
  } catch {
    // error handled by store
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="mnemonic-form">
    <div class="field">
      <label for="mnemonic" class="field-label">请输入助记词</label>
      <input
        id="mnemonic"
        v-model="phrase"
        type="text"
        placeholder="输入您的助记词短语..."
        autocomplete="off"
        class="mnemonic-input"
      />
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <button type="submit" :disabled="submitting" class="btn-unlock">
      <span v-if="!submitting">▸ 解 锁</span>
      <span v-else>验证中...</span>
    </button>
  </form>
</template>

<style scoped>
.mnemonic-form {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.field-label {
  display: block;
  color: #994444;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.mnemonic-input {
  width: 100%;
  padding: 0.8rem 1rem;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 0, 0, 0.4);
  border-radius: 2px;
  color: #ff3333;
  font-family: 'Courier New', monospace;
  font-size: 1rem;
  letter-spacing: 0.05em;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
}

.mnemonic-input:focus {
  border-color: #ff1a1a;
  box-shadow:
    0 0 10px rgba(255, 0, 0, 0.3),
    inset 0 0 10px rgba(255, 0, 0, 0.05);
}

.mnemonic-input::placeholder {
  color: #553333;
}

.error {
  color: #ff4444;
  font-size: 0.8rem;
  text-align: center;
  margin: 0;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
}

.btn-unlock {
  padding: 0.8rem;
  background: rgba(255, 0, 0, 0.1);
  color: #ff1a1a;
  border: 1px solid rgba(255, 0, 0, 0.5);
  border-radius: 2px;
  font-size: 0.95rem;
  cursor: pointer;
  letter-spacing: 0.3em;
  font-family: 'Courier New', monospace;
  transition: all 0.3s;
  text-transform: uppercase;
}

.btn-unlock:hover:not(:disabled) {
  background: rgba(255, 0, 0, 0.2);
  box-shadow: 0 0 20px rgba(255, 0, 0, 0.2);
  border-color: rgba(255, 0, 0, 0.7);
}

.btn-unlock:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
