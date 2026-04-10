import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import CurrentSeat from '../views/CurrentSeat.vue'
import SeatSelect from '../views/SeatSelect.vue'
import Confirm from '../views/Confirm.vue'
import MyReservations from '../views/MyReservations.vue'
import CheckIn from '../views/CheckIn.vue'
import Profile from '../views/Profile.vue'
import CheckInSuccess from '../views/CheckInSuccess.vue'
import History from '../views/History.vue'
import CreditLog from '../views/CreditLog.vue'
import Notifications from '../views/Notifications.vue'
import { useUserStore } from '../stores/user'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { path: '/home', component: Home, meta: { requiresAuth: true } },
  { path: '/current-seat', component: CurrentSeat, meta: { requiresAuth: true } },
  { path: '/seat-select', component: SeatSelect, meta: { requiresAuth: true } },
  { path: '/confirm', component: Confirm, meta: { requiresAuth: true } },
  { path: '/my-reservations', component: MyReservations, meta: { requiresAuth: true } },
  { path: '/checkin', component: CheckIn, meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/checkin-success', component: CheckInSuccess, meta: { requiresAuth: true } },
  { path: '/history', component: History, meta: { requiresAuth: true } },
  { path: '/credit-log', component: CreditLog, meta: { requiresAuth: true } },
  { path: '/notifications', component: Notifications, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresAuth && !userStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
