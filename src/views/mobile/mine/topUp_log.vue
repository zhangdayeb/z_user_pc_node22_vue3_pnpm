<template>
  <div class="top-up-record">
    <van-nav-bar
      left-arrow
      :title="$t('rechargeRecord')"
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

    <!-- 充值记录列表 -->
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
                {{ getStatusText(item.status) }}
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
            <div class="info-row" v-if="item.u_bank_name">
              <span class="label">{{ $t('transferBankName') }}：</span>
              <span class="value">{{ item.u_bank_name }}</span>
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
      :style="{ height: '60%' }"
      class="detail-popup"
    >
      <div class="detail-content" v-if="selectedRecord">
        <div class="detail-header">
          <h3>{{ $t('rechargeDetail') }}</h3>
          <van-icon name="cross" @click="showDetail = false" />
        </div>

        <div class="detail-body">
          <div class="detail-amount">
            <span class="amount-label">{{ $t('rechargeAmount') }}</span>
            <span class="amount-value" :class="getAmountClass(selectedRecord.status)">
              ¥{{ selectedRecord.amount }}
            </span>
          </div>

          <div class="detail-status">
            <van-tag
              :type="getStatusTagType(selectedRecord.status)"
              size="large"
            >
              {{ getStatusText(selectedRecord.status) }}
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
            <van-cell
              v-if="selectedRecord.u_bank_name"
              :title="$t('transferBankName')"
              :value="selectedRecord.u_bank_name"
            />
            <van-cell
              v-if="selectedRecord.u_bank_user_name"
              :title="$t('bankAccountName')"
              :value="selectedRecord.u_bank_user_name"
            />
            <van-cell
              v-if="selectedRecord.u_bank_card"
              :title="$t('bankCardNumber')"
              :value="formatBankCard(selectedRecord.u_bank_card)"
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

defineOptions({ name: 'TopUpRecord' })

const { t, locale } = useI18n()
const router = useRouter()

interface TopUpRecordItem {
  id: number
  create_time: string
  success_time?: string
  amount: string
  status: number
  status_text: string
  u_bank_name?: string
  u_bank_user_name?: string
  u_bank_card?: string
  sys_bank_id?: number
}

const page = ref(0)
const list = ref<TopUpRecordItem[]>([])
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)
const activeStatus = ref('')
const showDetail = ref(false)
const selectedRecord = ref<TopUpRecordItem | null>(null)

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

// 获取状态文本 - 使用多语言
function getStatusText(status: number): string {
  switch (status) {
    case 0:
      return t('pending')
    case 1:
      return t('approved')
    case 2:
      return t('rejected')
    default:
      return t('unknownStatus')
  }
}

// 格式化时间 - 根据语言环境调整
function formatTime(timeStr: string): string {
  if (!timeStr) return '-'

  try {
    const date = new Date(timeStr)
    // 根据当前语言获取对应的 locale
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

// 格式化银行卡号（隐藏中间部分）
function formatBankCard(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 8) return cardNumber

  const start = cardNumber.substring(0, 4)
  const end = cardNumber.substring(cardNumber.length - 4)
  const middle = '*'.repeat(cardNumber.length - 8)

  return `${start}${middle}${end}`
}

// 显示详情
function showRecordDetail(record: TopUpRecordItem) {
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
  await getTopUpRecords()
  refreshing.value = false
}

// 加载更多
const onLoad = async () => {
  await getTopUpRecords()
}

// 返回上一页
function onClickLeft() {
  router.back()
}

// 获取充值记录
async function getTopUpRecords() {
  try {
    const params: any = {
      page: page.value + 1,
      limit: 20
    }

    // 添加状态筛选
    if (activeStatus.value !== '') {
      params.status = activeStatus.value
    }

    const resp = await invokeApi('topUpRecord', params)

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
    console.error('获取充值记录失败:', error)
    showToast(t('getRechargeRecordFailed'))
  }

  loading.value = false
}

onMounted(async () => {
  await getTopUpRecords()
})
</script>

<style lang="less" scoped>
.top-up-record {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f5f5f5;

  .nav-bar {
    background-color: #fff;
  }

  .filter-bar {
    background-color: #fff;
    border-bottom: 1px solid #ebedf0;
  }

  .record-list {
    flex: 1;
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

    &:active {
      transform: scale(0.98);
      background-color: #f8f9fa;
    }

    .record-header {
      .record-title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;

        .amount {
          font-size: 18px;
          font-weight: 600;

          &.amount-success {
            color: #07c160;
          }

          &.amount-error {
            color: #fa5151;
          }

          &.amount-pending {
            color: #ff8f00;
          }
        }

        .status-tag {
          border-radius: 12px;
        }
      }
    }

    .record-info {
      .info-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 8px;
        font-size: 14px;

        &:last-child {
          margin-bottom: 0;
        }

        .label {
          color: #969799;
          min-width: 80px;
        }

        .value {
          color: #323233;
          text-align: right;
          flex: 1;
        }
      }
    }
  }
}

.detail-popup {
  .detail-content {
    height: 100%;
    display: flex;
    flex-direction: column;

    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid #ebedf0;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #323233;
      }

      .van-icon {
        font-size: 20px;
        color: #969799;
        cursor: pointer;
      }
    }

    .detail-body {
      flex: 1;
      padding: 20px;
      overflow-y: auto;

      .detail-amount {
        text-align: center;
        margin-bottom: 16px;

        .amount-label {
          display: block;
          font-size: 14px;
          color: #969799;
          margin-bottom: 8px;
        }

        .amount-value {
          font-size: 28px;
          font-weight: 600;

          &.amount-success {
            color: #07c160;
          }

          &.amount-error {
            color: #fa5151;
          }

          &.amount-pending {
            color: #ff8f00;
          }
        }
      }

      .detail-status {
        text-align: center;
        margin-bottom: 24px;
      }

      .detail-info {
        border-radius: 8px;
        overflow: hidden;
      }
    }
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

.amount-pending {
  color: #ff8f00 !important;
}

.amount-success {
  color: #07c160 !important;
}

.amount-error {
  color: #fa5151 !important;
}
</style>
