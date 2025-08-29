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
          v-model:loading="read.loading"
          :finished="read.finished"
          :finished-text="$t('noMore')"
          @load="readOnLoad"
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
  await getMessage(unread.value.page + 1, 'unread')
}

async function readOnLoad() {
  await getMessage(read.value.page + 1, 'read')
}

function onClickLeft() {
  router.back()
}

async function getMessage(p: number, type: 'unread' | 'read' = 'unread') {
  const resp = await invokeApi('message', { page: p })

  if (resp && resp.data) {
    const data = resp.data.data as ApiRead[]

    data.forEach(it => {
      if (it.is_read === 0 && type === 'unread') {
        unread.value.data.push(it)
      }
      if (it.is_read === 1 && type === 'read') {
        read.value.data.push(it)
      }
    })

    if (type === 'unread') {
      unread.value.finished = true
      unread.value.page = p
    } else {
      read.value.finished = true
      read.value.page = p
    }

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
  min-height: 100%;
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
    color: #07c160;
  }
  .m-c-red {
    color: #ee0a24;
  }
  .m-f12 {
    font-size: 12px;
  }
}
</style>
