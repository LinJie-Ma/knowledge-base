<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import MnemonicInput from '../components/MnemonicInput.vue'

const router = useRouter()
const auth = useAuthStore()

async function handleUnlock(phrase: string) {
  await auth.unlock(phrase)
  router.push('/dashboard')
}
</script>

<template>
  <div class="scifi-login">
    <div class="scifi-overlay"></div>
    <div class="scifi-scanlines"></div>
    <div class="scifi-content">
      <div class="scifi-header">
        <div class="scifi-line"></div>
        <h1>SECURE UNLOCK</h1>
        <div class="scifi-line"></div>
      </div>
      <p class="scifi-label">[ 助记词验证 ]</p>
      <div class="unlock-card">
        <div class="card-glow"></div>
        <MnemonicInput :error="auth.error" @submit="handleUnlock" />
      </div>
      <div class="scifi-footer">
        <span class="blink">▮</span> STAGE 2 AUTHENTICATION REQUIRED
      </div>
    </div>
  </div>
</template>

<style scoped>
.scifi-login {
  width: 100vw;
  height: 100vh;
  background: #0a0a0a;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Courier New', 'Noto Sans SC', monospace;
  position: relative;
  overflow: hidden;
}

.scifi-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 50%, rgba(255, 0, 0, 0.06) 0%, transparent 60%),
    radial-gradient(ellipse at 30% 70%, rgba(180, 0, 0, 0.04) 0%, transparent 50%);
  z-index: 0;
}

.scifi-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.15) 2px,
    rgba(0, 0, 0, 0.15) 4px
  );
  z-index: 1;
  pointer-events: none;
}

.scifi-content {
  position: relative;
  z-index: 2;
  text-align: center;
}

.scifi-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.scifi-header h1 {
  color: #ff1a1a;
  font-size: 2.2rem;
  letter-spacing: 0.3em;
  margin: 0;
  text-shadow:
    0 0 10px rgba(255, 0, 0, 0.8),
    0 0 40px rgba(255, 0, 0, 0.4),
    0 0 80px rgba(255, 0, 0, 0.2);
}

.scifi-line {
  width: 80px;
  height: 1px;
  background: linear-gradient(90deg, transparent, #ff1a1a, transparent);
}

.scifi-label {
  color: #cc3333;
  font-size: 0.85rem;
  letter-spacing: 0.2em;
  margin: 0 0 2rem;
}

.unlock-card {
  position: relative;
  background: rgba(20, 10, 10, 0.9);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 2px;
  padding: 2.5rem 2rem;
  min-width: 380px;
  box-shadow:
    0 0 20px rgba(255, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 0, 0, 0.05);
}

.card-glow {
  position: absolute;
  inset: -1px;
  border-radius: 2px;
  background: linear-gradient(135deg, rgba(255, 0, 0, 0.15), transparent 50%);
  pointer-events: none;
}

.scifi-footer {
  margin-top: 2rem;
  color: #661111;
  font-size: 0.75rem;
  letter-spacing: 0.15em;
}

.blink {
  color: #ff1a1a;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
</style>
