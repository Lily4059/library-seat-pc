<template>
  <div class="m-page">
    <header class="m-appbar">
      <button class="m-icon-btn" type="button" @click="goBack">返回</button>
      <div class="m-appbar__title">个人中心</div>
      <div class="m-appbar__spacer" />
    </header>

    <main class="m-content">
      <div class="profile-container">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card>
          <div class="user-info">
            <el-avatar :size="80" :src="userInfo.avatar || ''" />
            <h3>{{ userInfo.name }}</h3>
            <p>学号：{{ userInfo.studentNo }}</p>
            <p>手机：{{ userInfo.phone }}</p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="16">
        <el-card>
          <div class="stats">
            <div class="stat-item">
              <div class="stat-value">{{ userInfo.creditScore }}</div>
              <div class="stat-label">信用积分</div>
            </div>
            <div class="stat-item">
              <div class="stat-value">{{ userInfo.totalStudyTime }}</div>
              <div class="stat-label">学习时长(分钟)</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card style="margin-top: 20px;">
      <el-menu mode="horizontal" :default-active="activeMenu" @select="handleMenuSelect">
        <el-menu-item index="myReservations">我的预约</el-menu-item>
        <el-menu-item index="history">历史记录</el-menu-item>
        <el-menu-item index="creditLog">积分明细</el-menu-item>
        <el-menu-item index="notifications">消息通知</el-menu-item>
      </el-menu>
      <div class="default-tip" v-if="showDefaultTip">点击上方菜单查看更多内容</div>
    </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const route = useRoute()

const userInfo = ref({
  name: '',
  studentNo: '',
  creditScore: 0,
  totalStudyTime: 0,
  avatar: '',
  phone: ''
})

const activeMenu = ref('myReservations')
const showDefaultTip = computed(() => route.path === '/profile')

const fetchUserProfile = async () => {
  try {
    const res = await axios.get('/api/user/profile')
    if (res.data.code === 200) {
      userInfo.value = res.data.data
    } else {
      ElMessage.error('获取用户信息失败')
    }
  } catch (error) {
    ElMessage.error('网络错误')
  }
}

const handleMenuSelect = (index) => {
  if (index === 'myReservations') {
    router.push('/my-reservations')
  } else if (index === 'history') {
    router.push('/history')
  } else if (index === 'creditLog') {
    router.push('/credit-log')
  } else if (index === 'notifications') {
    router.push('/notifications')
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  fetchUserProfile()
  if (route.path === '/my-reservations') activeMenu.value = 'myReservations'
  else if (route.path === '/history') activeMenu.value = 'history'
  else if (route.path === '/credit-log') activeMenu.value = 'creditLog'
})
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

.profile-container {
  padding: 0;
}
.user-info {
  text-align: center;
}
.stats {
  display: flex;
  justify-content: space-around;
}
.stat-item {
  text-align: center;
}
.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
}
.stat-label {
  font-size: 14px;
  color: #909399;
}
.default-tip {
  margin-top: 20px;
  text-align: center;
  color: #909399;
}
</style>
