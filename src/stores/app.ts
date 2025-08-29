import { defineStore } from 'pinia'
import { ref, readonly } from 'vue'
import { ElLoading } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading.mjs'
import api from '@/api'
import i18n from '@/lang'
import type { ApiUser } from 'typings'

// 常量定义
const TOKEN_KEY = 'access_token'
const USER_KEY = 'current_user' // 保持与原版一致

export const useAppStore = defineStore('app', () => {
  // ========== 状态定义 ==========
  const token = ref<string | null>(null)
  const me = ref<ApiUser | null>(null)
  const systemConf = ref<unknown>(null)
  const registerConf = ref<object>({})
  const loadingInstance = ref<LoadingInstance | null>(null)

  // ========== Token 管理 ==========

  /**
   * 获取Token
   */
  function getToken(): string | null {
    if (!token.value) {
      token.value = localStorage.getItem(TOKEN_KEY)
    }
    return token.value
  }

  /**
   * 设置Token
   */
  function setToken(tk: string): void {
    token.value = tk
    localStorage.setItem(TOKEN_KEY, tk)
  }

  /**
   * 清除Token
   */
  function clearToken(): void {
    token.value = null
    localStorage.removeItem(TOKEN_KEY)
  }

  // ========== 用户信息管理 ==========

  /**
   * 获取用户信息
   */
  function getUser(): ApiUser | null {
    if (!me.value) {
      const tmp = localStorage.getItem(USER_KEY)
      if (tmp) {
        try {
          const p = JSON.parse(tmp)
          me.value = p
        } catch (err) {
          console.log('解析用户信息出错:', err)
          localStorage.removeItem(USER_KEY)
        }
      }
    }
    return me.value
  }

  /**
   * 设置用户信息
   */
  function setUser(u: ApiUser): void {
    me.value = u
    localStorage.setItem(USER_KEY, JSON.stringify(u))
  }

  /**
   * 从API获取用户信息
   */
  async function getMeForApi(): Promise<void> {
    try {
      const resp:any = await api.getUserInfo()
      if (resp && resp.code === 200 && resp.data) {
        me.value = resp.data
        localStorage.setItem(USER_KEY, JSON.stringify(resp.data))
      }
    } catch (err) {
      console.log('获取用户信息出错:', err)
    }
  }

  /**
   * 清除用户信息
   */
  function clearUser(): void {
    me.value = null
    localStorage.removeItem(USER_KEY)
  }

  // ========== 登录状态管理 ==========

  /**
   * 检查是否登录
   */
  function isLogin(): boolean {
    console.log('user', getUser())
    return getUser() != null
  }

  /**
   * 登出 - 清除本地数据
   */
  function logout(): void {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    token.value = null
    me.value = null
  }

  // ========== Loading 管理 (PC端专用) ==========

  /**
   * 显示Loading - PC端使用Element Plus
   */
  function loading(message?: string): void {
    const loadingText = message || i18n.global.t('loading')

    loadingInstance.value = ElLoading.service({
      lock: false,
      fullscreen: true,
      text: loadingText,
      background: 'rgba(0, 0, 0, 0.7)',
    })
  }

  /**
   * 停止Loading
   */
  function stopLoad(): void {
    if (loadingInstance.value) {
      loadingInstance.value.close()
      loadingInstance.value = null
    }
  }

  // ========== 配置管理 ==========

  /**
   * 设置系统配置
   */
  function setSystemConf(conf: unknown): void {
    systemConf.value = conf
  }

  /**
   * 获取系统配置
   */
  function getSystemConf(): unknown {
    return systemConf.value
  }

  /**
   * 设置注册配置
   */
  function setRegisterConf(conf: object): void {
    registerConf.value = conf
  }

  /**
   * 获取注册配置
   */
  function getRegisterConf(): object {
    return registerConf.value
  }

  // ========== 实用功能方法 ==========

  /**
   * 强制刷新用户信息
   */
  async function refreshUserInfo(): Promise<boolean> {
    try {
      await getMeForApi()
      return true
    } catch (error) {
      console.error('刷新用户信息失败:', error)
      return false
    }
  }

  /**
   * 获取用户信息 - index.vue中使用的方法名
   */
  const fetchUserInfo = async (): Promise<boolean> => {
    return await refreshUserInfo()
  }

  /**
   * 设置用户信息 - index.vue中使用的方法名
   */
  const setUserInfo = (info: ApiUser): void => {
    setUser(info)
  }

  /**
   * 检查Token有效性
   */
  function hasValidToken(): boolean {
    const token = getToken()
    return !!token && token.length > 0
  }

  /**
   * 重置所有状态
   */
  function resetAll(): void {
    clearToken()
    clearUser()
    systemConf.value = null
    registerConf.value = {}
    stopLoad()
  }

  // ========== 初始化 ==========

  /**
   * 初始化Store
   */
  function init(): void {
    // 初始化时获取token和用户信息
    getToken()
    getUser()

    console.log('App Store 初始化完成')
  }

  // 自动初始化
  init()

  // ========== 返回公共API ==========
  return {
    // 状态 (只读保护)
    token: readonly(token),
    me: readonly(me),
    userInfo: readonly(me), // index.vue中使用userInfo
    systemConf: readonly(systemConf),
    registerConf: readonly(registerConf),

    // 核心方法 (保持与原版一致)
    loading,
    stopLoad,
    isLogin,
    getToken,
    setToken,
    getMeForApi,
    getUser,
    setUser,
    logout,

    fetchUserInfo,
    setUserInfo,

    // 扩展功能方法
    clearToken,
    clearUser,
    setSystemConf,
    getSystemConf,
    setRegisterConf,
    getRegisterConf,
    refreshUserInfo,
    hasValidToken,
    resetAll,
  }
})
