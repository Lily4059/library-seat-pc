<template>
  <div class="m-page">
    <header class="m-appbar">
      <div class="m-appbar__title">座位</div>
      <button class="m-icon-btn" type="button" @click="goToProfile">个人中心</button>
    </header>

    <main class="m-content">
      <section class="m-section">
        <div class="m-seg">
          <button
            class="m-seg__btn"
            :class="{ 'is-active': activeFloor === '1F' }"
            type="button"
            @click="setFloor('1F')"
          >
            1楼
          </button>
          <button
            class="m-seg__btn"
            :class="{ 'is-active': activeFloor === '2F' }"
            type="button"
            @click="setFloor('2F')"
          >
            2楼
          </button>
        </div>
      </section>

      <section class="m-section">
        <div class="m-card m-card--press" role="button" tabindex="0" @click="goToCurrentSeat">
          <div class="m-card__hd">
            <div class="m-card__title">当前座位</div>
            <div class="m-card__meta">
              <span v-if="currentReservation" class="m-pill" :class="reservationStatusClass(currentReservation.status)">
                {{ reservationStatusMap[currentReservation.status] }}
              </span>
              <span v-else class="m-pill is-muted">暂无</span>
            </div>
          </div>

          <div v-if="currentReservation" class="m-card__bd">
            <div class="m-kv">
              <div class="m-kv__k">座位</div>
              <div class="m-kv__v">{{ currentReservation.seatNo }}</div>
            </div>
            <div class="m-kv">
              <div class="m-kv__k">类型</div>
              <div class="m-kv__v">{{ seatTypeMap[currentReservation.seatType] }}</div>
            </div>
            <div class="m-kv">
              <div class="m-kv__k">时间</div>
              <div class="m-kv__v">{{ formatTimeRange(currentReservation.startTime, currentReservation.endTime) }}</div>
            </div>
          </div>
          <div v-else class="m-card__bd">
            <div class="m-muted">还没有当前预约，去挑一个喜欢的位置吧。</div>
          </div>

          <div class="m-card__ft">
            <button class="m-btn m-btn--ghost" type="button" @click.stop="goToCurrentSeat">查看详情</button>
            <button
              v-if="currentReservation && currentReservation.status === 'pending'"
              class="m-btn m-btn--primary"
              type="button"
              @click.stop="goToCheckIn"
            >
              去签到
            </button>
            <button v-else class="m-btn m-btn--primary" type="button" @click.stop="goToMyReservations">我的预约</button>
          </div>
        </div>
      </section>

      <section class="m-section">
        <div class="m-legend">
          <span class="m-legend__item"><i class="m-dot is-available" />可预约</span>
          <span class="m-legend__item"><i class="m-dot is-occupied" />已占用</span>
          <span class="m-legend__item"><i class="m-dot is-temp" />暂离</span>
        </div>
      </section>

      <section class="m-section">
        <div v-if="loadingSeats" class="m-loading">加载座位中…</div>
        <div v-else class="m-grid">
          <button
            v-for="seat in seats"
            :key="seat.id"
            class="m-seat"
            :class="[seatStatusClass(seat.status), { 'is-focus': seat.seatNo === focusedSeatNo }]"
            type="button"
            @click="openSeat(seat)"
          >
            <div class="m-seat__no">{{ seat.seatNo }}</div>
            <div class="m-seat__type">{{ seatTypeMap[seat.type] }}</div>
          </button>
        </div>
      </section>
    </main>

    <div v-if="sheetVisible" class="m-sheet__mask" @click.self="closeSheet">
      <div class="m-sheet" role="dialog" aria-modal="true">
        <div class="m-sheet__hd">
          <div class="m-sheet__title">座位 {{ selectedSeat?.seatNo }}</div>
          <button class="m-icon-btn" type="button" @click="closeSheet">关闭</button>
        </div>
        <div v-if="selectedSeat" class="m-sheet__bd">
          <div class="m-kv">
            <div class="m-kv__k">类型</div>
            <div class="m-kv__v">{{ seatTypeMap[selectedSeat.type] }}</div>
          </div>
          <div class="m-kv">
            <div class="m-kv__k">状态</div>
            <div class="m-kv__v">
              <span class="m-pill" :class="seatStatusPillClass(selectedSeat.status)">{{ statusMap[selectedSeat.status] }}</span>
            </div>
          </div>
          <div class="m-tip" v-if="selectedSeat.status === 'available'">该座位当前可预约。</div>
          <div class="m-tip" v-else-if="selectedSeat.status === 'occupied'">该座位已被占用。</div>
          <div class="m-tip" v-else>该座位暂离中（UI 演示）。</div>
        </div>
        <div class="m-sheet__ft">
          <button class="m-btn m-btn--ghost" type="button" @click="closeSheet">返回</button>
          <button
            v-if="selectedSeat?.status === 'available'"
            class="m-btn m-btn--primary"
            type="button"
            @click="reserveSelectedSeat"
          >
            预约
          </button>
        </div>
      </div>
    </div>

    <nav class="m-tabbar" aria-label="底部导航">
      <button class="m-tab is-active" type="button" @click="goHome">首页</button>
      <button class="m-tab" type="button" @click="goToCurrentSeat">当前</button>
      <button class="m-tab" type="button" @click="goToMyReservations">我的</button>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const route = useRoute()
const router = useRouter()
const activeFloor = ref('1F')
const seats = ref([])
const loadingSeats = ref(false)

const myReservations = ref([])
const loadingReservations = ref(false)

const sheetVisible = ref(false)
const selectedSeat = ref(null)
const focusedSeatNo = ref(null)

// 类型映射
const seatTypeMap = {
  silent: '静音区',
  discussion: '讨论区',
  window: '靠窗',
  power: '带电源'
}

// 状态映射
const statusMap = {
  available: '可预约',
  occupied: '已占用',
  temp_leave: '暂离中'
}

const reservationStatusMap = {
  pending: '待签到',
  checked_in: '已签到',
  completed: '已完成'
}

// 获取座位列表
const fetchSeats = async (floor = activeFloor.value) => {
  loadingSeats.value = true
  try {
    const res = await request.get('/seats', { params: { floor } })
    if (res.data.code === 200) {
      activeFloor.value = floor
      seats.value = Array.isArray(res.data.data) ? res.data.data : []
      return seats.value
    } else {
      ElMessage.error('获取座位失败')
    }
  } catch (error) {
    ElMessage.error('网络错误')
  } finally {
    loadingSeats.value = false
  }
  return []
}

const fetchMyReservations = async () => {
  loadingReservations.value = true
  try {
    const res = await request.get('/reservations/my')
    if (res.data.code === 200) {
      myReservations.value = Array.isArray(res.data.data) ? res.data.data : []
    } else {
      ElMessage.error('获取预约失败')
    }
  } catch (error) {
    ElMessage.error('网络错误')
  } finally {
    loadingReservations.value = false
  }
}

// 导航到个人中心
const goToProfile = () => {
  router.push('/profile')
}

// 导航到一键签到
const goToCheckIn = () => {
  router.push('/checkin')
}

const goHome = () => {
  router.push('/home')
}

const goToMyReservations = () => {
  router.push('/my-reservations')
}

const goToCurrentSeat = () => {
  router.push('/current-seat')
}

const setFloor = async (floor) => {
  if (activeFloor.value === floor) return
  await fetchSeats(floor)
}

const openSeat = (seat) => {
  selectedSeat.value = seat
  sheetVisible.value = true
}

const closeSheet = () => {
  sheetVisible.value = false
  selectedSeat.value = null
}

const normalizeSeatNo = (seatNo) => (seatNo ? String(seatNo).trim().toUpperCase() : '')
const findSeatInList = (list, seatNo) => {
  const target = normalizeSeatNo(seatNo)
  if (!target) return null
  return (Array.isArray(list) ? list : []).find(s => normalizeSeatNo(s.seatNo) === target) || null
}

const focusSeatByNo = async (seatNo) => {
  const target = normalizeSeatNo(seatNo)
  if (!target) return

  let found = findSeatInList(seats.value, target)
  if (!found) {
    const floors = ['1F', '2F']
    for (const floor of floors) {
      const list = await fetchSeats(floor)
      found = findSeatInList(list, target)
      if (found) break
    }
  }

  if (!found) {
    ElMessage.warning(`未找到座位 ${target}`)
    return
  }

  focusedSeatNo.value = found.seatNo
  openSeat(found)
  window.setTimeout(() => {
    if (focusedSeatNo.value === found.seatNo) focusedSeatNo.value = null
  }, 2500)
}

// 预约座位（跳转到选座预约页面）
const reserveSelectedSeat = () => {
  if (!selectedSeat.value) return
  const seat = selectedSeat.value
  closeSheet()
  router.push({
    path: '/seat-select',
    query: {
      id: seat.id,
      seatNo: seat.seatNo,
      type: seat.type
    }
  })
}

const currentReservation = computed(() => {
  const list = Array.isArray(myReservations.value) ? myReservations.value : []
  const checkedIn = list.find(r => r.status === 'checked_in')
  if (checkedIn) return checkedIn
  const pending = list
    .filter(r => r.status === 'pending')
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0]
  return pending || null
})

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

const seatStatusClass = (status) => {
  if (status === 'available') return 'is-available'
  if (status === 'occupied') return 'is-occupied'
  return 'is-temp'
}

const seatStatusPillClass = (status) => {
  if (status === 'available') return 'is-success'
  if (status === 'occupied') return 'is-danger'
  return 'is-warning'
}

const reservationStatusClass = (status) => {
  if (status === 'checked_in') return 'is-success'
  if (status === 'pending') return 'is-warning'
  return 'is-muted'
}

// 初始化加载
onMounted(() => {
  ;(async () => {
    await fetchSeats()
    await fetchMyReservations()
    const focus = route.query.focusSeatNo || route.query.focus
    if (focus) await focusSeatByNo(focus)
  })()
})

watch(
  () => route.query.focusSeatNo || route.query.focus,
  async (next) => {
    if (!next) return
    await focusSeatByNo(next)
  }
)
</script>

<style scoped>
.m-page {
  min-height: 100svh;
  background: #f6f7fb;
  padding-bottom: calc(64px + env(safe-area-inset-bottom));
}

.m-appbar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  padding-top: calc(12px + env(safe-area-inset-top));
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.m-appbar__title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.m-icon-btn {
  border: none;
  background: transparent;
  color: #2563eb;
  font-size: 14px;
  padding: 8px 10px;
  border-radius: 10px;
}

.m-content {
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.m-section {
  width: 100%;
}

.m-seg {
  display: inline-flex;
  background: #eef2ff;
  border-radius: 12px;
  padding: 4px;
  gap: 4px;
}

.m-seg__btn {
  border: none;
  background: transparent;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 14px;
  color: #374151;
}

.m-seg__btn.is-active {
  background: #ffffff;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04);
  color: #111827;
  font-weight: 700;
}

.m-card {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.06);
  padding: 14px;
}

.m-card--press {
  cursor: pointer;
}

.m-card__hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.m-card__title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.m-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.m-card__bd {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.m-card__ft {
  margin-top: 12px;
  display: flex;
  gap: 10px;
}

.m-muted {
  color: #6b7280;
  font-size: 14px;
}

.m-kv {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}

.m-kv__k {
  color: #6b7280;
  font-size: 13px;
}

.m-kv__v {
  color: #111827;
  font-size: 14px;
  font-weight: 600;
  text-align: right;
}

.m-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  background: #f3f4f6;
  color: #374151;
}

.m-pill.is-success {
  background: #dcfce7;
  color: #166534;
}

.m-pill.is-warning {
  background: #fef9c3;
  color: #854d0e;
}

.m-pill.is-danger {
  background: #fee2e2;
  color: #991b1b;
}

.m-pill.is-muted {
  background: #f3f4f6;
  color: #6b7280;
}

.m-btn {
  flex: 1;
  border: none;
  border-radius: 12px;
  padding: 12px 12px;
  font-size: 14px;
  font-weight: 700;
}

.m-btn--primary {
  background: #2563eb;
  color: #ffffff;
}

.m-btn--ghost {
  background: #f3f4f6;
  color: #111827;
}

.m-legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  color: #6b7280;
  font-size: 13px;
}

.m-legend__item {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}

.m-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.m-dot.is-available {
  background: #22c55e;
}

.m-dot.is-occupied {
  background: #ef4444;
}

.m-dot.is-temp {
  background: #f59e0b;
}

.m-loading {
  color: #6b7280;
  font-size: 14px;
  padding: 14px 2px;
}

.m-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

@media (max-width: 390px) {
  .m-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.m-seat {
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  padding: 10px 8px;
  background: #ffffff;
  text-align: left;
}

.m-seat.is-available {
  background: linear-gradient(180deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04));
}

.m-seat.is-occupied {
  background: linear-gradient(180deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04));
}

.m-seat.is-temp {
  background: linear-gradient(180deg, rgba(245, 158, 11, 0.14), rgba(245, 158, 11, 0.04));
}

.m-seat__no {
  color: #111827;
  font-size: 14px;
  font-weight: 800;
}

.m-seat__type {
  margin-top: 2px;
  color: #6b7280;
  font-size: 12px;
}

.m-seat.is-focus {
  outline: 2px solid #2563eb;
  box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.18);
  animation: m-seat-pulse 0.9s ease-in-out 2;
}

@keyframes m-seat-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.02);
  }
  100% {
    transform: scale(1);
  }
}

.m-sheet__mask {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: rgba(17, 24, 39, 0.55);
  display: flex;
  align-items: flex-end;
}

.m-sheet {
  width: 100%;
  background: #ffffff;
  border-radius: 18px 18px 0 0;
  padding-bottom: env(safe-area-inset-bottom);
  box-shadow: 0 -20px 40px rgba(0, 0, 0, 0.12);
}

.m-sheet__hd {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.m-sheet__title {
  font-size: 16px;
  font-weight: 800;
  color: #111827;
}

.m-sheet__bd {
  padding: 14px;
  display: grid;
  gap: 10px;
}

.m-tip {
  color: #6b7280;
  font-size: 13px;
}

.m-sheet__ft {
  padding: 12px 14px 16px;
  display: flex;
  gap: 10px;
}

.m-tabbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 15;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  padding: 8px 10px;
  padding-bottom: calc(8px + env(safe-area-inset-bottom));
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.m-tab {
  border: none;
  background: transparent;
  border-radius: 12px;
  padding: 10px 8px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 800;
}

.m-tab.is-active {
  background: #eef2ff;
  color: #111827;
}
</style>
