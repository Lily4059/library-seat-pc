<template>
  <div class="m-page">
    <header class="m-appbar">
      <button class="m-icon-btn" type="button" @click="goBack">返回</button>
      <div class="m-appbar__title">我的预约</div>
      <div class="m-appbar__spacer" />
    </header>

    <main class="m-content">
      <div class="my-reservations-container">
        <el-table :data="reservations" style="width: 100%" v-loading="loading">
          <el-table-column prop="seatNo" label="座位号" width="100" />
          <el-table-column prop="seatType" label="类型" width="100">
            <template #default="{ row }">
              {{ seatTypeMap[row.seatType] }}
            </template>
          </el-table-column>
          <el-table-column prop="startTime" label="开始时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.startTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="endTime" label="结束时间" width="180">
            <template #default="{ row }">
              {{ formatTime(row.endTime) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="statusTagType[row.status]">{{ statusMap[row.status] }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button
                v-if="row.status === 'pending'"
                type="primary"
                size="small"
                @click="checkIn(row)"
              >签到</el-button>
              <el-button
                v-if="row.status === 'pending'"
                type="danger"
                size="small"
                @click="cancelReservation(row)"
              >取消</el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && reservations.length === 0" description="暂无预约记录" />
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import axios from 'axios'

const router = useRouter()
const reservations = ref([])
const loading = ref(false)

const seatTypeMap = {
  silent: '静音区',
  discussion: '讨论区',
  window: '靠窗',
  power: '带电源'
}

const statusMap = {
  pending: '待签到',
  checked_in: '已签到',
  completed: '已完成',
  cancelled: '已取消',
  expired: '已过期'
}

const statusTagType = {
  pending: 'warning',
  checked_in: 'success',
  completed: 'info',
  cancelled: 'danger',
  expired: 'info'
}

const formatTime = (iso) => {
  if (!iso) return ''
  const date = new Date(iso)
  return date.toLocaleString()
}

// 获取我的预约列表
const fetchReservations = async () => {
  loading.value = true
  try {
    const res = await axios.get('/api/reservations/my')
    if (res.data.code === 200) {
      reservations.value = res.data.data
    } else {
      ElMessage.error('获取预约列表失败')
    }
  } catch (error) {
    ElMessage.error('网络错误')
  } finally {
    loading.value = false
  }
}

// 签到
const checkIn = async (reservation) => {
  try {
    await ElMessageBox.confirm(`确认签到座位 ${reservation.seatNo} 吗？`, '签到确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'info'
    })
    const res = await axios.post('/api/checkin', { reservationId: reservation.id })
    if (res.data.code === 200) {
      ElMessage.success('签到成功')
      // 更新列表中该条记录的状态
      const index = reservations.value.findIndex(r => r.id === reservation.id)
      if (index !== -1) {
        reservations.value[index].status = 'checked_in'
        reservations.value[index].checkInTime = res.data.data.checkInTime
      }
    } else {
      ElMessage.error(res.data.message || '签到失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('签到失败')
    }
  }
}

// 取消预约
const cancelReservation = async (reservation) => {
  try {
    await ElMessageBox.confirm(`确定取消座位 ${reservation.seatNo} 的预约吗？`, '取消确认', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const res = await axios.post(`/api/reservations/${reservation.id}/cancel`)
    if (res.data.code === 200) {
      ElMessage.success('取消成功')
      // 更新列表中该条记录的状态
      const index = reservations.value.findIndex(r => r.id === reservation.id)
      if (index !== -1) {
        reservations.value[index].status = 'cancelled'
      }
    } else {
      ElMessage.error(res.data.message || '取消失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

onMounted(() => {
  fetchReservations()
})

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

.my-reservations-container {
  padding: 0;
}
</style>
