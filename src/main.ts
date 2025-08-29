import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import i18n from './lang'
import Vant, { Lazyload } from 'vant'
import ElementPlus from 'element-plus'

import { mobileFunc } from '@/utils/tools'
import { useConfigStore } from '@/stores/config'

async function bootstrap() {
  const app = createApp(App)
  app.use(router)

  if (mobileFunc()) {
    await import('vant/lib/index.css')
    app.use(Vant)
    app.use(Lazyload)
  } else {
    await import('element-plus/dist/index.css')
    app.use(ElementPlus)
  }

  app.use(i18n)
  app.use(createPinia())

  // 初始化配置
  try {
    const configStore = useConfigStore()
    await configStore.loadSiteConfig()

    // 设置页面标题
    if (configStore.siteName) {
      document.title = configStore.siteName
    }

    console.log('应用配置初始化完成')
  } catch (error) {
    console.error('配置初始化失败:', error)
    // 即使配置失败也要挂载应用，让错误处理在组件中进行
  }

  app.mount('#app')
}

bootstrap()
