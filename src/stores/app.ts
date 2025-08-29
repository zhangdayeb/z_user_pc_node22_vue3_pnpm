import { defineStore } from 'pinia'
import { ref } from 'vue'
import { ElLoading, ElMessage } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading'
import api from '@/api'
import { t } from '@/lang'
import type { ApiUser } from 'typings'

// 常量定义
const TOKEN_KEY = 'access_token'
const USER_KEY = 'current_user'

export const useAppStore = defineStore('app', () => {
  // 状态定义
  const loginShow = ref(false)
  const systemConf = ref<any>(null)
  const token = ref<string | null>(null)
  const loadingInstance = ref<LoadingInstance | null>(null)
  const registerConf = ref<any>({})
  const me = ref<ApiUser | null>(null)
  const loadingCount = ref(0) // 支持嵌套loading

  // ==================== 加载状态管理 ====================

  /**
   * 显示全屏加载
   * @param text 加载文本
   * @param fullscreen 是否全屏
   */
  function loading(text: string = '', fullscreen: boolean = true) {
    loadingCount.value++

    if (loadingCount.value === 1) {
      loadingInstance.value = ElLoading.service({
        lock: true,
        fullscreen,
        text: text || t('common.loading'),
        background: 'rgba(0, 0, 0, 0.7)',
        customClass: 'app-loading'
      })
    }
  }

  /**
   * 关闭加载
   */
  function stopLoad() {
    if (loadingCount.value > 0) {
      loadingCount.value--
    }

    if (loadingCount.value === 0 && loadingInstance.value) {
      loadingInstance.value.close()
      loadingInstance.value = null
    }
  }

  /**
   * 强制关闭所有加载
   */
  function forceStopLoad() {
    loadingCount.value = 0
    if (loadingInstance.value) {
      loadingInstance.value.close()
      loadingInstance.value = null
    }
  }

  // ==================== Token 管理 ====================

  /**
   * 获取 Token
   */
  function getToken(): string | null {
    if (!token.value) {
      token.value = localStorage.getItem(TOKEN_KEY)
    }
    return token.value
  }

  /**
   * 设置 Token
   */
  function setToken(tk: string) {
    if (!tk) {
      console.error('尝试设置空的 token')
      return
    }

    token.value = tk
    localStorage.setItem(TOKEN_KEY, tk)

    // 设置 axios 默认 header
    if (api.defaults?.headers) {
      api.defaults.headers.common['Authorization'] = `Bearer ${tk}`
    }
  }

  /**
   * 清除 Token
   */
  function clearToken() {
    token.value = null
    localStorage.removeItem(TOKEN_KEY)

    // 清除 axios header
    if (api.defaults?.headers) {
      delete api.defaults.headers.common['Authorization']
    }
  }

  // ==================== 用户信息管理 ====================

  /**
   * 获取用户信息
   */
  function getUser(): ApiUser | null {
    if (!me.value) {
      const storedUser = localStorage.getItem(USER_KEY)
      if (storedUser) {
        try {
          me.value = JSON.parse(storedUser)
        } catch (error) {
          console.error('解析用户信息失败:', error)
          localStorage.removeItem(USER_KEY)
        }
      }
    }
    return me.value
  }

  /**
   * 设置用户信息
   */
  function setUser(user: ApiUser) {
    if (!user) {
      console.error('尝试设置空的用户信息')
      return
    }

    me.value = user
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }

  /**
   * 清除用户信息
   */
  function clearUser() {
    me.value = null
    localStorage.removeItem(USER_KEY)
  }

  /**
   * 从 API 获取最新用户信息
   */
  async function getMeForApi(): Promise<ApiUser | null> {
    // 先检查 token
    if (!getToken()) {
      console.log('无 token，跳过获取用户信息')
      return null
    }

    try {
      const resp = await api.me()

      if (resp && resp.code === 200 && resp.data) {
        setUser(resp.data)
        return resp.data
      } else {
        console.error('获取用户信息失败:', resp?.message)

        // 如果是认证失败，清除登录状态
        if (resp?.code === 401) {
          logout()
          ElMessage.error('登录已过期，请重新登录')
        }

        return null
      }
    } catch (error: any) {
      console.error('获取用户信息异常:', error)

      // 网络错误处理
      if (error?.response?.status === 401) {
        logout()
        ElMessage.error('登录已过期，请重新登录')
      }

      return null
    }
  }

  /**
   * 更新用户余额（局部更新）
   */
  function updateUserBalance(balance: number) {
    if (me.value) {
      me.value.money = balance
      localStorage.setItem(USER_KEY, JSON.stringify(me.value))
    }
  }

  // ==================== 登录状态管理 ====================

  /**
   * 检查是否已登录
   */
  function isLogin(): boolean {
    return !!getToken() && !!getUser()
  }

  /**
   * 登出
   * @param showMessage 是否显示消息
   */
  function logout(showMessage: boolean = true) {
    // 清除所有数据
    clearToken()
    clearUser()

    // 关闭加载状态
    forceStopLoad()

    // 关闭登录弹窗
    loginShow.value = false

    // 显示消息
    if (showMessage) {
      ElMessage.success('已退出登录')
    }

    // 触发登出事件
    window.dispatchEvent(new CustomEvent('user-logout'))
  }

  /**
   * 检查登录状态，未登录则显示登录弹窗
   */
  function checkLogin(): boolean {
    if (!isLogin()) {
      loginShow.value = true
      return false
    }
    return true
  }

  // ==================== 系统配置管理 ====================

  /**
   * 设置系统配置
   */
  function setSystemConf(conf: any) {
    systemConf.value = conf
  }

  /**
   * 获取系统配置
   */
  function getSystemConf() {
    return systemConf.value
  }

  /**
   * 设置注册配置
   */
  function setRegisterConf(conf: any) {
    registerConf.value = conf
  }

  /**
   * 获取注册配置
   */
  function getRegisterConf() {
    return registerConf.value
  }

  // ==================== 初始化 ====================

  /**
   * 初始化 Store
   */
  async function init() {
    // 恢复 token
    const storedToken = getToken()
    if (storedToken) {
      // 设置 axios 默认 header
      if (api.defaults?.headers) {
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
      }

      // 尝试获取最新用户信息
      await getMeForApi()
    }
  }

  // 返回所有方法和状态
  return {
    // 状态
    loginShow,
    systemConf,
    registerConf,
    me,

    // 加载状态
    loading,
    stopLoad,
    forceStopLoad,

    // Token 管理
    getToken,
    setToken,
    clearToken,

    // 用户管理
    getUser,
    setUser,
    clearUser,
    getMeForApi,
    updateUserBalance,

    // 登录状态
    isLogin,
    logout,
    checkLogin,

    // 系统配置
    setSystemConf,
    getSystemConf,
    setRegisterConf,
    getRegisterConf,

    // 初始化
    init
  }
})
