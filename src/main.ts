import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './lang'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { setLanguage, type Language } from './lang'

// 样式导入
import 'element-plus/dist/index.css'
import './styles/index.less' // 自定义全局样式

// URL语言代码映射到项目语言代码
const URL_LANG_MAP: Record<string, Language> = {
  'zh': 'zh-CN',
  'cn': 'zh-CN',
  'zh-cn': 'zh-CN',
  'zh_cn': 'zh-CN',
  'tw': 'zh-TW',
  'hk': 'zh-TW',
  'zh-tw': 'zh-TW',
  'zh_tw': 'zh-TW',
  'en': 'en-US',
  'us': 'en-US',
  'en-us': 'en-US',
  'en_us': 'en-US',
  'th': 'th-TH',
  'th-th': 'th-TH',
  'th_th': 'th-TH',
  'vi': 'vi-VN',
  'vn': 'vi-VN',
  'vi-vn': 'vi-VN',
  'vi_vn': 'vi-VN',
  'ko': 'ko-KR',
  'kr': 'ko-KR',
  'ko-kr': 'ko-KR',
  'ko_kr': 'ko-KR',
}

/**
 * 处理URL中的语言参数
 */
function handleUrlLanguage() {
  try {
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang')

    if (urlLang) {
      // 转换为小写进行匹配
      const langKey = urlLang.toLowerCase()
      const targetLang = URL_LANG_MAP[langKey]

      if (targetLang) {
        // 设置语言
        setLanguage(targetLang)
        console.log('✅ URL语言已设置:', `${urlLang} -> ${targetLang}`)

        // 触发语言变更事件（确保组件能响应）
        window.dispatchEvent(new CustomEvent('language-change', {
          detail: targetLang
        }))
      } else {
        console.warn('⚠️  不支持的语言代码:', urlLang)
        console.log('💡 支持的语言代码:', Object.keys(URL_LANG_MAP).join(', '))
      }

      // 清除URL中的lang参数
      const url = new URL(window.location.href)
      url.searchParams.delete('lang')

      // 使用replaceState避免在浏览器历史中留下带lang的URL
      window.history.replaceState({}, document.title, url.toString())
      console.log('🧹 URL已清理，lang参数已移除')
    }
  } catch (error) {
    console.warn('处理URL语言参数时发生错误:', error)
  }
}

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

      console.log('✅ URL Token已存储:', urlToken.substring(0, 8) + '...')

      // 清除URL中的token参数，避免token暴露
      const url = new URL(window.location.href)
      url.searchParams.delete('token')

      // 使用replaceState避免在浏览器历史中留下带token的URL
      window.history.replaceState({}, document.title, url.toString())

      console.log('🧹 URL已清理，token参数已移除')
    }
  } catch (error) {
    console.warn('处理URL Token时发生错误:', error)
  }
}

/**
 * 处理所有URL参数
 */
function handleUrlParams() {
  try {
    const urlParams = new URLSearchParams(window.location.search)

    // 记录处理前的参数
    if (urlParams.size > 0) {
      const params = Array.from(urlParams.entries())
        .map(([key, value]) => `${key}=${key === 'token' ? value.substring(0, 8) + '...' : value}`)
        .join('&')
      console.log('🔍 检测到URL参数:', params)
    }

    // 处理语言参数（优先处理，因为可能影响应用初始化）
    handleUrlLanguage()

    // 处理Token参数
    handleUrlToken()

    // 如果还有其他参数需要处理，可以在这里扩展
    // handleUrlOtherParams()

  } catch (error) {
    console.warn('处理URL参数时发生错误:', error)
  }
}

/**
 * 应用初始化
 */
async function bootstrap() {
  // 首先处理所有URL参数（在应用启动之前）
  handleUrlParams()

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

    // 调试信息：显示当前存储的Token和语言
    const jwtToken = localStorage.getItem('access_token')
    const simpleToken = localStorage.getItem('X-Token')
    const currentLang = localStorage.getItem('lang')

    console.log('💾 JWT Token:', jwtToken ? jwtToken.substring(0, 20) + '...' : '无')
    console.log('💾 Simple Token:', simpleToken ? simpleToken.substring(0, 8) + '...' : '无')
    console.log('🌐 当前语言:', currentLang || '默认(zh-CN)')

    // 显示支持的语言代码
    console.log('🗣️  支持的URL语言代码:', Object.keys(URL_LANG_MAP).join(', '))
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
