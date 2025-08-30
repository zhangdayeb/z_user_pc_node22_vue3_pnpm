<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, ref, computed } from 'vue'
import { ElConfigProvider } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useConfigStore } from '@/stores/config'
import { getElementLocale, getLanguage, setLanguage, type Language } from '@/lang'

// 获取应用配置
const appStore = useAppStore()
const configStore = useConfigStore()

// Element Plus 语言配置
const locale = ref(getElementLocale())

// 监听语言变化事件
window.addEventListener('language-change', () => {
  locale.value = getElementLocale()
})

// 主题配置
const themeConfig = computed(() => ({
  '--el-color-primary': configStore.primaryColor || '#409EFF',
  '--el-color-success': '#67C23A',
  '--el-color-warning': '#E6A23C',
  '--el-color-danger': '#F56C6C',
  '--el-color-info': '#909399',
}))

// 初始化应用
const initApp = async () => {
  try {
    console.log('开始应用初始化...')

    // 加载系统配置
    await configStore.loadSiteConfig()

    // 检查用户登录状态 - 修复关键点
    const jwtToken = localStorage.getItem('access_token')
    const simpleToken = localStorage.getItem('X-Token')

    console.log('检查Token状态:', {
      hasJwtToken: !!jwtToken,
      hasSimpleToken: !!simpleToken,
      jwtPreview: jwtToken ? jwtToken.substring(0, 20) + '...' : null,
      simplePreview: simpleToken ? simpleToken.substring(0, 8) + '...' : null
    })

    // 如果有任意一种token，都尝试获取用户信息
    if (jwtToken || simpleToken) {
      console.log('发现Token，开始获取用户信息...')

      try {
        // 如果只有Simple Token但没有JWT Token，先将Simple Token设置为主要Token
        if (simpleToken && !jwtToken) {
          console.log('只有Simple Token，将其设置为主要Token')
          localStorage.setItem('access_token', simpleToken)
          appStore.setToken(simpleToken)
        }

        // 尝试获取用户信息
        const userInfoResult = await appStore.fetchUserInfo()

        if (userInfoResult) {
          console.log('✅ 用户信息获取成功，自动登录完成')
        } else {
          console.log('❌ 用户信息获取失败，Token可能无效')
          // 清理无效Token
          localStorage.removeItem('access_token')
          localStorage.removeItem('X-Token')
          appStore.logout()
        }
      } catch (error) {
        console.error('获取用户信息时出错:', error)
        // 清理可能无效的Token
        localStorage.removeItem('access_token')
        localStorage.removeItem('X-Token')
        appStore.logout()
      }
    } else {
      console.log('未发现任何Token，保持未登录状态')
    }

    // 初始化语言设置
    const currentLang = getLanguage()
    locale.value = getElementLocale()
    console.log('当前语言设置:', currentLang)
    console.log('应用初始化完成')

  } catch (error) {
    console.error('应用初始化失败:', error)
  }
}

// 应用加载状态
const appLoading = ref(true)

onMounted(async () => {
  await initApp()
  appLoading.value = false
})
</script>

<template>
  <el-config-provider :locale="locale" :size="'default'">
    <div id="app" :style="themeConfig">
      <!-- 应用加载动画 -->
      <div v-if="appLoading" class="app-loading">
        <div class="loading-spinner">
          <div class="spinner"></div>
          <p>正在加载...</p>
        </div>
      </div>

      <!-- 主应用内容 -->
      <RouterView v-else v-slot="{ Component, route }">
        <transition name="fade" mode="out-in">
          <component :is="Component" :key="route.path" />
        </transition>
      </RouterView>
    </div>
  </el-config-provider>
</template>

<style lang="less">
// 全局样式重置
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial,
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  width: 100%;
  height: 100%;
}

.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #409eff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-spinner p {
  color: #666;
  font-size: 14px;
}

/* 页面过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
