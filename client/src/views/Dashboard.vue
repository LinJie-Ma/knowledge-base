<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppCard from '../components/AppCard.vue'

const router = useRouter()
const auth = useAuthStore()

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)
const loggingOut = ref(false)

function onDocumentClick(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    menuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onDocumentClick))
onUnmounted(() => document.removeEventListener('click', onDocumentClick))

const apps = [
  {
    id: 'info-collection',
    name: '信息收集',
    description: '自动化信息采集与聚合系统，支持多渠道数据源接入',
    icon: '📊',
    url: '/info-collection',
  },
  {
    id: 'sugar-futures',
    name: '白糖期货',
    description: '白糖期货数据追踪、分析与交易辅助系统',
    icon: '📈',
    url: '/SR',
  },
]

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

async function handleLogout() {
  if (loggingOut.value) return
  loggingOut.value = true
  await auth.logout()
  router.replace('/login')
}
</script>

<template>
  <div class="dashboard">
    <div class="scifi-scanlines"></div>
    <div class="scifi-overlay"></div>

    <header class="dash-header">
      <div class="header-left">
        <div class="header-line"></div>
        <h1>MAIN LJ</h1>
        <div class="header-line"></div>
      </div>
      <div class="header-right">
        <div class="user-menu" ref="menuRef">
          <button class="user-trigger" @click="toggleMenu">
            <span class="user-avatar">▣</span>
            <span class="user-name">{{ auth.username }}</span>
            <span class="user-arrow" :class="{ open: menuOpen }">▼</span>
          </button>
          <div v-show="menuOpen" class="menu-dropdown">
            <div class="menu-info">
              <span class="menu-label">STAGE 2</span>
              <span class="menu-username">{{ auth.username }}</span>
            </div>
            <div class="menu-divider"></div>
            <button class="menu-item logout" :disabled="loggingOut" @click.stop="handleLogout">
              <span class="menu-icon">{{ loggingOut ? '⟳' : '⏻' }}</span>
              <span>{{ loggingOut ? '退出中...' : '退出登录' }}</span>
            </button>
          </div>
        </div>
      </div>
    </header>

    <main class="dash-main">
      <div class="section-header">
        <h2 class="section-title">系统集合</h2>
        <div class="title-underline"></div>
        <p class="section-desc">[ 选择一个子系统开始工作 ]</p>
      </div>

      <div class="card-grid">
        <AppCard
          v-for="app in apps"
          :key="app.id"
          :icon="app.icon"
          :title="app.name"
          :description="app.description"
          :url="app.url"
        />
      </div>

      <div v-if="apps.length === 0" class="empty-state">
        <p>暂无可用子系统</p>
      </div>
    </main>

    <footer class="dash-footer">
      <div class="footer-line"></div>
      <span class="footer-text">MAIN LJ · 个人知识中枢</span>
      <button class="btn-logout" :disabled="loggingOut" @click="handleLogout">
        {{ loggingOut ? '⟳ 退出中...' : '▸ 退出登录' }}
      </button>
    </footer>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #0a0a0a;
  color: #cc3333;
  font-family: 'Courier New', 'Noto Sans SC', monospace;
  display: flex;
  flex-direction: column;
  position: relative;
}

.scifi-overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 50% 20%, rgba(255, 0, 0, 0.04) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 80%, rgba(180, 0, 0, 0.03) 0%, transparent 50%);
  pointer-events: none;
  z-index: 0;
}

.scifi-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.1) 2px,
    rgba(0, 0, 0, 0.1) 4px
  );
  pointer-events: none;
  z-index: 1;
}

.dash-header {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.2rem 2rem;
  border-bottom: 1px solid rgba(255, 0, 0, 0.2);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.3rem;
  color: #ff1a1a;
  font-weight: normal;
  letter-spacing: 0.3em;
  text-shadow:
    0 0 10px rgba(255, 0, 0, 0.6),
    0 0 30px rgba(255, 0, 0, 0.3);
}

.header-line {
  width: 50px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.4));
}

.header-left .header-line:last-child {
  background: linear-gradient(90deg, rgba(255, 0, 0, 0.4), transparent);
}

.header-right {
  position: relative;
}

.user-menu {
  position: relative;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  background: rgba(255, 0, 0, 0.06);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 3px;
  color: #cc5555;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  transition: all 0.25s;
}

.user-trigger:hover {
  background: rgba(255, 0, 0, 0.12);
  border-color: rgba(255, 0, 0, 0.4);
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.08);
}

.user-avatar {
  font-size: 0.9rem;
  color: #ff1a1a;
}

.user-arrow {
  font-size: 0.55rem;
  transition: transform 0.2s;
  color: #994444;
}

.user-arrow.open {
  transform: rotate(180deg);
}

.menu-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 200px;
  background: #111111;
  border: 1px solid rgba(255, 0, 0, 0.25);
  border-radius: 3px;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.5),
    0 0 15px rgba(255, 0, 0, 0.06);
  z-index: 100;
  overflow: hidden;
}

.menu-info {
  padding: 0.8rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.menu-label {
  font-size: 0.6rem;
  color: #661111;
  letter-spacing: 0.15em;
}

.menu-username {
  font-size: 0.85rem;
  color: #cc5555;
  letter-spacing: 0.05em;
}

.menu-divider {
  height: 1px;
  background: rgba(255, 0, 0, 0.12);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  width: 100%;
  padding: 0.65rem 1rem;
  background: none;
  border: none;
  color: #cc3333;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  font-size: 0.8rem;
  letter-spacing: 0.08em;
  transition: background 0.2s;
}

.menu-item:hover:not(:disabled) {
  background: rgba(255, 0, 0, 0.08);
}

.menu-item:disabled {
  opacity: 0.5;
  cursor: default;
}

.menu-icon {
  font-size: 0.85rem;
}

.dash-main {
  position: relative;
  z-index: 2;
  flex: 1;
  padding: 3rem 2rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.section-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  color: #ff1a1a;
  font-weight: normal;
  letter-spacing: 0.25em;
  text-shadow:
    0 0 8px rgba(255, 0, 0, 0.5),
    0 0 20px rgba(255, 0, 0, 0.2);
}

.title-underline {
  width: 120px;
  height: 1px;
  margin: 0.8rem auto;
  background: linear-gradient(90deg, transparent, rgba(255, 0, 0, 0.5), transparent);
}

.section-desc {
  margin: 0;
  color: #994444;
  font-size: 0.8rem;
  letter-spacing: 0.15em;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #661111;
  font-size: 0.85rem;
}

.dash-footer {
  position: relative;
  z-index: 2;
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  border-top: 1px solid rgba(255, 0, 0, 0.15);
}

.footer-line {
  display: none;
}

.footer-text {
  color: #661111;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
}

.btn-logout {
  padding: 0.35rem 1rem;
  background: rgba(255, 0, 0, 0.08);
  color: #cc3333;
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 2px;
  font-size: 0.8rem;
  cursor: pointer;
  letter-spacing: 0.1em;
  font-family: 'Courier New', monospace;
  transition: all 0.25s;
}

.btn-logout:hover:not(:disabled) {
  background: rgba(255, 0, 0, 0.18);
  border-color: rgba(255, 0, 0, 0.6);
  box-shadow: 0 0 12px rgba(255, 0, 0, 0.1);
}

.btn-logout:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
