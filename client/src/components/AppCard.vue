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
    <div class="card-icon">{{ icon }}</div>
    <h3 class="card-title">{{ title }}</h3>
    <p class="card-desc">{{ description }}</p>
    <span class="card-link">进入系统 →</span>
  </a>
</template>

<style scoped>
.app-card {
  display: block;
  padding: 1.5rem;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.25s;
  cursor: pointer;
}

.app-card:hover {
  border-color: #58a6ff;
  box-shadow: 0 0 12px rgba(88, 166, 255, 0.1);
  transform: translateY(-2px);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 0.8rem;
}

.card-title {
  margin: 0 0 0.5rem;
  color: #58a6ff;
  font-size: 1.1rem;
  font-weight: 600;
}

.card-desc {
  margin: 0 0 1rem;
  color: #8b949e;
  font-size: 0.85rem;
  line-height: 1.5;
}

.card-link {
  color: #58a6ff;
  font-size: 0.8rem;
  opacity: 0.7;
  transition: opacity 0.2s;
}

.app-card:hover .card-link {
  opacity: 1;
}
</style>
