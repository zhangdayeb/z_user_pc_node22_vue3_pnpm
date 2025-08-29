<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted, ref, computed, watch } from 'vue'
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
window.addEventListener('language-change', (event: any) => {
  locale.value = getElementLocale()
})

// 主题配置
const themeConfig = computed(() => ({
  // Element Plus 主题变量
  '--el-color-primary': configStore.primaryColor || '#409EFF',
  '--el-color-success': '#67C23A',
  '--el-color-warning': '#E6A23C',
  '--el-color-danger': '#F56C6C',
  '--el-color-info': '#909399',
}))

// 初始化应用
const initApp = async () => {
  try {
    // 加载系统配置
    await configStore.loadConfig()

    // 检查用户登录状态
    const token = localStorage.getItem('token')
    if (token) {
      await appStore.getMeForApi()
    }

    // 初始化语言设置
    const currentLang = getLanguage()
    locale.value = getElementLocale()
    console.log('当前语言设置:', currentLang)

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
  min-width: 1200px;
  position: relative;
  background-color: #f5f7fa;
}

// 应用加载动画
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.95);
  z-index: 9999;

  .loading-spinner {
    text-align: center;

    .spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto 20px;
      border: 4px solid #f3f3f3;
      border-top: 4px solid #409eff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    p {
      color: #606266;
      font-size: 14px;
    }
  }
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

// 路由切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

// 滚动条样式
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;

  &:hover {
    background: #a8a8a8;
  }
}
</style>
