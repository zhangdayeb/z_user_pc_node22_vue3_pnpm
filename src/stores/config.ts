import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'

// 站点配置接口
interface SiteConfig {
  site_name?: string
  site_logo?: string
  site_description?: string
  customer_service_url?: string
  group_prefix?: string
  primary_color?: string
  [key: string]: any
}

export const useConfigStore = defineStore('config', () => {
  // ========== 状态定义 ==========
  const siteConfig = ref<SiteConfig>({})
  const groupPrefix = ref<string>('')
  const primaryColor = ref<string>('#409EFF')
  const isLoaded = ref<boolean>(false)

  // ========== 配置管理 ==========

  // 加载站点配置
  async function loadSiteConfig() {
    try {
      const res: any = await api.sysConfig()
      if (res?.code === 200 || res?.code === 1 || res?.code === 0) {
        const config = res.data || {}

        // 更新配置
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

        isLoaded.value = true
        return true
      }
    } catch (error) {
      console.error('加载站点配置失败:', error)
    }
    return false
  }

  // 设置 group_prefix（手动）
  function setGroupPrefix(prefix: string) {
    groupPrefix.value = prefix
    localStorage.setItem('group_prefix', prefix)
  }

  // 设置主题色
  function setPrimaryColor(color: string) {
    primaryColor.value = color
    document.documentElement.style.setProperty('--el-color-primary', color)
  }

  // 获取配置值
  function getConfig(key: string, defaultValue: any = '') {
    return siteConfig.value[key] || defaultValue
  }

  // ========== 初始化 ==========

  // 初始化（从本地存储恢复）
  function init() {
    // 恢复 group_prefix
    const storedPrefix = localStorage.getItem('group_prefix')
    if (storedPrefix) {
      groupPrefix.value = storedPrefix
    }
  }

  // 自动初始化
  init()

  return {
    // 状态
    siteConfig,
    groupPrefix,
    primaryColor,
    isLoaded,

    // 方法
    loadSiteConfig,
    setGroupPrefix,
    setPrimaryColor,
    getConfig
  }
})
