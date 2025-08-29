<template>
  <div class="m-tab-bar">
    <van-tabbar
      v-model="active"
      :safe-area-inset-bottom="true"
      :before-change="tabChangeHandler"
    >
      <template v-for="(item, idx) in tabList" :key="idx">
        <van-tabbar-item :to="item.url">
          <span class="m-tab-txt">{{ $t(item.label) }}</span>
          <template #icon>
            <img :src="getImage(item, active, idx)" class="m-tab-icon" />
          </template>
        </van-tabbar-item>
      </template>
    </van-tabbar>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'TabBar' })
import { onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
// import { useAppStore } from '@/stores/app'
// import { storeToRefs } from 'pinia'

// const store = useAppStore()
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const active = ref(0)
const tabList = ref([
  { icon: 'main', url: '/main', label: 'main.index' },
  { icon: 'gift', url: '/gift', label: 'main.gift' },
  { icon: 'kf', url: '/support', label: 'main.kf' },
  { icon: 'mine', url: '/mine', label: 'main.mine' },
])

// const { tabbarActive } = storeToRefs(store)

const tabChangeHandler = (n: number | string) => {
  // console.log('tabbar change:', n, active.value, route)
  switch (n) {
    case 0:
      router.push({ name: 'main' })
      break
    case 1:
      break
    case 2:
      break
    case 3:
      break
    default:
  }
  return true
}

const images = import.meta.glob('@/assets/mobile/tabbar/*.png', { eager: true })

const getImage = (item, active, idx) => {
  const imagePath =
    active === idx
      ? `/src/assets/mobile/tabbar/${item.icon}.act.png`
      : `/src/assets/mobile/tabbar/${item.icon}.png`

  return images[imagePath]?.default || imagePath
}

onMounted(() => {
  try {
    tabList.value.forEach((item, idx) => {
      if (route.path === item.url) {
        active.value = idx
        throw new Error('over')
      }
    })
  } catch (err) {
    console.log((err as Error).message)
  }
})
</script>

<style lang="less" scoped>
.m-tab-bar {
  .m-tab-txt {
    font-size: 10px;
  }
  .m-tab-icon {
    width: 30px;
    height: 30px;
  }
}
</style>
<style scoped>
.van-tabbar-item {
  --van-tabbar-item-icon-margin-bottom: 1px; /* 调整图标和文本之间的间距 */
}
</style>
