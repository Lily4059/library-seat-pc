<template>
  <div class="home-page">
    <header class="home-header">
      <nav class="home-nav" aria-label="顶部导航">
        <button class="nav-item is-active" type="button" @click="goNav('home')"><span class="nav-txt">首页</span></button>
        <button class="nav-item" type="button" @click="goNav('seats')"><span class="nav-txt">座位</span></button>
        <button class="nav-item" type="button" @click="goNav('my-reservations')"><span class="nav-txt">预约管理</span></button>
        <button class="nav-item" type="button" @click="goToProfile"><span class="nav-txt">个人中心</span></button>
      </nav>
    </header>

    <div class="floor-nav">
      <button 
        v-for="f in ['1F', '2F', '3F', '4F', '5F']" 
        :key="f"
        class="floor-btn"
        :class="{ 'is-active': activeFloor === f }"
        @click="setFloor(f)"
      >
        {{ parseInt(f) }}楼
      </button>
    </div>

    <main class="home-main">
      <!-- 左侧地图区域 -->
      <section class="map-container">
        <div v-if="activeFloor === '3F'" class="map-3f">
          <div class="f3-top">
            <div class="f3-corner">
              <div class="f3-window-row">
                <div v-for="t in 7" :key="`f3-wl-${t}`" class="f3-table4">
                  <div
                    v-for="s in 4"
                    :key="`f3-wl-${t}-${s}`"
                    class="seat"
                    :class="['seat--window', getSeatClass(`WL-${t}-${s}`)]"
                    @click="selectSeat(`WL-${t}-${s}`)"
                  />
                </div>
              </div>
              <div class="f3-study">
                <div v-for="r in 4" :key="`f3-sl-${r}`" class="f3-study-row">
                  <div v-for="t in 4" :key="`f3-sl-${r}-${t}`" class="f3-table4">
                    <div
                      v-for="s in 4"
                      :key="`f3-sl-${r}-${t}-${s}`"
                      class="seat"
                      :class="[studySeatColorClass(t), getSeatClass(`SL-${r}-${t}-${s}`)]"
                      @click="selectSeat(`SL-${r}-${t}-${s}`)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="service-desk top-desk">服务台</div>

            <div class="f3-corner">
              <div class="f3-window-row">
                <div v-for="t in 7" :key="`f3-wr-${t}`" class="f3-table4">
                  <div
                    v-for="s in 4"
                    :key="`f3-wr-${t}-${s}`"
                    class="seat"
                    :class="['seat--window', getSeatClass(`WR-${t}-${s}`)]"
                    @click="selectSeat(`WR-${t}-${s}`)"
                  />
                </div>
              </div>
              <div class="f3-study">
                <div v-for="r in 4" :key="`f3-sr-${r}`" class="f3-study-row">
                  <div v-for="t in 4" :key="`f3-sr-${r}-${t}`" class="f3-table4">
                    <div
                      v-for="s in 4"
                      :key="`f3-sr-${r}-${t}-${s}`"
                      class="seat"
                      :class="[studySeatColorClass(t), getSeatClass(`SR-${r}-${t}-${s}`)]"
                      @click="selectSeat(`SR-${r}-${t}-${s}`)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="f3-corridor">
            <div class="f3-duo-group f3-duo-group--mirror">
              <div v-for="i in 4" :key="`f3-dtl-${i}`" class="f3-duo-table">
                <div
                  v-for="s in 2"
                  :key="`f3-dtl-${i}-${s}`"
                  class="seat"
                  :class="['seat--duo', getSeatClass(`DTL-${i}-${s}`)]"
                  @click="selectSeat(`DTL-${i}-${s}`)"
                />
              </div>
            </div>

            <div class="f3-zone f3-zone--pink">
              <div
                v-for="i in 8"
                :key="`f3-pth-${i}`"
                class="seat f3-zone-seat"
                :class="['seat--inner-long', getSeatClass(`PTH-${i}`)]"
                @click="selectSeat(`PTH-${i}`)"
              />
            </div>

            <div class="f3-duo-group f3-duo-group--shift">
              <div v-for="i in 4" :key="`f3-dtr-${i}`" class="f3-duo-table">
                <div
                  v-for="s in 2"
                  :key="`f3-dtr-${i}-${s}`"
                  class="seat"
                  :class="['seat--duo', getSeatClass(`DTR-${i}-${s}`)]"
                  @click="selectSeat(`DTR-${i}-${s}`)"
                />
              </div>
            </div>
          </div>

          <div class="f3-middle">
            <div class="leisure-zone">休闲区</div>
            <div class="f3-zone f3-zone--pink f3-zone--vertical f3-left-pink">
              <div
                v-for="i in 8"
                :key="`f3-plv-${i}`"
                class="seat f3-zone-seat"
                :class="['seat--inner-long', getSeatClass(`PLV-${i}`)]"
                @click="selectSeat(`PLV-${i}`)"
              />
            </div>
            <div class="f3-spacer"></div>
            <div class="f3-right-columns">
              <div class="f3-zone f3-zone--pink f3-zone--vertical f3-right-pink">
                <div
                  v-for="i in 8"
                  :key="`f3-prv-${i}`"
                  class="seat f3-zone-seat"
                  :class="['seat--inner-long', getSeatClass(`PRV-${i}`)]"
                  @click="selectSeat(`PRV-${i}`)"
                />
              </div>
              <div class="f3-zone f3-zone--yellow f3-zone--vertical f3-right-yellow">
                <div
                  v-for="i in 8"
                  :key="`f3-yv-${i}`"
                  class="seat f3-zone-seat"
                  :class="['seat--window-long', getSeatClass(`YV-${i}`)]"
                  @click="selectSeat(`YV-${i}`)"
                />
              </div>
            </div>
          </div>

          <div class="f3-corridor">
            <div class="f3-duo-group f3-duo-group--mirror">
              <div v-for="i in 4" :key="`f3-dbl-${i}`" class="f3-duo-table">
                <div
                  v-for="s in 2"
                  :key="`f3-dbl-${i}-${s}`"
                  class="seat"
                  :class="['seat--duo', getSeatClass(`DBL-${i}-${s}`)]"
                  @click="selectSeat(`DBL-${i}-${s}`)"
                />
              </div>
            </div>

            <div class="f3-zone f3-zone--pink">
              <div
                v-for="i in 8"
                :key="`f3-pbh-${i}`"
                class="seat f3-zone-seat"
                :class="['seat--inner-long', getSeatClass(`PBH-${i}`)]"
                @click="selectSeat(`PBH-${i}`)"
              />
            </div>

            <div class="f3-duo-group f3-duo-group--shift">
              <div v-for="i in 4" :key="`f3-dbr-${i}`" class="f3-duo-table">
                <div
                  v-for="s in 2"
                  :key="`f3-dbr-${i}-${s}`"
                  class="seat"
                  :class="['seat--duo', getSeatClass(`DBR-${i}-${s}`)]"
                  @click="selectSeat(`DBR-${i}-${s}`)"
                />
              </div>
            </div>
          </div>

          <div class="f3-bottom">
            <div class="f3-corner">
              <div class="f3-study">
                <div v-for="r in 4" :key="`f3-sbl-${r}`" class="f3-study-row">
                  <div v-for="t in 4" :key="`f3-sbl-${r}-${t}`" class="f3-table4">
                    <div
                      v-for="s in 4"
                      :key="`f3-sbl-${r}-${t}-${s}`"
                      class="seat"
                      :class="[studySeatColorClass(t), getSeatClass(`SBL-${r}-${t}-${s}`)]"
                      @click="selectSeat(`SBL-${r}-${t}-${s}`)"
                    />
                  </div>
                </div>
              </div>
              <div class="f3-window-row f3-window-row--bottom">
                <div v-for="t in 7" :key="`f3-wbl-${t}`" class="f3-table4">
                  <div
                    v-for="s in 4"
                    :key="`f3-wbl-${t}-${s}`"
                    class="seat"
                    :class="['seat--window', getSeatClass(`WBL-${t}-${s}`)]"
                    @click="selectSeat(`WBL-${t}-${s}`)"
                  />
                </div>
              </div>
            </div>

            <div class="f3-bottom-center">
              <div class="service-desk bottom-desk">服务台</div>
              <div class="f3-hall">
                <div v-for="r in 3" :key="`f3-h-${r}`" class="f3-hall-row">
                  <div v-for="t in 4" :key="`f3-h-${r}-${t}`" class="f3-table4 f3-table4--hall">
                    <div
                      v-for="s in 4"
                      :key="`f3-h-${r}-${t}-${s}`"
                      class="seat"
                      :class="['seat--hall', getSeatClass(`H-${r}-${t}-${s}`)]"
                      @click="selectSeat(`H-${r}-${t}-${s}`)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div class="f3-corner">
              <div class="f3-study">
                <div v-for="r in 4" :key="`f3-sbr-${r}`" class="f3-study-row">
                  <div v-for="t in 4" :key="`f3-sbr-${r}-${t}`" class="f3-table4">
                    <div
                      v-for="s in 4"
                      :key="`f3-sbr-${r}-${t}-${s}`"
                      class="seat"
                      :class="[studySeatColorClass(t), getSeatClass(`SBR-${r}-${t}-${s}`)]"
                      @click="selectSeat(`SBR-${r}-${t}-${s}`)"
                    />
                  </div>
                </div>
              </div>
              <div class="f3-window-row f3-window-row--bottom">
                <div v-for="t in 7" :key="`f3-wbr-${t}`" class="f3-table4">
                  <div
                    v-for="s in 4"
                    :key="`f3-wbr-${t}-${s}`"
                    class="seat"
                    :class="['seat--window', getSeatClass(`WBR-${t}-${s}`)]"
                    @click="selectSeat(`WBR-${t}-${s}`)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else>
          <!-- 顶部方块区 -->
          <div class="map-blocks top-blocks">
            <div class="grid-block">
              <div class="table-group" v-for="i in 12" :key="`tl-${i}`">
                <div class="seat" :class="getSeatClass(`TL-${i}-1`)" @click="selectSeat(`TL-${i}-1`)"></div>
                <div class="seat" :class="getSeatClass(`TL-${i}-2`)" @click="selectSeat(`TL-${i}-2`)"></div>
                <div class="seat" :class="getSeatClass(`TL-${i}-3`)" @click="selectSeat(`TL-${i}-3`)"></div>
                <div class="seat" :class="getSeatClass(`TL-${i}-4`)" @click="selectSeat(`TL-${i}-4`)"></div>
              </div>
            </div>
            <div class="service-desk top-desk">服务台</div>
            <div class="grid-block">
              <div class="table-group" v-for="i in 12" :key="`tr-${i}`">
                <div class="seat" :class="getSeatClass(`TR-${i}-1`)" @click="selectSeat(`TR-${i}-1`)"></div>
                <div class="seat" :class="getSeatClass(`TR-${i}-2`)" @click="selectSeat(`TR-${i}-2`)"></div>
                <div class="seat" :class="getSeatClass(`TR-${i}-3`)" @click="selectSeat(`TR-${i}-3`)"></div>
                <div class="seat" :class="getSeatClass(`TR-${i}-4`)" @click="selectSeat(`TR-${i}-4`)"></div>
              </div>
            </div>
          </div>

          <!-- 中上走廊区 -->
          <div class="aisle-row">
            <div class="aisle-seats green-seats">
              <div class="seat-row" v-for="i in 4" :key="`ar1-${i}`" @click="selectSeat(`AR1-${i}`)"></div>
            </div>
            <div class="aisle-seats pink-seats">
              <div class="seat-row" v-for="i in 10" :key="`ar2-${i}`" @click="selectSeat(`AR2-${i}`)"></div>
            </div>
            <div class="aisle-seats green-seats">
              <div class="seat-row" v-for="i in 4" :key="`ar3-${i}`" @click="selectSeat(`AR3-${i}`)"></div>
            </div>
          </div>

          <!-- 中间主体区 -->
          <div class="middle-area">
            <div class="leisure-zone">休闲区</div>
            <div class="vertical-aisle pink-vertical">
              <div class="seat-col" v-for="i in 8" :key="`mv1-${i}`" @click="selectSeat(`MV1-${i}`)"></div>
            </div>
            <div class="center-empty"></div>
            <div class="vertical-aisle pink-vertical">
              <div class="seat-col" v-for="i in 8" :key="`mv2-${i}`" @click="selectSeat(`MV2-${i}`)"></div>
            </div>
            <div class="vertical-aisle yellow-vertical">
              <div class="seat-col" v-for="i in 8" :key="`mv3-${i}`" @click="selectSeat(`MV3-${i}`)"></div>
            </div>
          </div>

          <!-- 中下走廊区 -->
          <div class="aisle-row">
            <div class="aisle-seats green-seats">
              <div class="seat-row" v-for="i in 4" :key="`ar4-${i}`" @click="selectSeat(`AR4-${i}`)"></div>
            </div>
            <div class="aisle-seats pink-seats">
              <div class="seat-row" v-for="i in 10" :key="`ar5-${i}`" @click="selectSeat(`AR5-${i}`)"></div>
            </div>
            <div class="aisle-seats green-seats">
              <div class="seat-row" v-for="i in 4" :key="`ar6-${i}`" @click="selectSeat(`AR6-${i}`)"></div>
            </div>
          </div>

          <!-- 底部方块区 -->
          <div class="map-blocks bottom-blocks">
            <div class="grid-block">
              <div class="table-group" v-for="i in 12" :key="`bl-${i}`">
                <div class="seat" :class="getSeatClass(`BL-${i}-1`)" @click="selectSeat(`BL-${i}-1`)"></div>
                <div class="seat" :class="getSeatClass(`BL-${i}-2`)" @click="selectSeat(`BL-${i}-2`)"></div>
                <div class="seat" :class="getSeatClass(`BL-${i}-3`)" @click="selectSeat(`BL-${i}-3`)"></div>
                <div class="seat" :class="getSeatClass(`BL-${i}-4`)" @click="selectSeat(`BL-${i}-4`)"></div>
              </div>
            </div>
            <div class="bottom-center-desk">
               <div class="service-desk bottom-desk">服务台</div>
               <div class="bottom-tables">
                  <div class="bt-row" v-for="r in 3" :key="`btr-${r}`">
                    <div class="bt-cell" v-for="c in 4" :key="`btc-${r}-${c}`" @click="selectSeat(`BTR-${r}-${c}`)"></div>
                  </div>
               </div>
            </div>
            <div class="grid-block">
              <div class="table-group" v-for="i in 12" :key="`br-${i}`">
                <div class="seat" :class="getSeatClass(`BR-${i}-1`)" @click="selectSeat(`BR-${i}-1`)"></div>
                <div class="seat" :class="getSeatClass(`BR-${i}-2`)" @click="selectSeat(`BR-${i}-2`)"></div>
                <div class="seat" :class="getSeatClass(`BR-${i}-3`)" @click="selectSeat(`BR-${i}-3`)"></div>
                <div class="seat" :class="getSeatClass(`BR-${i}-4`)" @click="selectSeat(`BR-${i}-4`)"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 右侧面板区域 -->
      <aside class="info-panels">
        <div class="panel-card">
          <div class="panel-title">个人预约信息</div>
          <div class="panel-content resv-split">
            <div class="resv-left">
              <div class="info-item">时间：{{ displayReservation.time }}</div>
              <div class="info-item">状态：{{ displayReservation.statusText }}</div>
              <div class="info-item">区域：{{ displayReservation.area }}</div>
              <div class="info-item">距离开始时间/结束时间：{{ displayReservation.distance }}</div>
            </div>

            <div class="resv-calendar" aria-label="日历">
              <div class="cal-hd">
                <select class="cal-select" v-model.number="viewYear">
                  <option v-for="y in yearOptions" :key="y" :value="y">{{ y }}年</option>
                </select>
                <select class="cal-select" v-model.number="viewMonth">
                  <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
                </select>
              </div>

              <div class="cal-week">
                <div class="cal-week__d" v-for="w in ['一','二','三','四','五','六','日']" :key="w">{{ w }}</div>
              </div>

              <div class="cal-grid">
                <button
                  v-for="(cell, idx) in calendarCells"
                  :key="idx"
                  class="cal-cell"
                  :class="{
                    'is-empty': !cell,
                    'is-today': cell && isToday(viewYear, viewMonth, cell),
                    'is-selected': cell && isSelected(viewYear, viewMonth, cell)
                  }"
                  type="button"
                  :disabled="!cell"
                  @click="cell && selectDate(viewYear, viewMonth, cell)"
                >
                  <span class="cal-day">{{ cell || '' }}</span>
                  <span v-if="cell && hasReservation(viewYear, viewMonth, cell)" class="cal-dot" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="panel-card">
          <div class="panel-title">各楼层座位信息统计——空余座位数</div>
          <div class="panel-content floor-stats">
            <div class="stat-item" v-for="f in ['1F', '2F', '3F', '4F', '5F']" :key="f">
              {{ parseInt(f) }}楼：<span class="stat-num">{{ floorStats[f] || 0 }}</span>
            </div>
          </div>
        </div>

        <div class="panel-card selected-seat-card">
          <div class="panel-title">目前所选座位信息</div>
          <div class="panel-content">
            <div class="info-item">状态：{{ selectedSeatInfo?.statusText || '--' }}</div>
            <div class="info-item">楼层：{{ selectedSeatInfo?.floor || '--' }}</div>
            <div class="info-item">所属区域：{{ selectedSeatInfo?.area || '--' }}</div>
            <div class="info-item">可预约时间范围：{{ selectedSeatInfo?.timeRange || '--' }}</div>
          </div>
          <div class="panel-actions">
            <button 
              class="reserve-btn" 
              :disabled="!selectedSeat || selectedSeatInfo?.status !== 'available'"
              @click="handleReserve"
            >
              进行预约
            </button>
            <div class="reserve-tip" v-if="selectedSeatInfo?.status === 'available'">如果有可预约时间按时弹出</div>
          </div>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '../utils/request'

const router = useRouter()
const activeFloor = ref('1F')
const selectedSeat = ref(null)

const now = new Date()
const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
const selectedDate = ref(todayStart)
const viewYear = ref(todayStart.getFullYear())
const viewMonth = ref(todayStart.getMonth() + 1)

const reservations = ref([])

const pad2 = (n) => String(n).padStart(2, '0')
const dateKeyFromParts = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`
const dateKeyFromIso = (iso) => {
  const t = new Date(String(iso))
  if (Number.isNaN(t.getTime())) return null
  return dateKeyFromParts(t.getFullYear(), t.getMonth() + 1, t.getDate())
}

const reservationStatusText = (status) => {
  if (status === 'pending') return '待签到'
  if (status === 'checked_in') return '已签到'
  if (status === 'completed') return '已完成'
  if (status === 'cancelled') return '已取消'
  return '未知'
}

const seatTypeText = (type) => {
  if (type === 'silent') return '静音区'
  if (type === 'discussion') return '讨论区'
  if (type === 'window') return '靠窗'
  if (type === 'power') return '带电源'
  return '未知'
}

const formatHm = (iso) => {
  const t = new Date(String(iso))
  if (Number.isNaN(t.getTime())) return ''
  return `${pad2(t.getHours())}:${pad2(t.getMinutes())}`
}

const formatRange = (startIso, endIso) => {
  const a = formatHm(startIso)
  const b = formatHm(endIso)
  return a && b ? `${a}-${b}` : a || b || ''
}

const minutesDiff = (fromMs, toMs) => Math.max(0, Math.round((toMs - fromMs) / 60000))

const reservationMap = computed(() => {
  const map = new Map()
  for (const r of Array.isArray(reservations.value) ? reservations.value : []) {
    const key = dateKeyFromIso(r?.startTime)
    if (!key) continue
    const list = map.get(key) || []
    list.push(r)
    map.set(key, list)
  }
  for (const [k, list] of map.entries()) {
    list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    map.set(k, list)
  }
  return map
})

const selectedReservation = computed(() => {
  const d = selectedDate.value instanceof Date ? selectedDate.value : null
  if (!d) return null
  const key = dateKeyFromParts(d.getFullYear(), d.getMonth() + 1, d.getDate())
  const list = reservationMap.value.get(key)
  return list && list.length ? list[0] : null
})

const displayReservation = computed(() => {
  const r = selectedReservation.value
  if (!r) {
    return { time: '--', statusText: '--', area: '--', distance: '--' }
  }
  const time = `${dateKeyFromIso(r.startTime) || ''} ${formatRange(r.startTime, r.endTime)}`
  const statusText = reservationStatusText(r.status)
  const area = `${seatTypeText(r.seatType)}（${r.seatNo || '--'}）`
  const startMs = new Date(String(r.startTime)).getTime()
  const endMs = new Date(String(r.endTime)).getTime()
  const nowMs = Date.now()
  let distance = '--'
  if (!Number.isNaN(startMs) && !Number.isNaN(endMs)) {
    if (nowMs < startMs) distance = `距离开始：${minutesDiff(nowMs, startMs)}分钟`
    else if (nowMs < endMs) distance = `距离结束：${minutesDiff(nowMs, endMs)}分钟`
    else distance = '已结束'
  }
  return { time: time.trim() || '--', statusText, area, distance }
})

const yearOptions = computed(() => {
  const y = todayStart.getFullYear()
  const list = []
  for (let i = y - 5; i <= y + 5; i += 1) list.push(i)
  return list
})

const daysInMonth = computed(() => new Date(viewYear.value, viewMonth.value, 0).getDate())
const firstWeekday = computed(() => {
  const d = new Date(viewYear.value, viewMonth.value - 1, 1)
  const day = d.getDay()
  return (day + 6) % 7
})

const calendarCells = computed(() => {
  const blanks = firstWeekday.value
  const total = blanks + daysInMonth.value
  const rows = Math.ceil(total / 7)
  const size = rows * 7
  const arr = Array.from({ length: size }, (_, idx) => {
    const day = idx - blanks + 1
    return day >= 1 && day <= daysInMonth.value ? day : null
  })
  return arr
})

const hasReservation = (y, m, d) => reservationMap.value.has(dateKeyFromParts(y, m, d))
const isToday = (y, m, d) =>
  y === todayStart.getFullYear() && m === todayStart.getMonth() + 1 && d === todayStart.getDate()
const isSelected = (y, m, d) => {
  const sd = selectedDate.value
  return sd && y === sd.getFullYear() && m === sd.getMonth() + 1 && d === sd.getDate()
}

const selectDate = (y, m, d) => {
  selectedDate.value = new Date(y, m - 1, d)
}

const floorStats = ref({
  '1F': 120,
  '2F': 85,
  '3F': 150,
  '4F': 90,
  '5F': 200
})

const goNav = (key) => {
  if (key === 'home') return
  if (key === 'my-reservations') router.push('/my-reservations')
  if (key === 'seats') router.push('/home')
}

const goToProfile = () => {
  router.push('/profile')
}

const setFloor = (floor) => {
  activeFloor.value = floor
  selectedSeat.value = null
}

const stableHash = (input) => {
  let h = 2166136261
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const stableStatus = (floor, seatId) => {
  const n = stableHash(`${floor}:${seatId}`) % 10
  return n < 7 ? 'available' : 'occupied'
}

const studySeatColorClass = (tableIndex) => (tableIndex === 1 || tableIndex === 4 ? 'seat--study-window' : 'seat--study')

const getSeatMeta = (floor, seatId) => {
  if (floor !== '3F') {
    const status = stableStatus(floor, seatId)
    return {
      status,
      area: seatId.startsWith('TL') || seatId.startsWith('TR') || seatId.startsWith('BL') || seatId.startsWith('BR') ? '普通自习区' : '走廊/特色区',
      timeRange: status === 'available' ? '08:00 - 22:00' : '--'
    }
  }

  const status = stableStatus(floor, seatId)
  const timeRange = status === 'available' ? '08:00 - 22:00' : '--'

  if (seatId.startsWith('WL-') || seatId.startsWith('WR-') || seatId.startsWith('WBL-') || seatId.startsWith('WBR-')) {
    return { status, area: '靠窗区', timeRange }
  }
  if (seatId.startsWith('SL-') || seatId.startsWith('SR-') || seatId.startsWith('SBL-') || seatId.startsWith('SBR-')) {
    const parts = seatId.split('-')
    const tableIndex = Number(parts[2])
    return { status, area: tableIndex === 1 || tableIndex === 4 ? '自习区（靠窗）' : '自习区', timeRange }
  }
  if (seatId.startsWith('PTH-') || seatId.startsWith('PBH-') || seatId.startsWith('PLV-') || seatId.startsWith('PRV-')) {
    return { status, area: '内侧长桌区', timeRange }
  }
  if (seatId.startsWith('YV-')) {
    return { status, area: '靠窗长桌区', timeRange }
  }
  if (seatId.startsWith('DTL-') || seatId.startsWith('DTR-') || seatId.startsWith('DBL-') || seatId.startsWith('DBR-')) {
    return { status, area: '内侧双人桌', timeRange }
  }
  if (seatId.startsWith('H-')) {
    return { status, area: '大厅区', timeRange }
  }
  return { status, area: '其他', timeRange }
}

const selectSeat = (seatId) => {
  const meta = getSeatMeta(activeFloor.value, seatId)
  selectedSeat.value = {
    id: seatId,
    status: meta.status,
    floor: activeFloor.value,
    area: meta.area,
    timeRange: meta.timeRange
  }
}

const getSeatClass = (seatId) => {
  const status = stableStatus(activeFloor.value, seatId)
  const classes = [status === 'available' ? 'is-available' : 'is-occupied']
  if (selectedSeat.value?.id === seatId) classes.push('is-selected')
  return classes.join(' ')
}

const selectedSeatInfo = computed(() => {
  if (!selectedSeat.value) return null
  return {
    status: selectedSeat.value.status,
    statusText: selectedSeat.value.status === 'available' ? '空闲' : '被占用',
    floor: selectedSeat.value.floor,
    area: selectedSeat.value.area,
    timeRange: selectedSeat.value.timeRange
  }
})

const handleReserve = () => {
  if (!selectedSeat.value || selectedSeat.value.status !== 'available') return
  ElMessage.success(`成功预约座位 ${selectedSeat.value.id}！`)
  // 实际项目中这里可以跳转或调接口
}

onMounted(() => {
  ;(async () => {
    try {
      const res = await request.get('/reservations/my')
      if (res?.data?.code === 200) {
        reservations.value = Array.isArray(res.data.data) ? res.data.data : []
      } else {
        reservations.value = []
      }
    } catch {
      reservations.value = []
    }
  })()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
}

.home-header {
  display: flex;
  justify-content: center;
  padding: 0;
  background: #2563eb;
  border-bottom: none;
}

.home-nav {
  width: 100%;
  max-width: 1280px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
}

.nav-item {
  appearance: none;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  padding: 16px 10px;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
}

.nav-item.is-active {
  color: #ffffff;
}

.nav-item.is-active .nav-txt {
  font-weight: 800;
}

.nav-txt {
  display: inline-block;
  line-height: 1;
}

.floor-nav {
  display: flex;
  gap: 20px;
  padding: 15px 40px;
}

.floor-btn {
  background: #fff;
  border: 1px solid #4a70d1;
  color: #333;
  padding: 4px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.floor-btn.is-active {
  background: #a8c6fa;
}

.home-main {
  display: flex;
  padding: 0 40px 40px;
  gap: 30px;
  flex: 1;
}

/* 左侧地图区域 */
.map-container {
  flex: 2;
  background: #fbf6e8;
  border: 3px solid rgba(74, 112, 209, 0.9);
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  min-width: 800px;
  border-radius: 8px;
}

.map-blocks {
  display: flex;
  justify-content: space-between;
}

.grid-block {
  padding: 5px;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 5px;
  width: 220px;
  height: 140px;
}

.table-group {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  background: rgba(15, 23, 42, 0.06);
  border-radius: 6px;
  overflow: hidden;
}

.seat,
.seat-row,
.seat-col,
.bt-cell {
  --seat-color: #dbeafe;
  position: relative;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  box-sizing: border-box;
  isolation: isolate;
}

.seat::before,
.seat-row::before,
.seat-col::before,
.bt-cell::before {
  content: '';
  position: absolute;
  left: 16%;
  right: 16%;
  top: 8%;
  height: 46%;
  background: color-mix(in srgb, var(--seat-color) 92%, #0f172a 8%);
  border-radius: 8px 8px 5px 5px;
  box-shadow:
    inset 0 -1px 0 rgba(15, 23, 42, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.55);
}

.seat::after,
.seat-row::after,
.seat-col::after,
.bt-cell::after {
  content: '';
  position: absolute;
  left: 10%;
  right: 10%;
  bottom: 10%;
  height: 34%;
  background:
    linear-gradient(
      180deg,
      color-mix(in srgb, var(--seat-color) 84%, #ffffff 16%),
      color-mix(in srgb, var(--seat-color) 84%, #0f172a 16%)
    );
  border-radius: 7px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    inset 0 -1px 0 rgba(15, 23, 42, 0.25);
}

.seat:hover::before,
.seat:hover::after,
.seat-row:hover::before,
.seat-row:hover::after,
.seat-col:hover::before,
.seat-col:hover::after,
.bt-cell:hover::before,
.bt-cell:hover::after {
  filter: brightness(1.03);
}

.seat.is-occupied {
  --seat-color: #cbd5e1;
  cursor: not-allowed;
}

.seat.is-selected {
  --seat-color: #f59e0b;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.45);
}

.seat--window { --seat-color: #7ad63a; }
.seat--study-window { --seat-color: #c8f1b7; }
.seat--study { --seat-color: #dbeafe; }
.seat--inner-long { --seat-color: #f9a8d4; }
.seat--window-long { --seat-color: #fde047; }
.seat--duo { --seat-color: #2bb7b3; }
.seat--hall { --seat-color: #7c3aed; }

.map-3f {
  --seat-unit: 34px;
}

.map-3f {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.f3-top {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-start;
}

.f3-bottom {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  align-items: flex-end;
}

.f3-corner {
  width: 300px;
  padding: 8px;
  box-sizing: border-box;
}

.f3-window-row {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 6px;
}

.f3-window-row--bottom {
  margin-top: 6px;
  margin-bottom: 0;
}

.f3-study {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.f3-study-row {
  display: grid;
  grid-template-columns: repeat(4, auto);
  gap: 4px;
}

.f3-table4 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(2, 1fr);
  width: 34px;
  height: 34px;
  box-sizing: border-box;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.06);
  border-radius: 6px;
}

.f3-table4--hall {
  border-color: rgba(74, 112, 209, 0.65);
}

.f3-corridor {
  display: flex;
  justify-content: space-between;
  padding: 6px;
  gap: 10px;
  align-items: center;
}

.f3-duo-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.f3-duo-group--shift {
  transform: translateX(calc(-1 * var(--seat-unit)));
}

.f3-duo-group--mirror {
  transform: translateX(calc(1 * var(--seat-unit)));
}

.f3-duo-table {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  width: 62px;
  height: 26px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.06);
  border-radius: 8px;
}

.f3-zone {
  padding: 4px;
  display: flex;
  gap: 4px;
  align-items: center;
}

.f3-zone--vertical {
  flex-direction: column;
  align-items: stretch;
}

.f3-zone-seat {
  width: 34px;
  height: 24px;
}

.f3-middle {
  display: flex;
  justify-content: flex-start;
  height: 240px;
  align-items: center;
  padding: 0 10px;
  gap: 18px;
}

.f3-spacer {
  flex: 1 1 auto;
  min-width: 120px;
}

.f3-right-columns {
  display: flex;
  align-items: center;
  gap: 18px;
  margin-right: 80px;
}

.f3-right-pink {
  transform: translateX(calc(-2 * var(--seat-unit)));
}

.f3-right-yellow {
  transform: translateX(calc(2 * var(--seat-unit)));
}

.f3-left-pink {
  transform: translateX(calc(1.5 * var(--seat-unit)));
}

.f3-bottom-center {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.f3-hall {
  padding: 6px;
  width: 240px;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.06);
  border-radius: 10px;
}

.f3-hall-row {
  display: grid;
  grid-template-columns: repeat(4, auto);
  gap: 4px;
  justify-content: center;
}

.service-desk {
  background: #8b6b23;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  border-radius: 100px 100px 0 0;
  width: 180px;
  height: 90px;
  margin-top: 50px;
}

.bottom-desk {
  border-radius: 0 0 100px 100px;
  margin-top: 0;
  margin-bottom: 10px;
}

.aisle-row {
  display: flex;
  justify-content: space-between;
  padding: 5px;
  gap: 10px;
}

.aisle-seats {
  display: flex;
  gap: 5px;
}

.seat-row {
  width: 35px;
  height: 25px;
  cursor: pointer;
}

.green-seats .seat-row { --seat-color: #2bb7b3; }
.pink-seats .seat-row { --seat-color: #f9a8d4; }

.middle-area {
  display: flex;
  justify-content: space-between;
  height: 220px;
  align-items: center;
  padding: 0 10px;
}

.leisure-zone {
  width: 140px;
  height: 180px;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  writing-mode: vertical-lr;
  letter-spacing: 10px;
  background: rgba(15, 23, 42, 0.04);
}

.map-3f .leisure-zone {
  margin-left: 4px;
}

.vertical-aisle {
  display: flex;
  flex-direction: column;
  gap: 5px;
  padding: 5px;
}

.seat-col {
  width: 45px;
  height: 22px;
  cursor: pointer;
}

.pink-vertical .seat-col { --seat-color: #f9a8d4; }
.yellow-vertical .seat-col { --seat-color: #fde047; }

.center-empty {
  flex: 1;
}

.bottom-center-desk {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bottom-tables {
  padding: 5px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 180px;
}

.bt-row {
  display: flex;
  gap: 4px;
}

.bt-cell {
  flex: 1;
  height: 20px;
  cursor: pointer;
  --seat-color: #7c3aed;
}

/* 右侧面板区域 */
.info-panels {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 400px;
}

.panel-card {
  border: 2px solid #4a70d1;
  border-radius: 24px;
  padding: 20px 30px;
  background: #fff;
}

.panel-title {
  font-size: 22px;
  font-weight: 500;
  margin-bottom: 15px;
  color: #333;
}

.panel-content {
  font-size: 18px;
  color: #333;
  line-height: 1.8;
}

.panel-content.col-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 20px;
}

.panel-content.resv-split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 0;
  align-items: stretch;
}

.resv-left {
  min-width: 0;
  padding-right: 18px;
  border-right: 1px solid rgba(74, 112, 209, 0.35);
}

.resv-calendar {
  padding-left: 18px;
  background: transparent;
  border: none;
  border-radius: 0;
  padding-top: 10px;
  padding-right: 0;
  padding-bottom: 12px;
  box-sizing: border-box;
}

.cal-hd {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.cal-select {
  width: 100%;
  appearance: none;
  border: 1px solid rgba(15, 23, 42, 0.18);
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 14px;
  background: #ffffff;
}

.cal-week {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin-bottom: 8px;
  color: rgba(15, 23, 42, 0.7);
  font-size: 12px;
  text-align: center;
}

.cal-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
}

.cal-cell {
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: rgba(255, 255, 255, 0.85);
  border-radius: 10px;
  height: 34px;
  padding: 4px 0;
  position: relative;
  cursor: pointer;
}

.cal-cell.is-empty {
  border-color: transparent;
  background: transparent;
  cursor: default;
}

.cal-cell.is-selected {
  border-color: rgba(37, 99, 235, 0.8);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.18);
}

.cal-cell.is-today:not(.is-selected) {
  border-color: rgba(15, 23, 42, 0.28);
}

.cal-day {
  display: block;
  font-size: 13px;
  color: rgba(15, 23, 42, 0.85);
  line-height: 1;
  text-align: center;
}

.cal-dot {
  width: 6px;
  height: 6px;
  background: #2563eb;
  border-radius: 999px;
  position: absolute;
  left: 50%;
  bottom: 6px;
  transform: translateX(-50%);
}

.floor-stats {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  row-gap: 15px;
}

.stat-item {
  font-size: 20px;
}

.selected-seat-card {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-actions {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  padding-top: 30px;
}

.reserve-btn {
  background: #fff;
  border: 1px solid #4a70d1;
  color: #333;
  padding: 8px 30px;
  border-radius: 30px;
  font-size: 20px;
  cursor: pointer;
}

.reserve-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.reserve-btn:not(:disabled):hover {
  background: #eef2ff;
}

.reserve-tip {
  font-size: 12px;
  color: #666;
  margin-left: 40px;
}
</style>
