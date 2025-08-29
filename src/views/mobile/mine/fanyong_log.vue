<template>
  <div class="fanyong-record">
    <van-nav-bar
      left-arrow
      :title="$t('commissionRecord')"
      @click-left="onClickLeft"
      class="nav-bar"
    />

    <!-- 返佣记录列表 -->
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
          :title="item.remark"
          :label="item.create_time"
          :value="item.money_display"
          :value-class="getAmountClass(item.money)"
        />
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty
      v-if="!loading && !refreshing && list.length === 0"
      :description="$t('noCommissionRecord')"
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

defineOptions({ name: 'FanyongRecord' })

interface FanyongRecordItem {
  id: number
  create_time: string
  money: string
  money_display: string
  remark: string
}

const router = useRouter()
const { t } = useI18n()

const page = ref(0)
const list = ref<FanyongRecordItem[]>([])
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
  await getFanyongRecords()
  refreshing.value = false
}

// 加载更多
const onLoad = async () => {
  await getFanyongRecords()
}

// 返回上一页
function onClickLeft() {
  router.back()
}

// 获取返佣记录
async function getFanyongRecords() {
  try {
    const resp = await invokeApi('fanyongRecord', {
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
        // 首次加载或刷新
        list.value = newList
      } else {
        // 加载更多
        list.value.push(...newList)
      }

      // 判断是否还有更多数据
      finished.value = !data.pagination?.has_more
    } else {
      finished.value = true
    }
  } catch (error) {
    console.error('获取返佣记录失败:', error)
    showToast(t('getCommissionRecordFailed'))
    finished.value = true
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  getFanyongRecords()
})
</script>

<style scoped>
.fanyong-record {
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

.fanyong-record :deep(.van-cell) {
  margin-bottom: 8px;
  background-color: #fff;
  border-radius: 8px;
  margin-left: 16px;
  margin-right: 16px;
}

.fanyong-record :deep(.van-cell:first-child) {
  margin-top: 16px;
}

.fanyong-record :deep(.van-cell__title) {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.fanyong-record :deep(.van-cell__label) {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.fanyong-record :deep(.van-cell__value) {
  font-size: 16px;
  font-weight: 600;
}

.fanyong-record :deep(.van-cell__value.amount-positive) {
  color: #07c160;
}

.fanyong-record :deep(.van-cell__value.amount-negative) {
  color: #ee0a24;
}

.fanyong-record :deep(.van-list__finished-text) {
  color: #999;
  font-size: 12px;
  padding: 20px 0;
}

.fanyong-record :deep(.van-empty) {
  padding: 100px 0;
}
</style>
