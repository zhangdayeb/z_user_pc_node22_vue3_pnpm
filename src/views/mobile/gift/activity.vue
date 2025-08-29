<template>
  <div class="m-activity">
    <van-nav-bar
      left-arrow
      :title="$t('activity_detail')"
      @click-left="onClickLeft"
    />
    <div class="m-activity-content">
      <!-- 活动标题 -->
      <div class="m-activity-header" v-if="activityDetail.title">
        <h1 class="m-activity-title">{{ activityDetail.title }}</h1>
        <div class="m-activity-meta">
          <span class="m-activity-author" v-if="activityDetail.author">
            {{ activityDetail.author }}
          </span>
          <span class="m-activity-time" v-if="activityDetail.created_at">
            {{ activityDetail.created_at }}
          </span>
        </div>
      </div>

      <!-- 活动缩略图 -->
      <div class="m-activity-thumb" v-if="activityDetail.thumb_url">
        <van-image
          :src="getImgUrl(activityDetail.thumb_url)"
          fit="cover"
          class="m-thumb-img"
        />
      </div>

      <!-- 活动描述 -->
      <div class="m-activity-description" v-if="activityDetail.description">
        <p>{{ activityDetail.description }}</p>
      </div>

      <!-- 活动详细内容 -->
      <div class="m-html-container" v-if="activityDetail.content" v-html="activityDetail.content"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/api'
import { showToast } from 'vant'
import { useAppStore } from '@/stores/app'
import { getImgUrl } from '@/utils/tools'

defineOptions({ name: 'ActivityDetail' })

interface ActivityDetail {
  id: number
  type: number
  title: string
  description: string
  content: string
  thumb_url: string
  author: string
  created_at: string
  updated_at: string
}

const store = useAppStore()
const route = useRoute()
const router = useRouter()

const activityDetail = ref<ActivityDetail>({
  id: 0,
  type: 0,
  title: '',
  description: '',
  content: '',
  thumb_url: '',
  author: '',
  created_at: '',
  updated_at: ''
})

async function getActivityDetail() {
  store.loading()
  try {
    const id = route.params?.id ?? '0'
    console.log('Activity ID:', id)

    // 验证 ID 参数
    if (!id || id === '0') {
      showToast('活动ID无效')
      router.back()
      return
    }

    const resp = await api.activityDetail({ id: id })

    if (resp && resp.data) {
      activityDetail.value = resp.data

    } else {
      router.back()
    }
  } catch (err) {
    console.error('获取活动详情失败:', err)
    router.back()
  } finally {
    store.stopLoad()
  }
}

function onClickLeft() {
  router.back()
}

onMounted(async () => {
  await getActivityDetail()
})

</script>

<style lang="less" scoped>
.m-activity {
  display: flex;
  flex-direction: column;
  background: var(--color-m-background);
  min-height: 100vh;

  .m-activity-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    padding: 16px;
  }

  .m-activity-header {
    margin-bottom: 16px;

    .m-activity-title {
      font-size: 20px;
      font-weight: 600;
      color: var(--color-m-text);
      margin: 0 0 8px 0;
      line-height: 1.4;
    }

    .m-activity-meta {
      display: flex;
      align-items: center;
      gap: 12px;

      .m-activity-author {
        font-size: 14px;
        color: var(--color-m-text-secondary, #666);
      }

      .m-activity-time {
        font-size: 14px;
        color: var(--color-m-text-secondary, #999);
      }
    }
  }

  .m-activity-thumb {
    margin-bottom: 16px;
    border-radius: 8px;
    overflow: hidden;

    .m-thumb-img {
      width: 100%;
      height: 200px;
    }
  }

  .m-activity-description {
    margin-bottom: 16px;

    p {
      font-size: 16px;
      line-height: 1.6;
      color: var(--color-m-text);
      margin: 0;
      background: var(--m-label-gb);
      padding: 12px;
      border-radius: 8px;
    }
  }

  .m-html-container {
    flex: 1;
    line-height: 1.6;
    color: var(--color-m-text);

    // 内容样式
    :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
      margin: 16px 0 8px 0;
      color: var(--color-m-text);
    }

    :deep(p) {
      margin: 8px 0;
      line-height: 1.6;
    }

    :deep(img) {
      max-width: 100%;
      height: auto;
      border-radius: 4px;
      margin: 8px 0;
    }

    :deep(ul), :deep(ol) {
      padding-left: 20px;
      margin: 8px 0;
    }

    :deep(li) {
      margin: 4px 0;
    }

    :deep(blockquote) {
      border-left: 4px solid var(--color-primary, #1989fa);
      padding-left: 12px;
      margin: 12px 0;
      background: var(--m-label-gb);
      padding: 12px;
      border-radius: 4px;
    }
  }
}
</style>
