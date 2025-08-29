<template>
  <div class="money-record">
    <van-nav-bar
      left-arrow
      :title="$t('mine.moneyLog')"
      @click-left="onClickLeft"
      class="nav-bar"
    />

    <!-- 资金记录列表 -->
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
          :title="item.type_text"
          :label="item.create_time"
          :value="item.amount_display"
          :value-class="getAmountClass(item.type)"
        />
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty
      v-if="!loading && !refreshing && list.length === 0"
      :description="$t('noMoneyRecord')"
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

defineOptions({ name: 'MoneyRecord' })

interface RecordItem {
  id: number
  create_time: string
  type: number
  type_text: string
  type_color: string
  money_before: string
  money_after: string
  amount: string
  amount_display: string
  remark: string
}

const router = useRouter()
const { t } = useI18n()

const page = ref(0)
const list = ref<RecordItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)

// 获取金额样式类
function getAmountClass(type: number): string {
  return (type === 1 || type === 4) ? 'amount-positive' : 'amount-negative'
}

// 下拉刷新
const onRefresh = async () => {
  finished.value = false
  loading.value = true
  page.value = 0
  list.value = []
  await getMoneyRecords()
  refreshing.value = false
}

// 加载更多
const onLoad = async () => {
  await getMoneyRecords()
}

// 返回上一页
function onClickLeft() {
  router.back()
}

// 获取资金记录
async function getMoneyRecords() {
  try {
    const resp = await invokeApi('moneyRecord', {
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
    console.error('获取资金记录失败:', error)
    showToast(t('getMoneyRecordFailed'))
  }

  loading.value = false
}

onMounted(async () => {
  await getMoneyRecords()
})
</script>

<style lang="less" scoped>
.money-record {
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

.money-record :deep(.van-empty) {
  padding: 100px 0;
}
</style>
