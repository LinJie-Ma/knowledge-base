<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import AppCard from '../components/AppCard.vue'

const router = useRouter()
const auth = useAuthStore()

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
    url: '/sugar-futures',
  },
]

async function handleLogout() {
  await auth.logout()
  router.push('/login')
}
</script>

<template>
  <div class="dashboard">
    <header class="dash-header">
      <div class="header-left">
        <h1>MAIN LJ</h1>
        <span class="header-divider">|</span>
        <span class="header-welcome">欢迎, {{ auth.username }}</span>
      </div>
      <button class="btn-logout" @click="handleLogout">退出登录</button>
    </header>

    <main class="dash-main">
      <h2 class="section-title">系统集合</h2>
      <p class="section-desc">选择一个子系统开始工作</p>

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
      <span>MAIN LJ · 个人知识中枢</span>
    </footer>
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #0f1117;
  color: #c9d1d9;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans SC', sans-serif;
  display: flex;
  flex-direction: column;
}

.dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #161b22;
  border-bottom: 1px solid #30363d;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  margin: 0;
  font-size: 1.2rem;
  color: #58a6ff;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.header-divider {
  color: #30363d;
  font-weight: 200;
}

.header-welcome {
  color: #8b949e;
  font-size: 0.9rem;
}

.btn-logout {
  padding: 0.4rem 1rem;
  background: #21262d;
  color: #c9d1d9;
  border: 1px solid #30363d;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout:hover {
  background: #30363d;
  border-color: #484f58;
}

.dash-main {
  flex: 1;
  padding: 3rem 2rem;
  max-width: 1000px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
}

.section-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: #e6edf3;
}

.section-desc {
  margin: 0.5rem 0 2rem;
  color: #8b949e;
  font-size: 0.9rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  color: #484f58;
}

.dash-footer {
  padding: 1rem 2rem;
  text-align: center;
  border-top: 1px solid #21262d;
  color: #484f58;
  font-size: 0.8rem;
}
</style>
