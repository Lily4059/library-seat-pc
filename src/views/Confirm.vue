<template>
  <div class="m-page">
    <header class="m-appbar">
      <button class="m-icon-btn" type="button" @click="goBack">返回</button>
      <div class="m-appbar__title">确认预约</div>
      <div class="m-appbar__spacer" />
    </header>

    <main class="m-content">
      <div class="confirm-container">
        <el-card>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="座位号">{{ seatNo }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ seatTypeMap[seatType] }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ formatTime(startTime) }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{ formatTime(endTime) }}</el-descriptions-item>
            <el-descriptions-item label="预计积分变动">
              <span>+5 积分（按时签到）</span>
            </el-descriptions-item>
          </el-descriptions>

          <div style="margin-top: 20px; text-align: center;">
            <el-button type="primary" @click="confirmReservation" :loading="loading">确认预约</el-button>
            <el-button @click="goBack">返回修改</el-button>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const route = useRoute()

const seatId = route.query.seatId
const seatNo = route.query.seatNo
const seatType = route.query.seatType
const startTime = route.query.startTime
const endTime = route.query.endTime

const seatTypeMap = {
  silent: '静音区',
  discussion: '讨论区',
  window: '靠窗',
  power: '带电源'
}

const loading = ref(false)

const formatTime = (iso) => {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleString()
}

const parsedSeatId = computed(() => {
  const n = Number.parseInt(String(seatId), 10)
  return Number.isFinite(n) ? n : null
})

const validationError = computed(() => {
  if (!seatNo || !seatType || !startTime || !endTime) return '参数缺失，请返回重新选择'
  if (!parsedSeatId.value) return '座位参数非法，请返回重新选择'
  const startMs = new Date(String(startTime)).getTime()
  const endMs = new Date(String(endTime)).getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return '时间参数非法，请返回重新选择'
  if (endMs <= startMs) return '时间段不合法，请返回重新选择'
  if (startMs < Date.now() + 60 * 1000) return '开始时间需晚于当前时间，请返回重新选择'
  const diffMin = Math.round((endMs - startMs) / 60000)
  if (diffMin < 30) return '预约时长需至少 30 分钟，请返回重新选择'

  const startDate = new Date(startMs)
  const endDate = new Date(endMs)
  if (startDate.toDateString() !== endDate.toDateString()) return '闭馆时间为 22:00-次日 08:00，预约不可跨越闭馆时间，请返回重新选择'
  const startMin = startDate.getHours() * 60 + startDate.getMinutes()
  const endMin = endDate.getHours() * 60 + endDate.getMinutes()
  if (startMin < 8 * 60 || startMin >= 22 * 60) return '开始时间不在开馆时间内（08:00-22:00），请返回重新选择'
  if (endMin < 8 * 60 || endMin > 22 * 60) return '结束时间不在开馆时间内（08:00-22:00），请返回重新选择'
  return ''
})

const isOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd

const checkConflict = async () => {
  const startMs = new Date(String(startTime)).getTime()
  const endMs = new Date(String(endTime)).getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return null
  try {
    const res = await request.get('/reservations/my')
    if (res.data?.code !== 200) return null
    const list = Array.isArray(res.data.data) ? res.data.data : []
    const active = list.filter(r => r.status === 'pending' || r.status === 'checked_in')
    const conflict = active.find(r => {
      const rStart = new Date(r.startTime).getTime()
      const rEnd = new Date(r.endTime).getTime()
      if (Number.isNaN(rStart) || Number.isNaN(rEnd)) return false
      return isOverlap(startMs, endMs, rStart, rEnd)
    })
    return conflict || null
  } catch (e) {
    return null
  }
}

const confirmReservation = async () => {
  if (validationError.value) {
    ElMessage.warning(validationError.value)
    router.replace('/home')
    return
  }

  const conflict = await checkConflict()
  if (conflict) {
    ElMessage.warning(`时间冲突：你已有 ${conflict.seatNo} 的预约（${formatTime(conflict.startTime)} - ${formatTime(conflict.endTime)}）`)
    router.replace('/seat-select')
    return
  }
  try {
    await ElMessageBox.confirm('确定要预约该座位吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    loading.value = true
    const res = await request.post('/reservations', {
      seatId: parsedSeatId.value,
      seatNo,
      seatType,
      startTime,
      endTime
    })
    if (res.data.code === 200) {
      ElMessage.success('预约成功')
      // 跳转到我的预约页面
      router.push('/my-reservations')
    } else {
      ElMessage.error(res.data.message || '预约失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('网络错误，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  if (validationError.value) {
    ElMessage.warning(validationError.value)
    router.replace('/home')
  }
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

.confirm-container {
  padding: 0;
}
</style>
