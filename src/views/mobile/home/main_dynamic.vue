<template>
  <component :is="mainComponent" v-if="mainComponent" />
  <div v-else class="loading-container">
    <van-loading type="spinner" size="24px" />
    <p class="loading-text">正在加载主页...</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted, defineAsyncComponent, shallowRef } from 'vue'
import { useConfigStore } from '@/stores/config'

defineOptions({ name: 'MainDynamic' })

const mainComponent = shallowRef(null)

// 预定义组件映射
const componentMap = {
  'main_game': defineAsyncComponent(() => import('./main_game.vue')),
  'main_supplier': defineAsyncComponent(() => import('./main_supplier.vue'))
}

onMounted(async () => {
  try {
    const configStore = useConfigStore()

    // 等待配置加载完成
    if (!configStore.isConfigLoaded) {
      console.log('等待配置加载...')
      const timeout = 10000 // 10秒超时
      const startTime = Date.now()

      await new Promise((resolve, reject) => {
        const checkConfig = () => {
          if (configStore.isConfigLoaded) {
            resolve(true)
          } else if (Date.now() - startTime > timeout) {
            reject(new Error('配置加载超时'))
          } else {
            setTimeout(checkConfig, 100)
          }
        }
        checkConfig()
      })
    }

    // 获取 main_style 配置
    const mainStyle = configStore.getConfigValue('main_style', 1)
    console.log('获取到 main_style:', mainStyle)

    // 映射规则：1 = main_game, 2 = main_supplier
    const componentType = (mainStyle === 2 || mainStyle === '2') ? 'main_supplier' : 'main_game'

    // 加载对应组件
    mainComponent.value = componentMap[componentType]

    console.log('✅ 动态加载主页组件:', componentType)

  } catch (error) {
    console.error('❌ 加载主页组件失败:', error)
    // 默认加载 main_game 组件
    mainComponent.value = componentMap['main_game']
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  gap: 12px;
}

.loading-text {
  color: #646566;
  font-size: 14px;
}
</style>
