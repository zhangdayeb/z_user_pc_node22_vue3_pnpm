<template>
  <div v-if="configStore.isAppReady">
    <RouterView />
    <TabBar />
    <loginPop :isShow="store.loginShow" />
  </div>
  <div v-else-if="configStore.isConfigLoading" class="loading-container">
    <van-loading type="spinner" size="24px" />
    <p class="loading-text">正在加载站点配置...</p>
  </div>
  <div v-else-if="configStore.configLoadError" class="error-container">
    <van-empty description="配置加载失败">
      <van-button type="primary" size="small" @click="configStore.retryLoadConfig">
        重试
      </van-button>
    </van-empty>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'HomeIndex' })
import TabBar from './components/tab_bar.vue'
import loginPop from '@/components/loginPop.vue'
import { useAppStore } from '@/stores/app'
import { useConfigStore } from '@/stores/config'
import { onMounted, watch } from 'vue'
import { handleTelegramAutoLogin } from '@/utils/tools'

const store = useAppStore()
const configStore = useConfigStore()

// 简化的 Telegram 自动登录
async function tryTelegramLogin() {
  await handleTelegramAutoLogin()
}

// 监听应用就绪状态
watch(
  () => configStore.isAppReady,
  (isReady) => {
    if (isReady) {
      setTimeout(tryTelegramLogin, 1000) // 延迟1秒执行
    }
  },
  { immediate: true }
)

onMounted(() => {
  console.log('🏠 HomeIndex 组件已挂载')

  if (configStore.isAppReady) {
    setTimeout(tryTelegramLogin, 1000)
  }
})
</script>

<style lang="less" scoped>
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.loading-text {
  margin-top: 12px;
  color: #646566;
  font-size: 14px;
}
</style>

<style lang="less">
@import url('@/views/mobile/common.less');
</style>
