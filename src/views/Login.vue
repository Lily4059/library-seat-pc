<template>
  <div class="auth-page">
    <div class="auth-shell">
      <header class="auth-header">
        <div class="auth-brand" role="button" tabindex="0" @click="goNav('login')">
          <span class="auth-brand__badge">login</span>
        </div>

        <nav class="auth-nav" aria-label="顶部导航">
          <button class="auth-nav__item" type="button" @click="goNav('home')">首页</button>
          <button class="auth-nav__item" type="button" @click="goNav('guide')">使用说明</button>
          <button class="auth-nav__item" type="button" @click="goNav('about')">关于我们</button>
          <button class="auth-nav__item" type="button" @click="goNav('contact')">联系我们</button>
          <button class="auth-nav__item auth-nav__item--active" type="button" @click="goNav('login')">登录/注册</button>
        </nav>
      </header>

      <main class="auth-main">
        <section class="auth-hero" aria-hidden="true">
          <div class="auth-hero__img" />
        </section>

        <section class="auth-panel">
          <div class="auth-panel__switch" role="tablist" aria-label="登录与注册切换">
            <button
              class="auth-switch__btn"
              :class="{ 'is-active': activeTab === 'login' }"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'login'"
              @click="setTab('login')"
            >
              登录
            </button>
            <button
              class="auth-switch__btn"
              :class="{ 'is-active': activeTab === 'register' }"
              type="button"
              role="tab"
              :aria-selected="activeTab === 'register'"
              @click="setTab('register')"
            >
              注册
            </button>
          </div>

          <div class="auth-panel__content" :class="activeTab === 'login' ? 'is-login' : 'is-register'">
            <div class="auth-panel__box">
              <div class="auth-welcome">
                <div class="auth-welcome__title">{{ activeTab === 'login' ? '欢迎来到' : '欢迎注册' }}</div>
                <div v-if="activeTab === 'login'" class="auth-welcome__subtitle">图书馆预约系统登录页面</div>
                <div v-else class="auth-welcome__subline">
                  <span>已有账号？</span>
                  <button class="auth-link" type="button" @click="setTab('login')">登录</button>
                </div>
              </div>

              <el-form
                ref="authFormRef"
                class="auth-form"
                :model="form"
                :rules="activeRules"
                :validate-on-rule-change="false"
                label-position="top"
                @keyup.enter="handleSubmit"
              >
                <el-form-item prop="username">
                  <el-input
                    v-model="form.username"
                    class="auth-input"
                    placeholder="请输入你的用户名"
                    :prefix-icon="User"
                    :validate-event="hasTriedSubmit"
                  />
                </el-form-item>

                <el-form-item prop="password">
                  <el-input
                    v-model="form.password"
                    class="auth-input"
                    type="password"
                    placeholder="请输入您的密码"
                    show-password
                    :prefix-icon="Lock"
                    :validate-event="hasTriedSubmit"
                  />
                </el-form-item>

                <el-form-item v-if="activeTab === 'register'" prop="confirmPassword">
                  <el-input
                    v-model="form.confirmPassword"
                    class="auth-input"
                    type="password"
                    placeholder="请确认您的密码"
                    show-password
                    :prefix-icon="Lock"
                    :validate-event="hasTriedSubmit"
                  />
                </el-form-item>

                <el-form-item class="auth-actions">
                  <el-button
                    class="auth-submit"
                    :class="{ 'is-register': activeTab === 'register' }"
                    type="primary"
                    :loading="loading"
                    @click="handleSubmit"
                  >
                    {{ activeTab === 'login' ? '登录' : '注册' }}
                  </el-button>
                </el-form-item>
              </el-form>

              <div v-if="activeTab === 'login'" class="demo-tip">测试账号：test / 123456（纯前端演示）</div>
              <div v-else class="auth-welcome__subline auth-welcome__subline--bottom">
                <span>已有账号？</span>
                <button class="auth-link" type="button" @click="setTab('login')">登录</button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useUserStore } from '../stores/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const authFormRef = ref(null)
const activeTab = ref('login')
const hasTriedSubmit = ref(false)

const localUsersKey = 'library-seat-users'

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const loginRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度需为 3-20 位', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 位', trigger: 'blur' }
  ]
})

const registerRules = reactive({
  ...loginRules,
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      validator: (_, value, callback) => {
        if (!value) return callback()
        if (value !== form.password) return callback(new Error('两次输入的密码不一致'))
        callback()
      },
      trigger: 'blur'
    }
  ]
})

const activeRules = computed(() => (activeTab.value === 'login' ? loginRules : registerRules))

const setTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  hasTriedSubmit.value = false
  if (authFormRef.value) authFormRef.value.clearValidate()
}

const goNav = (key) => {
  if (key === 'login') {
    router.push('/login')
    return
  }
  if (key === 'home') {
    router.push('/home')
    return
  }
  ElMessage.info('该页面暂未实现（UI 演示）')
}

const readLocalUsers = () => {
  try {
    const raw = localStorage.getItem(localUsersKey)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeLocalUsers = (users) => {
  localStorage.setItem(localUsersKey, JSON.stringify(users))
}

const findLocalUser = (username) => readLocalUsers().find(u => u?.username === username) || null

const handleLogin = async () => {
  if (!authFormRef.value) return
  await authFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const localUser = findLocalUser(form.username)
      if (localUser) {
        if (localUser.password !== form.password) {
          ElMessage.error('用户名或密码错误')
          return
        }
        userStore.setToken(`local-token-${form.username}`)
        userStore.setUserInfo({ id: localUser.id, name: localUser.username, credit: 100 })
        ElMessage.success('登录成功')
        router.push('/home')
        return
      }

      const res = await axios.post('/api/login', {
        username: form.username,
        password: form.password
      })
      if (res.data.code === 200) {
        userStore.setToken(res.data.data.token)
        userStore.setUserInfo(res.data.data.userInfo)
        ElMessage.success('登录成功')
        router.push('/home')
        return
      }

      ElMessage.error(res.data.message || '登录失败')
    } catch (error) {
      ElMessage.error('网络错误，请稍后重试')
    } finally {
      loading.value = false
    }
  })
}

const handleRegister = async () => {
  if (!authFormRef.value) return
  await authFormRef.value.validate(async (valid) => {
    if (!valid) return
    loading.value = true
    try {
      const username = String(form.username || '').trim()
      const password = String(form.password || '')

      if (username.toLowerCase() === 'test') {
        ElMessage.error('该用户名已被占用')
        return
      }

      const users = readLocalUsers()
      if (users.some(u => u?.username === username)) {
        ElMessage.error('该用户名已被占用')
        return
      }

      const id = Date.now()
      users.push({ id, username, password })
      writeLocalUsers(users)

      form.password = ''
      form.confirmPassword = ''
      ElMessage.success('注册成功，请使用该账号登录')
      setTab('login')
    } finally {
      loading.value = false
    }
  })
}

const handleSubmit = async () => {
  hasTriedSubmit.value = true
  if (activeTab.value === 'login') {
    await handleLogin()
    return
  }
  await handleRegister()
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #ffffff;
  padding: 24px;
  box-sizing: border-box;
}

.auth-shell {
  width: min(1100px, 100%);
  border: 2px solid #7ea0ff;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 10px 30px rgba(12, 27, 74, 0.08);
  overflow: hidden;
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid rgba(126, 160, 255, 0.35);
}

.auth-brand {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.auth-brand__badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid rgba(126, 160, 255, 0.7);
  color: #2da44e;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.auth-nav {
  display: flex;
  gap: 18px;
  align-items: center;
}

.auth-nav__item {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 6px 10px;
  border-radius: 6px;
  color: #1f2a44;
  font-size: 14px;
  cursor: pointer;
}

.auth-nav__item:hover {
  background: rgba(126, 160, 255, 0.12);
}

.auth-nav__item--active {
  border: 1px solid rgba(126, 160, 255, 0.75);
}

.auth-main {
  display: flex;
  min-height: 520px;
}

.auth-hero {
  flex: 1 1 58%;
  border-right: 1px solid rgba(126, 160, 255, 0.35);
  background: #f6f8ff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
}

.auth-hero__img {
  width: 100%;
  height: 100%;
  min-height: 520px;
  background:
    linear-gradient(135deg, rgba(126, 160, 255, 0.2), rgba(126, 160, 255, 0.05)),
    radial-gradient(800px 360px at 30% 30%, rgba(45, 164, 78, 0.18), transparent 55%),
    radial-gradient(700px 360px at 80% 75%, rgba(42, 117, 255, 0.22), transparent 60%);
}

.auth-panel {
  flex: 1 1 42%;
  padding: 18px 22px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.auth-panel__switch {
  align-self: flex-end;
  display: inline-flex;
  border: 1px solid rgba(126, 160, 255, 0.7);
  border-radius: 999px;
  padding: 2px;
  background: rgba(126, 160, 255, 0.08);
}

.auth-switch__btn {
  border: 0;
  background: transparent;
  color: #1f2a44;
  padding: 6px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-size: 13px;
}

.auth-switch__btn.is-active {
  background: rgba(126, 160, 255, 0.22);
  border: 1px solid rgba(126, 160, 255, 0.8);
}

.auth-panel__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 8px 8px 0;
}

.auth-panel__content.is-login .auth-panel__box {
  background: rgba(126, 160, 255, 0.08);
}

.auth-panel__content.is-register .auth-panel__box {
  background: rgba(45, 164, 78, 0.08);
}

.auth-panel__box {
  width: min(380px, 100%);
  margin: 0 auto;
  padding: 16px 18px 14px;
  border: 1px solid rgba(126, 160, 255, 0.45);
  border-radius: 8px;
  box-sizing: border-box;
}

.auth-welcome {
  text-align: center;
  margin-bottom: 18px;
}

.auth-welcome__title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2a44;
  line-height: 1.25;
}

.auth-welcome__subtitle {
  font-size: 18px;
  font-weight: 700;
  color: #1f2a44;
  line-height: 1.25;
}

.auth-welcome__subline {
  margin-top: 10px;
  font-size: 13px;
  color: rgba(31, 42, 68, 0.75);
  display: inline-flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.auth-welcome__subline--bottom {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.auth-link {
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  color: #2a75ff;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.auth-form {
  width: 100%;
  margin: 0;
}

.auth-actions :deep(.el-form-item__content) {
  justify-content: center;
}

.auth-submit {
  width: 100%;
  height: 44px;
  border-radius: 6px;
}

.auth-submit.is-register {
  background: #88a2d8;
  border-color: #88a2d8;
}

.auth-submit.is-register:hover,
.auth-submit.is-register:focus-visible {
  background: #7c96cf;
  border-color: #7c96cf;
}

.auth-input :deep(.el-input__wrapper) {
  border-radius: 0;
  box-shadow: none;
  border: 1px solid rgba(126, 160, 255, 0.75);
  padding: 0 12px;
  height: 44px;
}

.auth-input :deep(.el-input__prefix) {
  color: rgba(31, 42, 68, 0.55);
}

.auth-input :deep(.el-input__inner) {
  font-size: 14px;
}

.auth-form :deep(.el-form-item) {
  margin-bottom: 18px;
}

.auth-form :deep(.el-form-item__error) {
  position: static;
  padding-top: 6px;
}

.demo-tip {
  margin-top: 10px;
  font-size: 12px;
  color: rgba(31, 42, 68, 0.6);
  text-align: center;
}

@media (max-width: 980px) {
  .auth-nav {
    display: none;
  }
  .auth-main {
    flex-direction: column;
  }
  .auth-hero {
    border-right: 0;
    border-bottom: 1px solid rgba(126, 160, 255, 0.35);
  }
  .auth-hero__img {
    min-height: 240px;
  }
}
</style>
