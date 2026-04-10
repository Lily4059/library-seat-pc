<template>
  <div class="m-page">
    <header class="m-appbar">
      <button class="m-icon-btn" type="button" @click="goBack">返回</button>
      <div class="m-appbar__title">选座预约</div>
      <div class="m-appbar__spacer" />
    </header>

    <main class="m-content">
      <div class="seat-select-container">
        <el-card>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="座位号">{{ seatInfo.seatNo }}</el-descriptions-item>
            <el-descriptions-item label="区域">{{ seatInfo.area || 'A区' }}</el-descriptions-item>
            <el-descriptions-item label="类型">{{ seatTypeMap[seatInfo.type] }}</el-descriptions-item>
          </el-descriptions>

          <el-form label-width="100px" style="margin-top: 20px;">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="startTime"
                type="datetime"
                placeholder="选择开始时间"
                :disabled-date="disabledStartDate"
                @change="handleStartChange"
              />
            </el-form-item>
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="endTime"
                type="datetime"
                placeholder="选择结束时间"
                :disabled-date="disabledEndDate"
              />
            </el-form-item>
            <el-form-item>
              <div v-if="timeError" class="m-error">{{ timeError }}</div>
            </el-form-item>
            <el-form-item label="预计积分变动">
              <span>+5 积分（按时签到）</span>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="nextStep" :disabled="!isTimeValid">下一步</el-button>
              <el-button @click="goBack">返回</el-button>
            </el-form-item>
          </el-form>

          <div class="m-hint">
            <div class="m-hint__title">预约规则</div>
            <div class="m-hint__text">开始时间需晚于当前时间；结束时间需晚于开始时间；预约时长应至少大于等于 30 分钟；同一时间段不可与已有预约冲突；每天 22:00-次日 08:00 为闭馆时间。</div>
          </div>

          <div v-if="activeReservations.length > 0" class="m-hint">
            <div class="m-hint__title">我已有预约</div>
            <div class="m-res-list">
              <div v-for="r in activeReservations" :key="r.id" class="m-res-item">
                <div class="m-res-item__main">
                  <div class="m-res-item__seat">{{ r.seatNo }}</div>
                  <div class="m-res-item__time">{{ formatTimeRange(r.startTime, r.endTime) }}</div>
                </div>
                <div class="m-res-item__status">{{ statusMap[r.status] || r.status }}</div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const route = useRoute()

// 从路由参数接收座位信息
const seatInfo = ref({
  id: route.query.id,
  seatNo: route.query.seatNo,
  type: route.query.type || 'silent'
})

const seatTypeMap = {
  silent: '静音区',
  discussion: '讨论区',
  window: '靠窗',
  power: '带电源'
}

const startTime = ref(null)
const endTime = ref(null)
const myReservations = ref([])

const getMinuteOfDay = (d) => d.getHours() * 60 + d.getMinutes()
const isSameDay = (a, b) => a.toDateString() === b.toDateString()
const isInOpenHours = (d) => {
  const m = getMinuteOfDay(d)
  return m >= 8 * 60 && m <= 22 * 60
}
const isStartInOpenHours = (d) => {
  const m = getMinuteOfDay(d)
  return m >= 8 * 60 && m < 22 * 60
}

// 禁用开始时间：不能早于当前时间
const disabledStartDate = (time) => {
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  return time.getTime() < startOfToday.getTime()
}

// 结束时间不能早于开始时间
const disabledEndDate = (time) => {
  if (!startTime.value) return false
  const start = new Date(startTime.value)
  if (Number.isNaN(start.getTime())) return false
  const startDay = new Date(start)
  startDay.setHours(0, 0, 0, 0)
  const candidateDay = new Date(time)
  candidateDay.setHours(0, 0, 0, 0)
  return candidateDay.getTime() !== startDay.getTime()
}

const handleStartChange = () => {
  if (!endTime.value || !startTime.value) return
  const start = new Date(startTime.value)
  const end = new Date(endTime.value)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    endTime.value = null
    return
  }
  if (!isSameDay(start, end)) {
    endTime.value = null
    return
  }
  if (end.getTime() <= start.getTime()) endTime.value = null
}

const isTimeValid = computed(() => {
  if (!startTime.value || !endTime.value) return false
  if (!(startTime.value instanceof Date) || !(endTime.value instanceof Date)) return false
  const startMs = startTime.value.getTime()
  const endMs = endTime.value.getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return false
  if (endMs <= startMs) return false
  if (startMs < Date.now() + 60 * 1000) return false
  if (!isSameDay(startTime.value, endTime.value)) return false
  if (!isStartInOpenHours(startTime.value)) return false
  if (!isInOpenHours(endTime.value)) return false
  const diffMin = Math.round((endMs - startMs) / 60000)
  if (diffMin < 30) return false
  if (hasConflict(startMs, endMs)) return false
  return true
})

const statusMap = {
  pending: '待签到',
  checked_in: '已签到',
  completed: '已完成',
  cancelled: '已取消',
  expired: '已过期'
}

const pad2 = (n) => `${n}`.padStart(2, '0')
const formatTime = (iso) => {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return `${pad2(date.getMonth() + 1)}-${pad2(date.getDate())} ${pad2(date.getHours())}:${pad2(date.getMinutes())}`
}
const formatTimeRange = (startIso, endIso) => {
  const start = formatTime(startIso)
  const end = formatTime(endIso)
  return start && end ? `${start} - ${end}` : start || end || ''
}

const isActiveStatus = (status) => status === 'pending' || status === 'checked_in'
const activeReservations = computed(() => (Array.isArray(myReservations.value) ? myReservations.value : []).filter(r => isActiveStatus(r.status)))

const isOverlap = (aStart, aEnd, bStart, bEnd) => aStart < bEnd && bStart < aEnd
const hasConflict = (startMs, endMs) => {
  const list = Array.isArray(activeReservations.value) ? activeReservations.value : []
  return list.some(r => {
    const rStart = new Date(r.startTime).getTime()
    const rEnd = new Date(r.endTime).getTime()
    if (Number.isNaN(rStart) || Number.isNaN(rEnd)) return false
    return isOverlap(startMs, endMs, rStart, rEnd)
  })
}

const findConflict = (startMs, endMs) => {
  const list = Array.isArray(activeReservations.value) ? activeReservations.value : []
  return list.find(r => {
    const rStart = new Date(r.startTime).getTime()
    const rEnd = new Date(r.endTime).getTime()
    if (Number.isNaN(rStart) || Number.isNaN(rEnd)) return false
    return isOverlap(startMs, endMs, rStart, rEnd)
  }) || null
}

const timeError = computed(() => {
  if (!startTime.value || !endTime.value) return ''
  if (!(startTime.value instanceof Date) || !(endTime.value instanceof Date)) return '时间格式不正确'
  const startMs = startTime.value.getTime()
  const endMs = endTime.value.getTime()
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return '时间格式不正确'
  if (startMs < Date.now() + 60 * 1000) return '开始时间需晚于当前时间'
  if (!isSameDay(startTime.value, endTime.value)) return '结束日期需与开始日期相同（闭馆时间为 22:00-次日 08:00）'
  if (!isStartInOpenHours(startTime.value)) return '开始时间不在开馆时间内（08:00-22:00）'
  if (!isInOpenHours(endTime.value)) return '结束时间不在开馆时间内（08:00-22:00）'
  if (endMs <= startMs) return '结束时间需晚于开始时间'
  const diffMin = Math.round((endMs - startMs) / 60000)
  if (diffMin < 30) return '预约时长需至少 30 分钟'
  const conflict = findConflict(startMs, endMs)
  if (conflict) return `时间冲突：你已有 ${conflict.seatNo} 的预约`
  return ''
})

const nextStep = () => {
  if (!seatInfo.value.id || !seatInfo.value.seatNo) {
    ElMessage.warning('座位信息缺失，请从首页重新选择座位')
    router.replace('/home')
    return
  }
  if (!isTimeValid.value) {
    if (timeError.value) ElMessage.warning(timeError.value)
    else ElMessage.warning('请选择有效的时间段')
    return
  }
  // 跳转到确认页，传递参数
  router.push({
    path: '/confirm',
    query: {
      seatId: seatInfo.value.id,
      seatNo: seatInfo.value.seatNo,
      seatType: seatInfo.value.type,
      startTime: startTime.value.toISOString(),
      endTime: endTime.value.toISOString()
    }
  })
}

const goBack = () => {
  router.back()
}

onMounted(() => {
  if (!seatInfo.value.id || !seatInfo.value.seatNo) {
    ElMessage.warning('请先在首页选择座位')
    router.replace('/home')
    return
  }
  request
    .get('/reservations/my')
    .then((res) => {
      if (res.data?.code === 200) {
        myReservations.value = Array.isArray(res.data.data) ? res.data.data : []
      }
    })
    .catch(() => {})
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

.seat-select-container {
  padding: 0;
}

.m-hint {
  margin-top: 14px;
  padding: 12px;
  border-radius: 14px;
  background: #f9fafb;
}

.m-hint__title {
  font-size: 14px;
  font-weight: 900;
  color: #111827;
}

.m-hint__text {
  margin-top: 6px;
  font-size: 12px;
  color: #6b7280;
  line-height: 1.6;
}

.m-res-list {
  margin-top: 10px;
  display: grid;
  gap: 10px;
}

.m-res-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.m-res-item__main {
  min-width: 0;
  display: grid;
  gap: 4px;
}

.m-res-item__seat {
  font-size: 13px;
  font-weight: 900;
  color: #111827;
}

.m-res-item__time {
  font-size: 12px;
  color: #6b7280;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.m-res-item__status {
  font-size: 12px;
  font-weight: 900;
  color: #374151;
  background: #f3f4f6;
  border-radius: 999px;
  padding: 4px 10px;
}

.m-error {
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  background: #fef2f2;
  border: 1px solid rgba(239, 68, 68, 0.25);
  color: #991b1b;
  font-size: 12px;
  font-weight: 800;
  line-height: 1.6;
}
</style>
