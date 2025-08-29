<template>
  <div class="game-record">
    <van-nav-bar
      left-arrow
      :title="$t('mine.gameLog')"
      @click-left="onClickLeft"
      class="nav-bar"
    />

    <!-- 游戏记录列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="$t('noMore')"
        @load="onLoad"
        class="record-list"
      >
        <van-cell
          v-for="item in list"
          :key="item.id"
          :title="item.operate_type_text"
          :label="item.created_at || $t('timeUnknown')"
          :value="item.amount_display"
          :value-class="getAmountClass(item.money)"
        />
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty
      v-if="!loading && !refreshing && list.length === 0"
      :description="$t('noGameRecord')"
      image="https://img.yzcdn.cn/vant/custom-empty-image.png"
    />
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import { invokeApi } from '@/utils/tools'

defineOptions({ name: 'GameRecord' })

interface GameRecordItem {
  id: number
  member_id: number
  money: string
  money_before: string
  money_after: string
  money_type: string
  money_type_text: string
  number_type: number
  operate_type: number
  operate_type_text: string
  operate_type_color: string
  user_id: number
  model_name: string
  model_id: number
  description: string
  remark: string
  amount_display: string
  created_at: string | null
  updated_at: string | null
}

const router = useRouter()
const { t } = useI18n()

const page = ref(0)
const list = ref<GameRecordItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)

// 获取金额样式类
function getAmountClass(money: string): string {
  const amount = parseFloat(money)
  return amount >= 0 ? 'amount-positive' : 'amount-negative'
}

// 下拉刷新
const onRefresh = async () => {
  finished.value = false
  loading.value = true
  page.value = 0
  list.value = []
  await getGameRecords()
  refreshing.value = false
}

// 加载更多
const onLoad = async () => {
  await getGameRecords()
}

// 返回上一页
function onClickLeft() {
  router.back()
}

// 获取游戏记录
async function getGameRecords() {
  try {
    const resp = await invokeApi('gameRecord', {
      page: page.value + 1,
      limit: 20
    })

    if (!resp) {
      loading.value = false
      return
    }

    if (resp.data) {
      const data = resp.data
      page.value = data.pagination?.current_page ?? 1
      const newList = data.list ?? []

      if (page.value === 1) {
        list.value = newList
      } else {
        list.value = list.value.concat(newList)
      }

      // 判断是否还有更多数据
      finished.value = !data.pagination?.has_more
    }
  } catch (error) {
    console.error('获取游戏记录失败:', error)
    showToast(t('getGameRecordFailed'))
  }

  loading.value = false
}

onMounted(async () => {
  await getGameRecords()
})
</script>

<style lang="less" scoped>
.game-record {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;

  .nav-bar {
    background-color: #fff;
  }

  .record-list {
    flex: 1;
    background-color: #fff;
    margin-top: 10px;
  }
}
</style>

<style lang="less">
.amount-positive {
  color: #07c160 !important;
}

.amount-negative {
  color: #fa5151 !important;
}

.game-record :deep(.van-empty) {
  padding: 100px 0;
}
</style>
