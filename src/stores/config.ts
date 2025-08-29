import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { showLoadingToast, showFailToast, type ToastWrapperInstance } from 'vant'
import { ElLoading, ElMessage } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading.mjs'
import { mobileFunc } from '@/utils/tools'
import api from '@/api'

// 站点配置接口定义
interface SiteConfig {
  site_name: string
  site_wap_logo: string
  site_description: string
  customer_service_url: string
  group_prefix: string
  group_name: string
  web_url: string
  admin_url: string
  agent_url: string
  lobby_url: string
  promotion_url: string
  is_mobile: number
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
  const siteConfig = ref<SiteConfig | null>(null)

  // 状态控制
  const isConfigLoaded = ref<boolean>(false)
  const isConfigLoading = ref<boolean>(false)
  const configLoadError = ref<ConfigLoadError | null>(null)

  // 初始化状态
  const isAppReady = ref<boolean>(false)

  // 加载实例
  const loadingInstance = ref<ToastWrapperInstance | LoadingInstance | null>(null)

  // ========== 计算属性 ==========

  // 配置是否可用
  const isConfigAvailable = computed(() =>
    isConfigLoaded.value && siteConfig.value !== null && !configLoadError.value
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
    if (mobileFunc()) {
      loadingInstance.value = showLoadingToast({
        message,
        duration: 0,
        overlay: true,
        forbidClick: true,
        loadingType: 'spinner',
      })
    } else {
      loadingInstance.value = ElLoading.service({
        lock: true,
        fullscreen: true,
        text: message,
        background: 'rgba(0, 0, 0, 0.7)',
      })
    }
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
    if (mobileFunc()) {
      showFailToast(message)
    } else {
      ElMessage.error(message)
    }
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
  async function fetchSiteConfig(url: string): Promise<SiteConfig> {
    try {
      const response = await api.sysConfig({
        group: 'system',
        url: url,
        is_mobile: mobileFunc() ? 1 : 0
      })

      if (response && response.code === 200 && response.data) {
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

    if (config.group_prefix) {
      groupPrefix.value = config.group_prefix
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
    siteConfig.value = null
    isConfigLoaded.value = false
    configLoadError.value = null
    isAppReady.value = false

    console.log('配置已重置')
  }

  /**
   * 重试加载配置
   */
  async function retryLoadConfig(): Promise<boolean> {
    console.log('重试加载配置')
    resetConfig()
    return await loadSiteConfig()
  }

  /**
   * 手动设置 group_prefix（用于调试或特殊情况）
   */
  function setGroupPrefix(prefix: string): void {
    groupPrefix.value = prefix
    console.log('手动设置 group_prefix:', prefix)
  }

  /**
   * 获取配置字段值（带默认值）
   */
  function getConfigValue<T>(key: keyof SiteConfig, defaultValue: T): T {
    if (!siteConfig.value) return defaultValue
    const value = siteConfig.value[key]
    return value !== undefined ? (value as T) : defaultValue
  }

  // ========== 返回公共API ==========
  return {
    // 状态
    groupPrefix: readonly(groupPrefix),
    siteConfig: readonly(siteConfig),
    isConfigLoaded: readonly(isConfigLoaded),
    isConfigLoading: readonly(isConfigLoading),
    configLoadError: readonly(configLoadError),
    isAppReady: readonly(isAppReady),

    // 计算属性
    isConfigAvailable,
    shouldShowLoading,
    siteName,
    siteLogo,

    // 方法
    loadSiteConfig,
    updateSiteConfig,
    resetConfig,
    retryLoadConfig,
    setGroupPrefix,
    getConfigValue,
  }
})
