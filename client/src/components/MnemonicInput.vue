<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ error: string | null }>()
const emit = defineEmits<{ submit: [phrase: string] }>()

const WORD_COUNT = 5
const words = ref<string[]>(Array(WORD_COUNT).fill(''))
const submitting = ref(false)

async function onSubmit() {
  const phrase = words.value.map(w => w.trim()).join(' ')
  if (words.value.every(w => !w.trim())) return
  submitting.value = true
  try {
    await emit('submit', phrase)
  } catch {
    // error handled by store
  } finally {
    submitting.value = false
  }
}

function handleInput(index: number, event: Event) {
  const input = event.target as HTMLInputElement
  if (input.value.includes(' ')) {
    input.value = input.value.replace(/\s/g, '')
    words.value[index] = input.value
    const next = document.getElementById(`word-${index + 1}`)
    next?.focus()
  } else {
    words.value[index] = input.value
  }
}

function handleKeydown(index: number, event: KeyboardEvent) {
  if (event.key === 'Backspace' && !words.value[index] && index > 0) {
    const prev = document.getElementById(`word-${index - 1}`)
    prev?.focus()
  }
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="mnemonic-form">
    <div class="word-grid">
      <div v-for="(_, i) in WORD_COUNT" :key="i" class="word-field">
        <span class="word-num">{{ i + 1 }}</span>
        <input
          :id="`word-${i}`"
          v-model="words[i]"
          type="text"
          autocomplete="off"
          spellcheck="false"
          class="word-input"
          @input="handleInput(i, $event)"
          @keydown="handleKeydown(i, $event)"
        />
      </div>
    </div>
    <p v-if="error" class="error">{{ error }}</p>
    <button type="submit" :disabled="submitting" class="btn-verify">
      <span v-if="submitting" class="btn-loading">⟳ 验 证 中</span>
      <span v-else>▸ 验 证</span>
    </button>
  </form>
</template>

<style scoped>
.mnemonic-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(12px, 2.5vh, 22px);
}

.field-hint {
  color: #881111;
  font-size: clamp(0.65rem, 1vw, 0.85rem);
  letter-spacing: 0.25em;
  margin: 0;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  text-transform: uppercase;
  text-shadow: 0 0 4px rgba(255,0,0,0.2);
}

.word-grid {
  display: flex;
  gap: clamp(5px, 0.8vw, 10px);
  width: 100%;
}

.word-field {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(3px, 0.6vh, 6px);
}

.word-num {
  color: #771111;
  font-size: clamp(0.6rem, 0.9vw, 0.8rem);
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}

.word-input {
  width: 100%;
  height: clamp(40px, 8vh, 50px);
  padding: 0;
  background: rgba(8,1,2,0.7);
  border: 2px solid rgba(255,40,40,0.5);
  border-radius: 3px;
  color: #ff4040;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  font-size: clamp(0.9rem, 1.6vw, 1.3rem);
  text-align: center;
  outline: none;
  transition: all 0.3s;
  box-sizing: border-box;
  box-shadow:
    0 0 6px rgba(255,0,0,0.2),
    0 0 16px rgba(255,0,0,0.06);
}

.word-input:focus {
  border-color: #ff3030;
  background: rgba(12,1,2,0.9);
  box-shadow:
    0 0 10px rgba(255,0,0,0.5),
    0 0 24px rgba(255,0,0,0.25),
    0 0 40px rgba(255,0,0,0.1),
    inset 0 0 10px rgba(255,0,0,0.08);
}

.error {
  color: #ff4444;
  font-size: clamp(0.65rem, 0.9vw, 0.8rem);
  text-align: center;
  margin: 0;
  text-shadow: 0 0 8px rgba(255,0,0,0.4);
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}

.btn-verify {
  width: 100%;
  padding: clamp(10px, 2.2vh, 18px) clamp(16px, 3vw, 32px);
  background: rgba(255,20,30,0.07);
  color: #ff1a1a;
  border: 2px solid rgba(255,30,40,0.45);
  border-radius: 3px;
  font-size: clamp(0.85rem, 1.4vw, 1.2rem);
  cursor: pointer;
  letter-spacing: 0.35em;
  font-family: 'Segoe UI', 'SF Pro Display', 'Noto Sans SC', sans-serif;
  transition: all 0.3s;
  text-transform: uppercase;
  box-shadow:
    0 0 10px rgba(255,0,0,0.12),
    0 0 20px rgba(255,0,0,0.04);
}

.btn-verify:hover:not(:disabled) {
  background: rgba(255,20,30,0.16);
  border-color: rgba(255,30,40,0.8);
  box-shadow:
    0 0 16px rgba(255,0,0,0.35),
    0 0 36px rgba(255,0,0,0.18),
    0 0 56px rgba(255,0,0,0.08),
    inset 0 0 12px rgba(255,0,0,0.08);
  color: #ff4444;
  transform: scale(1.01);
}

.btn-verify:disabled {
  opacity: 0.4;
  cursor: default;
}

.btn-loading {
  animation: pulse-text 1s ease-in-out infinite;
}

@keyframes pulse-text {
  0%,100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
