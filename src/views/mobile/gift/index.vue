<template>
  <div class="m-gift">
    <van-nav-bar :title="$t('youhuihuodong')" />
    <van-tabs v-model:active="active">
      <van-tab
        v-for="(item, idx) in tabs"
        :key="idx"
        :title="item.title === 'all' ? $t('all') : item.title"
      >
        <div class="m-tab-panel" v-if="idx === 0">
          <!-- 全部活动 -->
          <div
            class="m-tab-item"
            v-for="(it, ix) in list"
            :key="ix"
            @click="clickHandler(it)"
          >
            <van-image
              :src="getImgUrl(it.thumb_url ?? '')"
              fit="contain"
              class="m-img"
            ></van-image>
            <div class="m-title">{{ it.title }}</div>
            <div class="m-description" v-if="it.description">{{ it.description }}</div>
          </div>
        </div>
        <div class="m-tab-panel" v-else>
          <!-- 按类型显示活动 -->
          <div
            class="m-tab-item"
            v-for="(it, ix) in list"
            :key="ix"
            v-show="it.type === item.value"
            @click="clickHandler(it)"
          >
            <van-image
              :src="getImgUrl(it.thumb_url ?? '')"
              fit="contain"
              class="m-img"
            ></van-image>
            <div class="m-title">{{ it.title }}</div>
            <div class="m-description" v-if="it.description">{{ it.description }}</div>
          </div>
        </div>
      </van-tab>
    </van-tabs>
    <van-empty :description="$t('noRecord')" v-if="tabs.length <= 0" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '@/api'
import { getImgUrl } from '@/utils/tools'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'

defineOptions({ name: 'GiftIndex' })

interface ActivityType {
  id: number
  name: string
}

interface ActivityInfo {
  id: number
  type: number
  title: string
  description: string
  thumb_url: string
  author: string
  created_at: string
  updated_at: string
}

interface TabInfo {
  title: string
  value: number
}

const router = useRouter()
const store = useAppStore()
const active = ref(0)
const tabs = ref<TabInfo[]>([])
const list = ref<ActivityInfo[]>([])

// 获取活动类型列表
async function getActivityTypes() {
  try {
    const resp = await api.activityTypeList()
    console.log('activity types resp:', resp)
    // 根据你提供的数据结构，应该是 resp.data 而不是 resp.data.data
    if (resp && resp.data) {
      const types = resp.data.list || []

      // 构建标签页，先添加"全部"
      const tmp: TabInfo[] = [{ value: -1, title: 'all' }]

      // 添加各个类型标签
      types.forEach((type: ActivityType) => {
        tmp.push({
          title: type.name,
          value: type.id
        })
      })

      tabs.value = tmp
      console.log('构建的标签页:', tabs.value)
    }
  } catch (err) {
    console.error('获取活动类型失败:', err)
    showToast('获取活动类型失败')
  }
}

// 获取活动列表
async function getActivities() {
  try {
    const resp = await api.activityList({
      page: 1,
      limit: 100
    })
    console.log('activities resp:', resp)

    // 同样修正数据访问路径
    if (resp && resp.data) {
      list.value = resp.data.list || []
      console.log('活动列表:', list.value)
    }
  } catch (err) {
    console.error('获取活动列表失败:', err)
    showToast('获取活动列表失败')
  }
}

function clickHandler(activity: ActivityInfo) {
  console.log('点击活动:', activity)
  router.push({ name: 'activity', params: { id: activity.id } })
}

onMounted(async () => {
  store.loading()
  try {
    // 并行请求活动类型和活动列表
    await Promise.all([
      getActivityTypes(),
      getActivities()
    ])
  } finally {
    store.stopLoad()
  }
})
</script>

<style scoped lang="less">
.m-gift {
  display: flex;
  flex-direction: column;
  flex: 1;
  background: var(--color-m-background);

  .m-tab-panel {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: 0px;

    .m-tab-item {
      margin: 15px 0px 0px 0px;
      display: flex;
      flex-direction: column;
      border-radius: 8px;
      background: var(--m-label-gb);
      width: 100%;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }

      .m-img {
        height: 54px;
        width: 100%;
        border-radius: 8px 8px 0 0;
      }

      .m-title {
        margin: 15px 12px 8px 12px;
        color: var(--color-m-text);
        font-weight: 500;
        font-size: 16px;
      }

      .m-description {
        margin: 0 12px 15px 12px;
        color: var(--color-m-text-secondary, #999);
        font-size: 14px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
    }
  }
}
</style>

<style lang="less">
.m-gift {
  .van-tabs__nav--line {
    padding-bottom: 0px;
  }
  .van-tabs__line {
    bottom: 0px;
  }
}
</style>
