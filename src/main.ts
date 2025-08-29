import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './lang'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 样式导入
import 'element-plus/dist/index.css'
import './styles/index.less' // 自定义全局样式

import { useConfigStore } from '@/stores/config'
import { setPageTitle } from '@/utils/tools'

/**
 * 应用初始化
 */
async function bootstrap() {
  const app = createApp(App)

  // 注册核心插件
  app.use(createPinia()) // 必须在其他 store 使用前注册
  app.use(router)
  app.use(i18n)
  app.use(ElementPlus, {
    size: 'default',
    zIndex: 3000,
  })

  // 注册所有 Element Plus 图标
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  // 全局错误处理
  app.config.errorHandler = (err, instance, info) => {
    console.error('全局错误捕获:', err, info)
    // 可以在这里添加错误上报逻辑
  }

  // 全局属性配置
  app.config.globalProperties.$filters = {
    /**
     * 金额格式化
     */
    formatMoney(value: number | string): string {
      const num = typeof value === 'string' ? parseFloat(value) : value
      if (isNaN(num)) return '0.00'
      return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    /**
     * 日期格式化
     */
    formatDate(value: string | Date): string {
      if (!value) return ''
      const date = new Date(value)
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }

  try {
    // 初始化配置
    const configStore = useConfigStore()
    await configStore.loadSiteConfig()

    // 设置页面标题
    if (configStore.siteName) {
      setPageTitle(configStore.siteName)
    }

    console.log('✅ 应用配置初始化完成', {
      siteName: configStore.siteName,
      apiUrl: import.meta.env.VITE_API_BASE_URL,
      mode: import.meta.env.MODE
    })
  } catch (error) {
    console.error('❌ 配置初始化失败:', error)
    // 配置加载失败不阻止应用启动，让应用内部处理错误
  }

  // 挂载应用
  app.mount('#app')

  // 开发环境提示
  if (import.meta.env.DEV) {
    console.log('🚀 应用已启动 (开发模式)')
    console.log('📝 Vue:', app.version)
  }
}

// 启动应用
bootstrap().catch(err => {
  console.error('❌ 应用启动失败:', err)
  // 可以在这里显示一个错误页面
  document.getElementById('app')!.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      font-family: sans-serif;
    ">
      <h1 style="color: #f56c6c;">应用启动失败</h1>
      <p style="color: #909399;">请刷新页面重试，如果问题持续存在，请联系管理员</p>
      <button
        onclick="location.reload()"
        style="
          margin-top: 20px;
          padding: 10px 20px;
          background: #409eff;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        "
      >
        刷新页面
      </button>
    </div>
  `
})
