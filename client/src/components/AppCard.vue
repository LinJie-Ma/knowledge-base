<script setup lang="ts">
defineProps<{
  icon: string
  title: string
  description: string
  url: string
}>()
</script>

<template>
  <a :href="url" class="app-card">
    <div class="card-glow"></div>
    <div class="card-icon">{{ icon }}</div>
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-desc">{{ description }}</p>
    <span class="card-link">▸ 进入系统</span>
  </a>
</template>

<style scoped>
.app-card {
  position: relative;
  display: block;
  padding: 1.5rem;
  background: rgba(20, 10, 10, 0.85);
  border: 1px solid rgba(255, 0, 0, 0.2);
  border-radius: 2px;
  text-decoration: none;
  transition: all 0.3s;
  cursor: pointer;
  overflow: hidden;
}

.card-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 0, 0, 0.05), transparent 60%);
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.app-card:hover {
  border-color: rgba(255, 0, 0, 0.5);
  box-shadow:
    0 0 20px rgba(255, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 0, 0, 0.05);
  transform: translateY(-2px);
}

.app-card:hover .card-glow {
  opacity: 1;
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
  position: relative;
  z-index: 1;
}

.card-title {
  margin: 0 0 0.5rem;
  color: #ff3333;
  font-size: 1rem;
  font-weight: normal;
  letter-spacing: 0.1em;
  position: relative;
  z-index: 1;
}

.card-desc {
  margin: 0 0 1rem;
  color: #884444;
  font-size: 0.8rem;
  line-height: 1.5;
  position: relative;
  z-index: 1;
}

.card-link {
  color: #cc3333;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  opacity: 0.6;
  transition: opacity 0.3s;
  position: relative;
  z-index: 1;
}

.app-card:hover .card-link {
  opacity: 1;
}
</style>
