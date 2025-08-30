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

/**
 * 处理URL中的Token参数
 */
function handleUrlToken() {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const urlToken = urlParams.get('token')

    // 检查是否是有效的Simple Token（32位随机字符串）
    if (urlToken && urlToken.length === 32 && /^[a-zA-Z0-9]{32}$/.test(urlToken)) {
      // 存储到localStorage
      localStorage.setItem('X-Token', urlToken)

      console.log('URL Token已存储:', urlToken.substring(0, 8) + '...')

      // 清除URL中的token参数，避免token暴露
      const url = new URL(window.location.href)
      url.searchParams.delete('token')

      // 使用replaceState避免在浏览器历史中留下带token的URL
      window.history.replaceState({}, document.title, url.toString())

      console.log('URL已清理，token参数已移除')
    }
  } catch (error) {
    console.warn('处理URL Token时发生错误:', error)
  }
}

/**
 * 应用初始化
 */
async function bootstrap() {
  // 首先处理URL Token（在应用启动之前）
  handleUrlToken()

  const app = createApp(App)

  // 注册核心插件（顺序很重要）
  app.use(createPinia()) // 必须在其他 store 使用前注册
  app.use(router)
  app.use(i18n) // 注册 i18n
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

  // 挂载应用
  app.mount('#app')

  // 开发环境提示
  if (import.meta.env.DEV) {
    console.log('🚀 应用已启动 (开发模式)')
    console.log('📝 Vue:', app.version)
    console.log('🔗 API:', import.meta.env.VITE_API_BASE_URL)

    // 调试信息：显示当前存储的Token
    const jwtToken = localStorage.getItem('access_token')
    const simpleToken = localStorage.getItem('X-Token')
    console.log('💾 JWT Token:', jwtToken ? jwtToken.substring(0, 20) + '...' : '无')
    console.log('💾 Simple Token:', simpleToken ? simpleToken.substring(0, 8) + '...' : '无')
  }
}

// 启动应用
bootstrap().catch(err => {
  console.error('❌ 应用启动失败:', err)
  // 显示错误页面
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
