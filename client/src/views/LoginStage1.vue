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
  <div class="library-login">
    <div class="library-background">
      <div class="bookshelf left"></div>
      <div class="bookshelf right"></div>
      <div class="center-piece">
        <div class="library-title">
          <h1>MAIN LJ</h1>
          <p class="subtitle">智能知识中枢</p>
        </div>
        <div class="login-card">
          <div class="card-header">
            <span class="card-icon">📚</span>
            <h2>系统登录</h2>
          </div>
          <LoginForm :error="auth.error" @submit="handleLogin" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.library-login {
  width: 100vw;
  height: 100vh;
  background: #2c1810;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Georgia', 'Noto Serif SC', serif;
  overflow: hidden;
}

.library-background {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background:
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(139, 90, 43, 0.03) 2px,
      rgba(139, 90, 43, 0.03) 4px
    );
}

.bookshelf {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 18%;
  background: linear-gradient(180deg, #3d2214 0%, #4a2c1a 50%, #3d2214 100%);
}

.bookshelf::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 28px,
      #2c1810 28px,
      #2c1810 32px
    );
}

.bookshelf.left {
  left: 0;
  border-right: 3px solid #8b5a2b;
  box-shadow: inset -10px 0 20px rgba(0, 0, 0, 0.5);
}

.bookshelf.right {
  right: 0;
  border-left: 3px solid #8b5a2b;
  box-shadow: inset 10px 0 20px rgba(0, 0, 0, 0.5);
}

.center-piece {
  position: relative;
  z-index: 1;
  text-align: center;
}

.library-title h1 {
  font-size: 3rem;
  color: #d4a574;
  letter-spacing: 0.15em;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.library-title .subtitle {
  color: #a0856b;
  font-size: 1rem;
  margin: 0.5rem 0 2rem;
  letter-spacing: 0.3em;
}

.login-card {
  background: linear-gradient(135deg, #f5e6d3 0%, #ede0cc 100%);
  border-radius: 4px;
  padding: 2.5rem 2rem;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border: 1px solid #c4a882;
  min-width: 340px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.card-icon {
  font-size: 1.5rem;
}

.card-header h2 {
  margin: 0;
  color: #4a2c1a;
  font-size: 1.3rem;
  font-weight: normal;
  letter-spacing: 0.1em;
}
</style>
