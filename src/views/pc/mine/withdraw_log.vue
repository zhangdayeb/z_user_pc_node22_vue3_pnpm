<template>
  <div class="withdraw-record">
    <van-nav-bar
      left-arrow
      :title="$t('withdrawRecord')"
      @click-left="onClickLeft"
      class="nav-bar"
    />

    <!-- 状态筛选 -->
    <div class="filter-bar">
      <van-tabs v-model:active="activeStatus" @click-tab="onTabChange" sticky>
        <van-tab :title="$t('all')" name=""></van-tab>
        <van-tab :title="$t('pending')" name="0"></van-tab>
        <van-tab :title="$t('approved')" name="1"></van-tab>
        <van-tab :title="$t('rejected')" name="2"></van-tab>
      </van-tabs>
    </div>

    <!-- 提现记录列表 -->
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="$t('noMore')"
        @load="onLoad"
        class="record-list"
      >
        <div
          v-for="item in list"
          :key="item.id"
          class="record-item"
          @click="showRecordDetail(item)"
        >
          <div class="record-header">
            <div class="record-title">
              <span class="amount" :class="getAmountClass(item.status)">
                ¥{{ item.amount }}
              </span>
              <van-tag
                :type="getStatusTagType(item.status)"
                size="small"
                class="status-tag"
              >
                {{ item.status_text }}
              </van-tag>
            </div>
          </div>
          <div class="record-info">
            <div class="info-row">
              <span class="label">{{ $t('applyTime') }}：</span>
              <span class="value">{{ formatTime(item.create_time) }}</span>
            </div>
            <div class="info-row" v-if="item.success_time">
              <span class="label">{{ $t('completeTime') }}：</span>
              <span class="value">{{ formatTime(item.success_time) }}</span>
            </div>
            <div class="info-row">
              <span class="label">{{ $t('actualAmount') }}：</span>
              <span class="value">¥{{ item.actual_amount }}</span>
            </div>
            <div class="info-row" v-if="item.bank_name">
              <span class="label">{{ $t('withdrawMethod') }}：</span>
              <span class="value">{{ item.pay_type_text }}</span>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 详情弹窗 -->
    <van-popup
      v-model:show="showDetail"
      position="bottom"
      round
      :style="{ height: '70%' }"
      class="detail-popup"
    >
      <div class="detail-content" v-if="selectedRecord">
        <div class="detail-header">
          <h3>{{ $t('withdrawDetail') }}</h3>
          <van-icon name="cross" @click="showDetail = false" />
        </div>

        <div class="detail-body">
          <div class="detail-amount">
            <span class="amount-label">{{ $t('withdrawAmount') }}</span>
            <span class="amount-value" :class="getAmountClass(selectedRecord.status)">
              ¥{{ selectedRecord.amount }}
            </span>
          </div>

          <div class="detail-status">
            <van-tag
              :type="getStatusTagType(selectedRecord.status)"
              size="large"
            >
              {{ selectedRecord.status_text }}
            </van-tag>
          </div>

          <van-cell-group class="detail-info">
            <van-cell :title="$t('orderNumber')" :value="selectedRecord.id" />
            <van-cell :title="$t('applyTime')" :value="formatTime(selectedRecord.create_time)" />
            <van-cell
              v-if="selectedRecord.success_time"
              :title="$t('completeTime')"
              :value="formatTime(selectedRecord.success_time)"
            />
            <van-cell :title="$t('withdrawAmount')" :value="`¥${selectedRecord.amount}`" />
            <van-cell :title="$t('handlingFee')" :value="`¥${selectedRecord.fee}`" />
            <van-cell :title="$t('actualAmount')" :value="`¥${selectedRecord.actual_amount}`" />
            <van-cell :title="$t('withdrawMethod')" :value="selectedRecord.pay_type_text" />
            <van-cell
              v-if="selectedRecord.bank_name"
              :title="$t('bankName')"
              :value="selectedRecord.bank_name"
            />
            <van-cell
              v-if="selectedRecord.account"
              :title="$t('receivingAccount')"
              :value="selectedRecord.account"
            />
            <van-cell
              v-if="selectedRecord.account_name"
              :title="$t('mine.accountHolder')"
              :value="selectedRecord.account_name"
            />
            <van-cell
              v-if="selectedRecord.remark"
              :title="$t('remark')"
              :value="selectedRecord.remark"
              class="remark-cell"
            />
          </van-cell-group>
        </div>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { invokeApi } from '@/utils/tools'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'WithdrawRecord' })

interface WithdrawRecordItem {
  id: number
  create_time: string
  success_time?: string
  amount: string
  fee: string
  actual_amount: string
  status: number
  status_text: string
  status_color: string
  pay_type: string
  pay_type_text: string
  bank_name?: string
  account?: string
  account_name?: string
  remark?: string
}

const router = useRouter()
const { t, locale } = useI18n()

const page = ref(0)
const list = ref<WithdrawRecordItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const activeStatus = ref('')
const showDetail = ref(false)
const selectedRecord = ref<WithdrawRecordItem | null>(null)

// 获取状态样式类
function getAmountClass(status: number): string {
  switch (status) {
    case 1: // 已通过
      return 'amount-success'
    case 2: // 已拒绝
      return 'amount-error'
    case 0: // 待审核
    default:
      return 'amount-pending'
  }
}

// 获取状态标签类型
function getStatusTagType(status: number): string {
  switch (status) {
    case 1: // 已通过
      return 'success'
    case 2: // 已拒绝
      return 'danger'
    case 0: // 待审核
    default:
      return 'warning'
  }
}

// 格式化时间
function formatTime(timeStr: string): string {
  if (!timeStr) return '-'

  try {
    const date = new Date(timeStr)
    const currentLocale = locale.value || 'zh-CN'

    // 将 vue-i18n 的 locale 格式转换为标准的 locale 格式
    let dateLocale = currentLocale
    switch (currentLocale) {
      case 'zh-CN':
        dateLocale = 'zh-CN'
        break
      case 'zh-TW':
        dateLocale = 'zh-TW'
        break
      case 'en-US':
        dateLocale = 'en-US'
        break
      case 'ko-KR':
        dateLocale = 'ko-KR'
        break
      case 'th-TH':
        dateLocale = 'th-TH'
        break
      case 'vi-VN':
        dateLocale = 'vi-VN'
        break
      default:
        dateLocale = 'zh-CN'
    }

    return date.toLocaleString(dateLocale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return timeStr
  }
}

// 显示详情
function showRecordDetail(record: WithdrawRecordItem) {
  selectedRecord.value = record
  showDetail.value = true
}

// 标签切换
function onTabChange(event: { name: string }) {
  activeStatus.value = event.name
  onRefresh()
}

// 下拉刷新
const onRefresh = async () => {
  finished.value = false
  loading.value = true
  page.value = 0
  list.value = []
  await getWithdrawRecords()
  refreshing.value = false
}

// 加载更多
const onLoad = async () => {
  await getWithdrawRecords()
}

// 返回上一页
function onClickLeft() {
  router.back()
}

// 获取提现记录
async function getWithdrawRecords() {
  try {
    const params: any = {
      page: page.value + 1,
      limit: 20
    }

    // 添加状态筛选
    if (activeStatus.value !== '') {
      params.status = activeStatus.value
    }

    const resp = await invokeApi('withdrawRecord', params)

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
    console.error('获取提现记录失败:', error)
    showToast(t('getWithdrawRecordFailed'))
  }

  loading.value = false
}

onMounted(async () => {
  await getWithdrawRecords()
})
</script>

<style scoped>
.withdraw-record {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.nav-bar {
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

.filter-bar {
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

.record-list {
  padding: 10px;
}

.record-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  transition: all 0.3s ease;
}

.record-item:active {
  transform: scale(0.98);
  background-color: #f8f9fa;
}

.record-header .record-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.record-header .record-title .amount {
  font-size: 18px;
  font-weight: 600;
}

.record-header .record-title .amount.amount-success {
  color: #07c160;
}

.record-header .record-title .amount.amount-error {
  color: #fa5151;
}

.record-header .record-title .amount.amount-pending {
  color: #ff8f00;
}

.record-header .record-title .status-tag {
  border-radius: 12px;
}

.record-info .info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.record-info .info-row:last-child {
  margin-bottom: 0;
}

.record-info .info-row .label {
  color: #969799;
  min-width: 80px;
}

.record-info .info-row .value {
  color: #323233;
  text-align: right;
  flex: 1;
}

.detail-popup .detail-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.detail-popup .detail-content .detail-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #ebedf0;
}

.detail-popup .detail-content .detail-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #323233;
}

.detail-popup .detail-content .detail-header .van-icon {
  font-size: 20px;
  color: #969799;
  cursor: pointer;
}

.detail-popup .detail-content .detail-body {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.detail-popup .detail-content .detail-body .detail-amount {
  text-align: center;
  margin-bottom: 16px;
}

.detail-popup .detail-content .detail-body .detail-amount .amount-label {
  display: block;
  font-size: 14px;
  color: #969799;
  margin-bottom: 8px;
}

.detail-popup .detail-content .detail-body .detail-amount .amount-value {
  font-size: 28px;
  font-weight: 600;
}

.detail-popup .detail-content .detail-body .detail-amount .amount-value.amount-success {
  color: #07c160;
}

.detail-popup .detail-content .detail-body .detail-amount .amount-value.amount-error {
  color: #fa5151;
}

.detail-popup .detail-content .detail-body .detail-amount .amount-value.amount-pending {
  color: #ff8f00;
}

.detail-popup .detail-content .detail-body .detail-status {
  text-align: center;
  margin-bottom: 24px;
}

.detail-popup .detail-content .detail-body .detail-info {
  border-radius: 8px;
  overflow: hidden;
}

.detail-popup .detail-content .detail-body .detail-info .remark-cell :deep(.van-cell__value) {
  word-break: break-all;
  white-space: pre-wrap;
}

/* PC端适配样式 */
@media (min-width: 768px) {
  .withdraw-record {
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

  .record-item {
    margin-bottom: 16px;
    padding: 20px 24px;
    border: 1px solid #ebedf0;
    transition: all 0.3s ease;
  }

  .record-item:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: #d0d0d0;
  }

  .record-header .record-title .amount {
    font-size: 20px;
  }

  .record-info .info-row {
    font-size: 16px;
  }
}

/* 大屏PC端适配 */
@media (min-width: 1200px) {
  .withdraw-record {
    max-width: 1000px;
  }

  .record-list {
    padding: 24px 32px;
  }

  .record-item {
    padding: 24px 32px;
    margin-bottom: 20px;
  }

  .record-header .record-title .amount {
    font-size: 22px;
  }
}

/* 超大屏适配 */
@media (min-width: 1600px) {
  .withdraw-record {
    max-width: 1200px;
  }
}
</style>
