<template>
  <div class="m-notices">
    <van-nav-bar
      left-arrow
      :title="$t('mine.myNotices')"
      @click-left="onClickLeft"
      class="m-nav"
    />

    <van-tabs v-model:active="active">
      <van-tab :title="$t('unread')">
        <van-empty
          :description="$t('noRecord')"
          v-if="unread.data.length <= 0"
        />
        <van-list
          :immediate-check="false"
          v-else
          v-model:loading="unread.loading"
          :finished="unread.finished"
          :finished-text="$t('noMore')"
          @load="unreadOnLoad"
        >
          <van-cell
            v-for="(item, idx) in unread.data"
            :key="idx"
            is-link
            :title="item.title"
            :value="$t('unread')"
            :label="item.created_at"
            value-class="m-green m-f12"
          />
        </van-list>
      </van-tab>
      <van-tab :title="$t('readed')">
        <van-empty :description="$t('noRecord')" v-if="read.data.length <= 0" />
        <van-list
          :immediate-check="false"
          v-else
          v-model:loading="unread.loading"
          :finished="unread.finished"
          :finished-text="$t('noMore')"
          @load="unreadOnLoad"
        >
          <van-cell
            v-for="(item, idx) in read.data"
            :key="idx"
            is-link
            :title="item.title"
            :value="$t('readed')"
            :label="item.created_at"
            value-class="m-c-red m-f12"
          />
        </van-list>
      </van-tab>
    </van-tabs>
  </div>
</template>

<script setup lang="ts">
import { invokeApi } from '@/utils/tools'
import type { ApiRead } from 'typings'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

defineOptions({ name: 'myNotices' })

interface ListData {
  data: ApiRead[]
  loading: boolean
  finished: boolean
  total: number
  page: number
}
const router = useRouter()
const active = ref(0)
const read = ref<ListData>({
  data: [],
  loading: false,
  finished: false,
  total: 0,
  page: 0,
})
const unread = ref<ListData>({
  data: [],
  loading: false,
  finished: false,
  total: 0,
  page: 0,
})

async function unreadOnLoad() {
  await getMessage(unread.value.page + 1)
}

function onClickLeft() {
  router.back()
}

async function getMessage(p: number) {
  const resp = await invokeApi('message', { page: p })

  if (resp) {
    const data = resp.data.data as ApiRead[]

    data.forEach(it => {
      if (it.is_read === 0) {
        unread.value.data.push(it)
      }
      if (it.is_read === 1) {
        read.value.data.push(it)
      }
    })
    unread.value.finished = read.value.finished = true
    console.log('unread', unread.value, read.value)
  }
}

onMounted(async () => {
  unread.value.data = []
  unread.value.page = 0
  await unreadOnLoad()
})
</script>

<style lang="less" scoped>
.m-notices {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f8fa;
}

.m-nav {
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

/* 移动端样式 */
.m-notices :deep(.van-tabs) {
  background-color: #fff;
}

.m-notices :deep(.van-cell) {
  align-items: center;
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 8px;
  margin-left: 16px;
  margin-right: 16px;
}

.m-notices :deep(.van-cell:first-child) {
  margin-top: 16px;
}

.m-notices :deep(.van-cell__title) {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.m-notices :deep(.van-cell__label) {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.m-notices :deep(.van-cell__value) {
  font-size: 12px;
  font-weight: 500;
}

/* PC端适配样式 */
@media (min-width: 768px) {
  .m-notices {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .m-nav {
    border-radius: 8px 8px 0 0;
  }

  .m-notices :deep(.van-tabs) {
    border-radius: 0 0 8px 8px;
  }

  .m-notices :deep(.van-tabs__wrap) {
    background-color: #f8f9fa;
  }

  .m-notices :deep(.van-tabs__nav) {
    background-color: transparent;
  }

  .m-notices :deep(.van-tab) {
    font-size: 16px;
    font-weight: 500;
    color: #606266;
    padding: 16px 24px;
    transition: all 0.3s;
  }

  .m-notices :deep(.van-tab--active) {
    color: #409eff;
    font-weight: 600;
  }

  .m-notices :deep(.van-tab:hover) {
    color: #409eff;
    background: rgba(64, 158, 255, 0.1);
  }

  .m-notices :deep(.van-tabs__line) {
    background: #409eff;
    height: 3px;
    border-radius: 2px;
  }

  .m-notices :deep(.van-tabs__content) {
    padding: 16px 24px;
  }

  .m-notices :deep(.van-cell) {
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 12px;
    padding: 20px 24px;
    border: 1px solid #ebedf0;
    transition: all 0.3s ease;
  }

  .m-notices :deep(.van-cell:hover) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #d0d0d0;
  }

  .m-notices :deep(.van-cell:first-child) {
    margin-top: 0;
  }

  .m-notices :deep(.van-cell__title) {
    font-size: 16px;
    font-weight: 600;
  }

  .m-notices :deep(.van-cell__label) {
    font-size: 14px;
    margin-top: 6px;
  }

  .m-notices :deep(.van-cell__value) {
    font-size: 14px;
    font-weight: 600;
  }

  .m-notices :deep(.van-empty) {
    padding: 120px 0;
  }
}

/* 大屏PC端适配 */
@media (min-width: 1200px) {
  .m-notices {
    max-width: 1000px;
  }

  .m-notices :deep(.van-tabs__content) {
    padding: 24px 32px;
  }

  .m-notices :deep(.van-cell) {
    padding: 24px 32px;
    margin-bottom: 16px;
  }

  .m-notices :deep(.van-cell__title) {
    font-size: 18px;
  }

  .m-notices :deep(.van-cell__label) {
    font-size: 15px;
  }

  .m-notices :deep(.van-cell__value) {
    font-size: 15px;
  }
}

/* 超大屏适配 */
@media (min-width: 1600px) {
  .m-notices {
    max-width: 1200px;
  }
}
</style>

<style lang="less">
@import url('@/views/mobile/common.less');

.m-notices {
  .van-tabs__nav--line {
    padding-bottom: 0px;
  }
  .van-tabs__line {
    bottom: 0px;
  }
  .van-cell {
    align-items: center;
  }
  .m-green {
    color: #07c160 !important;
  }
  .m-c-red {
    color: #ee0a24 !important;
  }
  .m-f12 {
    font-size: 12px;
  }

  /* PC端颜色适配 */
  @media (min-width: 768px) {
    .m-f12 {
      font-size: 14px;
    }
  }

  @media (min-width: 1200px) {
    .m-f12 {
      font-size: 15px;
    }
  }
}
</style>
