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

<style scoped>
.money-record {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.nav-bar {
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

.record-list {
  padding: 0;
}

.money-record :deep(.van-cell) {
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 8px;
  margin-left: 16px;
  margin-right: 16px;
}

.money-record :deep(.van-cell:first-child) {
  margin-top: 16px;
}

.money-record :deep(.van-cell__title) {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.money-record :deep(.van-cell__label) {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.money-record :deep(.van-cell__value) {
  font-size: 16px;
  font-weight: 600;
}

.money-record :deep(.van-cell__value.amount-positive) {
  color: #07c160;
}

.money-record :deep(.van-cell__value.amount-negative) {
  color: #ee0a24;
}

.money-record :deep(.van-list__finished-text) {
  color: #999;
  font-size: 12px;
  padding: 20px 0;
}

.money-record :deep(.van-empty) {
  padding: 100px 0;
}

/* PC端适配样式 */
@media (min-width: 768px) {
  .money-record {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .nav-bar {
    border-radius: 8px 8px 0 0;
  }

  .record-list {
    padding: 16px 24px;
  }

  .money-record :deep(.van-cell) {
    margin-left: 0;
    margin-right: 0;
    margin-bottom: 12px;
    padding: 20px 24px;
    border: 1px solid #ebedf0;
    transition: all 0.3s ease;
  }

  .money-record :deep(.van-cell:hover) {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #d0d0d0;
  }

  .money-record :deep(.van-cell:first-child) {
    margin-top: 0;
  }

  .money-record :deep(.van-cell__title) {
    font-size: 16px;
    font-weight: 600;
  }

  .money-record :deep(.van-cell__label) {
    font-size: 14px;
    margin-top: 6px;
  }

  .money-record :deep(.van-cell__value) {
    font-size: 18px;
    font-weight: 700;
  }

  .money-record :deep(.van-list__finished-text) {
    font-size: 14px;
    padding: 30px 0;
  }

  .money-record :deep(.van-empty) {
    padding: 120px 0;
  }
}

/* 大屏PC端适配 */
@media (min-width: 1200px) {
  .money-record {
    max-width: 1000px;
  }

  .record-list {
    padding: 24px 32px;
  }

  .money-record :deep(.van-cell) {
    padding: 24px 32px;
    margin-bottom: 16px;
  }

  .money-record :deep(.van-cell__title) {
    font-size: 18px;
  }

  .money-record :deep(.van-cell__label) {
    font-size: 15px;
  }

  .money-record :deep(.van-cell__value) {
    font-size: 20px;
  }
}

/* 超大屏适配 */
@media (min-width: 1600px) {
  .money-record {
    max-width: 1200px;
  }
}
</style>
