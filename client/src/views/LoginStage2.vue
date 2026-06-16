<!-- ===== cyberRed (赛博红) ===== -->
<script setup lang="ts">
import { useMnemonicAuth } from '../composables/useMnemonicAuth'
import MnemonicInput from '../components/MnemonicInput.vue'

const { auth, timeStr, handleUnlock } = useMnemonicAuth()
</script>

<template>
  <div class="scifi-page">
    <!-- 背景装饰层 -->
    <div class="bg-grid"></div>
    <div class="bg-scanlines"></div>
    <div class="bg-glow-top"></div>
    <div class="bg-glow-bottom"></div>
    <div class="bg-vignette"></div>

    <!-- 玻璃叠加层 -->
    <div class="glass-overlay glass-overlay-1"></div>
    <div class="glass-overlay glass-overlay-2"></div>

    <!-- 主内容 -->
    <div class="content">
      <!-- 顶部状态栏 -->
      <div class="top-bar">
        <span class="top-dot"></span>
        <span class="top-label">SYS.RED.2077</span>
        <span class="top-clock">{{ timeStr() }}</span>
        <span class="top-status">ONLINE</span>
      </div>

      <!-- 霓虹标题区 -->
      <div class="title-zone">
        <div class="title-glass-panel">
          <div class="title-glow-aura"></div>
          <h1 class="neon-title">
            <span class="neon-text" data-text="欢迎回来">欢迎回来</span>
            <span class="neon-reflection">欢迎回来</span>
          </h1>
          <div class="title-underline"></div>
          <p class="title-sub">STAGE 2 · IDENTITY VERIFICATION</p>
        </div>
      </div>

      <!-- 玻璃卡片 -->
      <div class="card-zone">
        <div class="glass-card">
          <!-- 装饰角标 -->
          <div class="card-corner corner-tl"></div>
          <div class="card-corner corner-tr"></div>
          <div class="card-corner corner-bl"></div>
          <div class="card-corner corner-br"></div>
          <!-- 卡片光条 -->
          <div class="card-light-streak"></div>
          <!-- 内容 -->
          <div class="card-inner">
            <MnemonicInput :error="auth.error" @submit="handleUnlock" />
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="bottom-bar">
        <span class="bar-line"></span>
        <span class="bar-text">SECURE CHANNEL ESTABLISHED</span>
        <span class="bar-line"></span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scifi-page {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background:
    linear-gradient(rgba(4,1,2,0.35), rgba(4,1,2,0.35)),
    url('/bg-cyber-city.png') center / cover no-repeat;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', 'SF Pro Display', 'Noto Sans SC', sans-serif;
}

/* ========== 背景层 ========== */
.bg-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,0,0,0.05) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,0,0,0.05) 1px, transparent 1px);
  background-size: clamp(24px, 3.5vw, 50px) clamp(24px, 3.5vw, 50px);
  z-index: 0;
}

.bg-scanlines {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0,0,0,0.15) 2px,
    rgba(0,0,0,0.15) 3px
  );
  z-index: 1;
  pointer-events: none;
}

.bg-glow-top {
  position: absolute; top: -15%; left: 30%; right: 30%;
  height: 40vh;
  background: radial-gradient(ellipse at center,
    rgba(255,20,50,0.08) 0%,
    transparent 70%
  );
  z-index: 0;
}

.bg-glow-bottom {
  position: absolute; bottom: -10%; left: 20%; right: 20%;
  height: 30vh;
  background: radial-gradient(ellipse at center,
    rgba(200,10,30,0.06) 0%,
    transparent 70%
  );
  z-index: 0;
}

.bg-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%);
  z-index: 2;
  pointer-events: none;
}

/* ========== 玻璃叠加层 ========== */
.glass-overlay {
  position: absolute;
  border-radius: 2px;
  pointer-events: none;
  z-index: 3;
}

.glass-overlay-1 {
  top: 10%; left: 8%; right: 8%; bottom: 45%;
  background: linear-gradient(
    135deg,
    rgba(255,30,40,0.02) 0%,
    rgba(255,20,30,0.005) 40%,
    rgba(255,30,40,0.015) 100%
  );
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
  border: 1px solid rgba(255,30,40,0.06);
}

.glass-overlay-2 {
  top: 55%; left: 4%; right: 4%; bottom: 8%;
  background: linear-gradient(
    180deg,
    rgba(255,10,30,0.015) 0%,
    rgba(200,5,20,0.01) 100%
  );
  backdrop-filter: blur(1px);
  -webkit-backdrop-filter: blur(1px);
}

/* ========== 主内容 ========== */
.content {
  position: relative; z-index: 4;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: clamp(6px, 1vh, 14px) clamp(10px, 2vw, 24px);
  box-sizing: border-box;
}

/* ========== 顶部状态栏 ========== */
.top-bar {
  display: flex;
  align-items: center;
  gap: clamp(6px, 1.2vw, 14px);
  flex-shrink: 0;
  padding: clamp(4px, 0.8vh, 10px) clamp(10px, 2vw, 20px);
  width: 100%;
  box-sizing: border-box;
  background: rgba(10,2,2,0.35);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255,30,40,0.12);
  border-radius: 3px;
}

.top-dot {
  width: clamp(5px, 0.5vmin, 7px);
  height: clamp(5px, 0.5vmin, 7px);
  background: #ff1a1a;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255,0,0,0.8), 0 0 14px rgba(255,0,0,0.4);
  animation: dot-pulse 2s infinite;
}

.top-label {
  color: #881111;
  font-size: clamp(0.6rem, 0.9vw, 0.8rem);
  letter-spacing: 0.15em;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
}

.top-clock {
  margin-left: auto;
  color: #bb3333;
  font-size: clamp(0.7rem, 1.1vw, 0.95rem);
  letter-spacing: 0.2em;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  text-shadow: 0 0 8px rgba(255,0,0,0.4);
}

.top-status {
  color: #44aa44;
  font-size: clamp(0.55rem, 0.8vw, 0.7rem);
  letter-spacing: 0.2em;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  text-shadow: 0 0 6px rgba(0,255,0,0.3);
}

/* ========== 标题区 ========== */
.title-zone {
  flex-shrink: 0;
  width: 100%;
  display: flex;
  justify-content: center;
  padding: clamp(10px, 2vh, 24px) 0;
}

.title-glass-panel {
  position: relative;
  text-align: center;
  padding: clamp(14px, 2.5vh, 28px) clamp(16px, 4vw, 48px);
  background: rgba(15,3,4,0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255,30,40,0.15);
  border-radius: 4px;
  box-shadow:
    0 0 30px rgba(255,0,0,0.04),
    inset 0 0 30px rgba(255,0,0,0.02);
}

.title-glow-aura {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 60%;
  background: radial-gradient(ellipse at center,
    rgba(255,20,40,0.1) 0%,
    transparent 70%
  );
  pointer-events: none;
  animation: aura-breathe 3s ease-in-out infinite;
}

@keyframes aura-breathe {
  0%,100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
}

/* 霓虹灯管标题 */
.neon-title {
  position: relative;
  margin: 0;
  line-height: 1.15;
}

.neon-text {
  display: block;
  color: #ffe0e0;
  font-size: clamp(2.4rem, 6vw, 5.5rem);
  font-weight: 900;
  letter-spacing: 0.15em;
  /* 霓虹灯管: 白色实心 + 彩色描边 */
  -webkit-text-stroke: clamp(1px, 0.2vw, 3px) #ff2244;
  paint-order: stroke fill;
  /* 多层辉光 */
  text-shadow:
    0 0 7px rgba(255,255,255,0.9),
    0 0 14px rgba(255,30,80,0.8),
    0 0 30px rgba(255,0,40,0.6),
    0 0 60px rgba(255,0,30,0.4),
    0 0 100px rgba(255,0,20,0.2),
    0 0 150px rgba(200,0,30,0.1);
  animation: neon-flicker 4s infinite;
}

/* 底部倒影 */
.neon-reflection {
  display: block;
  color: rgba(255,20,40,0.25);
  font-size: clamp(2.4rem, 6vw, 5.5rem);
  font-weight: 900;
  letter-spacing: 0.15em;
  transform: scaleY(-1) translateY(4px);
  opacity: 0.3;
  -webkit-mask: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  mask: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  text-shadow: none;
  pointer-events: none;
}

@keyframes neon-flicker {
  0%,19%,21%,23%,25%,54%,56%,100% { opacity: 1; }
  20%,24% { opacity: 0.85; }
  55% { opacity: 0.9; }
}

.title-underline {
  width: clamp(100px, 20vw, 240px);
  height: 1px;
  margin: clamp(6px, 1vh, 12px) auto;
  background: linear-gradient(90deg,
    transparent,
    rgba(255,40,40,0.2),
    rgba(255,40,40,0.6),
    rgba(255,40,40,0.2),
    transparent
  );
}

.title-sub {
  color: #991111;
  font-size: clamp(0.6rem, 1vw, 0.85rem);
  letter-spacing: 0.45em;
  margin: 0;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  text-shadow: 0 0 6px rgba(255,0,0,0.3);
}

/* ========== 卡片区 ========== */
.card-zone {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 0;
}

.glass-card {
  position: relative;
  width: min(90vw, 520px);
  background: rgba(18,4,5,0.5);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 2px solid rgba(255,30,40,0.25);
  border-radius: 4px;
  box-shadow:
    0 0 20px rgba(255,0,0,0.06),
    0 0 40px rgba(255,0,0,0.03),
    inset 0 0 40px rgba(255,0,0,0.02);
}

/* 装饰角标 */
.card-corner {
  position: absolute;
  width: clamp(16px, 2.5vw, 28px);
  height: clamp(16px, 2.5vw, 28px);
  pointer-events: none;
  z-index: 1;
}

.corner-tl { top: -1px; left: -1px;
  border-top: 2px solid rgba(255,40,40,0.7);
  border-left: 2px solid rgba(255,40,40,0.7);
}

.corner-tr { top: -1px; right: -1px;
  border-top: 2px solid rgba(255,40,40,0.7);
  border-right: 2px solid rgba(255,40,40,0.7);
}

.corner-bl { bottom: -1px; left: -1px;
  border-bottom: 2px solid rgba(255,40,40,0.7);
  border-left: 2px solid rgba(255,40,40,0.7);
}

.corner-br { bottom: -1px; right: -1px;
  border-bottom: 2px solid rgba(255,40,40,0.7);
  border-right: 2px solid rgba(255,40,40,0.7);
}

/* 玻璃光条 */
.card-light-streak {
  position: absolute;
  top: 0; left: 15%;
  width: 40%;
  height: 100%;
  background: linear-gradient(180deg,
    rgba(255,255,255,0.03) 0%,
    rgba(255,255,255,0.01) 40%,
    transparent 60%
  );
  pointer-events: none;
  z-index: 0;
}

.card-inner {
  position: relative;
  z-index: 1;
  padding: clamp(16px, 2.5vh, 28px) clamp(14px, 2.5vw, 24px);
}

/* ========== 底部 ========== */
.bottom-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 16px);
  padding: clamp(6px, 1vh, 12px) 0;
}

.bar-line {
  width: clamp(30px, 6vw, 80px);
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,40,40,0.3), transparent);
}

.bar-text {
  color: #550000;
  font-size: clamp(0.55rem, 0.8vw, 0.7rem);
  letter-spacing: 0.25em;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  text-shadow: 0 0 4px rgba(255,0,0,0.2);
}

@keyframes dot-pulse {
  0%,100% { opacity: 1; }
  50% { opacity: 0.3; }
}
</style>
