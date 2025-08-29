import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading'
import api from '@/api'
import router from '@/router'

// 常量定义
const TOKEN_KEY = 'access_token'
const USER_KEY = 'user_info'

export const useAppStore = defineStore('app', () => {
  // ========== 状态定义 ==========
  const token = ref<string>('')
  const userInfo = ref<any>(null)
  const loadingInstance = ref<LoadingInstance | null>(null)

  // ========== Token 管理 ==========

  // 初始化 token
  function initToken() {
    const storedToken = localStorage.getItem(TOKEN_KEY)
    if (storedToken) {
      token.value = storedToken
    }
  }

  // 设置 token
  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem(TOKEN_KEY, newToken)
  }

  // 清除 token
  function clearToken() {
    token.value = ''
    localStorage.removeItem(TOKEN_KEY)
  }

  // ========== 用户信息管理 ==========

  // 初始化用户信息
  function initUserInfo() {
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      try {
        userInfo.value = JSON.parse(storedUser)
      } catch (e) {
        localStorage.removeItem(USER_KEY)
      }
    }
  }

  // 设置用户信息
  function setUserInfo(info: any) {
    userInfo.value = info
    localStorage.setItem(USER_KEY, JSON.stringify(info))
  }

  // 清除用户信息
  function clearUserInfo() {
    userInfo.value = null
    localStorage.removeItem(USER_KEY)
  }

  // 获取用户信息（从API）
  async function fetchUserInfo() {
    try {
      const res: any = await api.getUserInfo()
      if (res?.code === 200 || res?.code === 1 || res?.code === 0) {
        setUserInfo(res.data)
        return res.data
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
    return null
  }

  // ========== 登录状态管理 ==========

  // 检查是否登录
  function isLogin(): boolean {
    return !!token.value
  }

  // 登录
  async function login(username: string, password: string) {
    try {
      const res: any = await api.login({ username, password })
      if (res?.code === 200 || res?.code === 1 || res?.code === 0) {
        // 保存 token
        setToken(res.data.token)

        // 保存用户信息
        if (res.data.user) {
          setUserInfo(res.data.user)
        } else {
          // 如果登录接口没返回用户信息，单独获取
          await fetchUserInfo()
        }

        ElMessage.success('登录成功')
        return true
      }
      return false
    } catch (error) {
      console.error('登录失败:', error)
      return false
    }
  }

  // 登出
  function logout() {
    clearToken()
    clearUserInfo()
    ElMessage.success('已退出登录')
    router.push('/login')
  }

  // ========== Loading 管理 ==========

  // 显示 loading
  function showLoading(text: string = '加载中...') {
    loadingInstance.value = ElLoading.service({
      lock: true,
      text,
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }

  // 隐藏 loading
  function hideLoading() {
    if (loadingInstance.value) {
      loadingInstance.value.close()
      loadingInstance.value = null
    }
  }

  // ========== 初始化 ==========

  // 初始化
  function init() {
    initToken()
    initUserInfo()
  }

  // 自动初始化
  init()

  return {
    // 状态
    token,
    userInfo,

    // Token 管理
    setToken,
    clearToken,

    // 用户信息
    setUserInfo,
    clearUserInfo,
    fetchUserInfo,

    // 登录状态
    isLogin,
    login,
    logout,

    // Loading
    showLoading,
    hideLoading
  }
})
