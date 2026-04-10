<template>
  <div class="m-page">
    <header class="m-appbar">
      <button class="m-icon-btn" type="button" @click="goBack">返回</button>
      <div class="m-appbar__title">积分明细</div>
      <div class="m-appbar__spacer" />
    </header>

    <main class="m-content">
      <div class="m-card">
        <el-empty description="开发中，敬请期待" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<style scoped>
.m-page {
  min-height: 100svh;
  background: #f6f7fb;
}

.m-appbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: 90px 1fr 90px;
  align-items: center;
  padding: 12px 14px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.m-appbar__title {
  font-size: 18px;
  font-weight: 800;
  color: #111827;
  text-align: center;
}

.m-appbar__spacer {
  width: 100%;
  height: 1px;
}

.m-icon-btn {
  justify-self: start;
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 14px;
  padding: 8px 10px;
  border-radius: 10px;
}

.m-content {
  padding: 14px;
}

.m-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.06);
  padding: 14px;
}
</style>
