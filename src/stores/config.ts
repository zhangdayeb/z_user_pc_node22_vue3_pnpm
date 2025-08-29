import { ref, computed, readonly } from 'vue'
import { defineStore } from 'pinia'
import { ElLoading, ElMessage } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading'
import api from '@/api'

// 站点配置接口定义
interface SiteConfig {
  site_name: string
  site_logo: string
  site_description: string
  customer_service_url: string
  group_prefix: string
  group_name: string
  web_url: string
  admin_url: string
  agent_url: string
  lobby_url: string
  promotion_url: string
  primary_color?: string
  theme?: string
  [key: string]: any // 允许其他动态字段
}

// 配置加载错误接口
interface ConfigLoadError {
  code: number
  message: string
  timestamp: number
  retry?: boolean
}

export const useConfigStore = defineStore('config', () => {
  // ========== 状态定义 ==========

  // 系统配置
  const groupPrefix = ref<string>('')
  const siteConfig = ref<SiteConfig | null>(null)
  const primaryColor = ref<string>('#409EFF')

  // 状态控制
  const isConfigLoaded = ref<boolean>(false)
  const isConfigLoading = ref<boolean>(false)
  const configLoadError = ref<ConfigLoadError | null>(null)
  const configRetryCount = ref<number>(0)
  const maxRetryCount = 3

  // 初始化状态
  const isAppReady = ref<boolean>(false)

  // 加载实例
  const loadingInstance = ref<LoadingInstance | null>(null)

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
    siteConfig.value?.site_name || '个人中心'
  )

  // 站点Logo（带默认值）
  const siteLogo = computed(() =>
    siteConfig.value?.site_logo || '/logo.png'
  )

  // 客服链接
  const customerServiceUrl = computed(() =>
    siteConfig.value?.customer_service_url || ''
  )

  // 是否可以重试
  const canRetry = computed(() =>
    configRetryCount.value < maxRetryCount && !!configLoadError.value
  )

  // ========== 私有方法 ==========

  /**
   * 显示加载状态
   */
  function showLoading(message: string = '加载配置中...') {
    if (!loadingInstance.value) {
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
  function showError(message: string, duration: number = 3000) {
    ElMessage.error({
      message,
      duration,
      showClose: true
    })
  }

  /**
   * 显示成功提示
   */
  function showSuccess(message: string) {
    ElMessage.success({
      message,
      duration: 2000
    })
  }

  /**
   * 获取当前页面URL
   */
  function getCurrentUrl(): string {
    return window.location.origin + window.location.pathname
  }

  /**
   * 调用配置API
   */
  async function fetchSiteConfig(url: string): Promise<SiteConfig> {
    try {
      const response = await api.sysConfig({
        group: 'system',
        url: url,
        platform: 'pc' // 明确指定PC平台
      })

      if (response && response.code === 200 && response.data) {
        return response.data as SiteConfig
      } else {
        throw new Error(response?.message || '获取配置失败')
      }
    } catch (error: any) {
      console.error('配置API调用失败:', error)

      // 网络错误特殊处理
      if (error.message?.includes('Network')) {
        throw new Error('网络连接失败，请检查网络设置')
      }

      throw error
    }
  }

  /**
   * 从缓存加载配置
   */
  function loadConfigFromCache(): SiteConfig | null {
    try {
      const cached = localStorage.getItem('site_config')
      if (cached) {
        const config = JSON.parse(cached)
        // 检查缓存是否过期（24小时）
        if (config.timestamp && Date.now() - config.timestamp < 24 * 60 * 60 * 1000) {
          return config.data
        }
      }
    } catch (error) {
      console.error('加载缓存配置失败:', error)
    }
    return null
  }

  /**
   * 保存配置到缓存
   */
  function saveConfigToCache(config: SiteConfig): void {
    try {
      localStorage.setItem('site_config', JSON.stringify({
        data: config,
        timestamp: Date.now()
      }))
    } catch (error) {
      console.error('保存配置到缓存失败:', error)
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

      // 尝试从缓存加载
      const cachedConfig = loadConfigFromCache()
      if (cachedConfig) {
        updateSiteConfig(cachedConfig)
        console.log('使用缓存的站点配置')

        // 异步更新配置（不阻塞）
        fetchSiteConfig(url || getCurrentUrl()).then(config => {
          updateSiteConfig(config)
          saveConfigToCache(config)
        }).catch(error => {
          console.warn('后台更新配置失败:', error)
        })

        return true
      }

      if (showLoadingUI) {
        showLoading('正在初始化系统配置...')
      }

      // 获取URL
      const targetUrl = url || getCurrentUrl()
      console.log('开始加载站点配置:', targetUrl)

      // 调用API
      const config = await fetchSiteConfig(targetUrl)

      // 更新状态
      updateSiteConfig(config)

      // 保存到缓存
      saveConfigToCache(config)

      console.log('站点配置加载成功:', config)

      if (showLoadingUI) {
        showSuccess('配置加载成功')
      }

      return true

    } catch (error: any) {
      // 错误处理
      const errorInfo: ConfigLoadError = {
        code: error.code || 500,
        message: error.message || '配置加载失败',
        timestamp: Date.now(),
        retry: configRetryCount.value < maxRetryCount
      }

      configLoadError.value = errorInfo
      isConfigLoaded.value = false
      isAppReady.value = false
      configRetryCount.value++

      console.error('站点配置加载失败:', errorInfo)

      if (showLoadingUI) {
        showError(
          errorInfo.message + (errorInfo.retry ? '，将自动重试' : ''),
          errorInfo.retry ? 2000 : 5000
        )
      }

      // 自动重试
      if (errorInfo.retry && showLoadingUI) {
        setTimeout(() => {
          console.log(`自动重试加载配置 (${configRetryCount.value}/${maxRetryCount})`)
          loadSiteConfig(url, showLoadingUI)
        }, 3000)
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

    // 更新相关配置
    if (config.group_prefix) {
      groupPrefix.value = config.group_prefix
    }

    if (config.primary_color) {
      primaryColor.value = config.primary_color
      // 更新CSS变量
      document.documentElement.style.setProperty('--el-color-primary', config.primary_color)
    }

    // 更新页面标题
    if (config.site_name) {
      document.title = config.site_name
    }

    // 更新状态
    isConfigLoaded.value = true
    configLoadError.value = null
    isAppReady.value = true
    configRetryCount.value = 0

    console.log('配置状态已更新:', {
      groupPrefix: groupPrefix.value,
      siteName: config.site_name,
      primaryColor: primaryColor.value,
      isAppReady: isAppReady.value
    })

    // 触发配置更新事件
    window.dispatchEvent(new CustomEvent('config-updated', { detail: config }))
  }

  /**
   * 重置配置
   */
  function resetConfig(): void {
    groupPrefix.value = ''
    siteConfig.value = null
    primaryColor.value = '#409EFF'
    isConfigLoaded.value = false
    configLoadError.value = null
    isAppReady.value = false
    configRetryCount.value = 0

    // 清除缓存
    localStorage.removeItem('site_config')

    console.log('配置已重置')
  }

  /**
   * 重试加载配置
   */
  async function retryLoadConfig(): Promise<boolean> {
    if (!canRetry.value) {
      showError('已达到最大重试次数')
      return false
    }

    console.log(`重试加载配置 (${configRetryCount.value + 1}/${maxRetryCount})`)
    configLoadError.value = null
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
  function getConfigValue<T>(key: keyof SiteConfig | string, defaultValue: T): T {
    if (!siteConfig.value) return defaultValue
    const value = siteConfig.value[key]
    return value !== undefined ? (value as T) : defaultValue
  }

  /**
   * 批量获取配置值
   */
  function getConfigValues(keys: string[]): Record<string, any> {
    const result: Record<string, any> = {}
    keys.forEach(key => {
      result[key] = getConfigValue(key, null)
    })
    return result
  }

  /**
   * 加载系统配置（别名方法，兼容旧代码）
   */
  async function loadConfig(): Promise<void> {
    await loadSiteConfig()
  }

  // ========== 返回公共API ==========
  return {
    // 状态
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
    customerServiceUrl,
    canRetry,

    // 方法
    loadSiteConfig,
    loadConfig,
    updateSiteConfig,
    resetConfig,
    retryLoadConfig,
    setGroupPrefix,
    getConfigValue,
    getConfigValues,
  }
})
