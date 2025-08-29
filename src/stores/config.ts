import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { ElLoading, ElMessage } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading.mjs'
import api from '@/api'

// 站点配置接口定义
interface SiteConfig {
  site_name?: string
  site_wap_logo?: string
  site_description?: string
  customer_service_url?: string
  group_prefix?: string
  group_name?: string
  web_url?: string
  admin_url?: string
  agent_url?: string
  lobby_url?: string
  promotion_url?: string
  primary_color?: string
  [key: string]: any // 允许其他动态字段
}

// 配置加载错误接口
interface ConfigLoadError {
  code: number
  message: string
  timestamp: number
}

export const useConfigStore = defineStore('config', () => {
  // ========== 状态定义 ==========

  // 系统配置
  const groupPrefix = ref<string>('')
  const siteConfig = ref<SiteConfig>({})
  const primaryColor = ref<string>('#409EFF')

  // 状态控制
  const isConfigLoaded = ref<boolean>(false)
  const isConfigLoading = ref<boolean>(false)
  const configLoadError = ref<ConfigLoadError | null>(null)

  // 初始化状态
  const isAppReady = ref<boolean>(false)

  // 加载实例
  const loadingInstance = ref<LoadingInstance | null>(null)

  // ========== 计算属性 ==========

  // 配置是否可用
  const isConfigAvailable = computed(() =>
    isConfigLoaded.value && Object.keys(siteConfig.value).length > 0 && !configLoadError.value
  )

  // 是否显示加载状态
  const shouldShowLoading = computed(() =>
    isConfigLoading.value && !isConfigLoaded.value
  )

  // 站点名称（带默认值）
  const siteName = computed(() =>
    siteConfig.value?.site_name || '娱乐平台'
  )

  // 站点Logo（带默认值）
  const siteLogo = computed(() =>
    siteConfig.value?.site_wap_logo || '/src/assets/logo.png'
  )

  // ========== 私有方法 ==========

  /**
   * 显示加载状态
   */
  function showLoading(message: string = '加载配置中...') {
    loadingInstance.value = ElLoading.service({
      lock: true,
      fullscreen: true,
      text: message,
      background: 'rgba(0, 0, 0, 0.7)',
    })
  }

  /**
   * 隐藏加载状态
   */
  function hideLoading() {
    if (loadingInstance.value) {
      loadingInstance.value.close()
      loadingInstance.value = null
    }
  }

  /**
   * 显示错误提示
   */
  function showError(message: string) {
    ElMessage.error(message)
  }

  /**
   * 获取当前页面URL
   */
  function getCurrentUrl(): string {
    return window.location.href
  }

  /**
   * 调用配置API
   */
  async function fetchSiteConfig(url?: string): Promise<SiteConfig> {
    try {
      const params: any = {
        group: 'system',
        is_mobile: 0 // PC端固定为0
      }

      // 如果提供了URL参数，则添加到请求中
      if (url) {
        params.url = url
      }

      const response:any = await api.sysConfig(params)

      if (response && (response.code === 200 || response.code === 1 || response.code === 0) && response.data) {
        return response.data as SiteConfig
      } else {
        throw new Error(response?.message || '获取配置失败')
      }
    } catch (error: any) {
      console.error('配置API调用失败:', error)
      throw error
    }
  }

  // ========== 公共方法 ==========

  /**
   * 加载站点配置（主要方法）
   */
  async function loadSiteConfig(url?: string, showLoadingUI: boolean = true): Promise<boolean> {
    // 防止重复加载
    if (isConfigLoading.value) {
      console.warn('配置正在加载中，跳过重复请求')
      return false
    }

    try {
      // 设置加载状态
      isConfigLoading.value = true
      configLoadError.value = null

      if (showLoadingUI) {
        showLoading('正在加载站点配置...')
      }

      // 获取URL
      const targetUrl = url || getCurrentUrl()
      console.log('开始加载站点配置:', targetUrl)

      // 调用API
      const config = await fetchSiteConfig(targetUrl)

      // 更新状态
      updateSiteConfig(config)

      console.log('站点配置加载成功:', config)
      return true

    } catch (error: any) {
      // 错误处理
      const errorInfo: ConfigLoadError = {
        code: error.code || 500,
        message: error.message || '配置加载失败',
        timestamp: Date.now()
      }

      configLoadError.value = errorInfo
      isConfigLoaded.value = false
      isAppReady.value = false

      console.error('站点配置加载失败:', errorInfo)

      if (showLoadingUI) {
        showError(errorInfo.message)
      }

      return false

    } finally {
      isConfigLoading.value = false
      if (showLoadingUI) {
        hideLoading()
      }
    }
  }

  /**
   * 更新站点配置
   */
  function updateSiteConfig(config: SiteConfig): void {
    siteConfig.value = config

    // 设置 group_prefix
    if (config.group_prefix) {
      groupPrefix.value = config.group_prefix
      localStorage.setItem('group_prefix', config.group_prefix)
    }

    // 设置主题色
    if (config.primary_color) {
      primaryColor.value = config.primary_color
      document.documentElement.style.setProperty('--el-color-primary', config.primary_color)
    }

    // 设置页面标题
    if (config.site_name) {
      document.title = config.site_name
    }

    // 更新状态
    isConfigLoaded.value = true
    configLoadError.value = null
    isAppReady.value = true

    console.log('配置状态已更新:', {
      groupPrefix: groupPrefix.value,
      siteName: config.site_name,
      isAppReady: isAppReady.value
    })
  }

  /**
   * 重置配置
   */
  function resetConfig(): void {
    groupPrefix.value = ''
    siteConfig.value = {}
    primaryColor.value = '#409EFF'
    isConfigLoaded.value = false
    configLoadError.value = null
    isAppReady.value = false

    // 重置DOM相关
    document.documentElement.style.removeProperty('--el-color-primary')
    localStorage.removeItem('group_prefix')

    console.log('配置已重置')
  }

  /**
   * 重试加载配置
   */
  async function retryLoadConfig(url?: string): Promise<boolean> {
    console.log('重试加载配置')
    resetConfig()
    return await loadSiteConfig(url)
  }

  /**
   * 手动设置 group_prefix（用于调试或特殊情况）
   */
  function setGroupPrefix(prefix: string): void {
    groupPrefix.value = prefix
    localStorage.setItem('group_prefix', prefix)
    console.log('手动设置 group_prefix:', prefix)
  }

  /**
   * 设置主题色
   */
  function setPrimaryColor(color: string): void {
    primaryColor.value = color
    document.documentElement.style.setProperty('--el-color-primary', color)
    console.log('设置主题色:', color)
  }

  /**
   * 获取配置字段值（带默认值）- 推荐使用
   */
  function getConfigValue<T>(key: string, defaultValue: T): T {
    if (!siteConfig.value || Object.keys(siteConfig.value).length === 0) return defaultValue
    const value = siteConfig.value[key]
    return value !== undefined ? (value as T) : defaultValue
  }

  /**
   * 简化的获取配置值方法（兼容旧版本）
   */
  function getConfig(key: string, defaultValue: any = ''): any {
    return getConfigValue(key, defaultValue)
  }

  // ========== 初始化 ==========

  /**
   * 初始化（从本地存储恢复）
   */
  function init(): void {
    // 恢复 group_prefix
    const storedPrefix = localStorage.getItem('group_prefix')
    if (storedPrefix) {
      groupPrefix.value = storedPrefix
    }

    console.log('配置 Store 初始化完成')
  }

  // 自动初始化
  init()

  // ========== 返回公共API ==========
  return {
    // 状态（只读保护）
    groupPrefix: readonly(groupPrefix),
    siteConfig: readonly(siteConfig),
    primaryColor: readonly(primaryColor),
    isConfigLoaded: readonly(isConfigLoaded),
    isConfigLoading: readonly(isConfigLoading),
    configLoadError: readonly(configLoadError),
    isAppReady: readonly(isAppReady),

    // 计算属性
    isConfigAvailable,
    shouldShowLoading,
    siteName,
    siteLogo,

    // 核心方法
    loadSiteConfig,
    updateSiteConfig,
    resetConfig,
    retryLoadConfig,

    // 配置操作方法
    setGroupPrefix,
    setPrimaryColor,
    getConfigValue,
    getConfig, // 兼容方法
  }
})
