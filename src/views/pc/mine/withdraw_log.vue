<template>
  <div class="withdraw-record-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button
        @click="onClickLeft"
        :icon="ArrowLeft"
        circle
        size="small"
        class="back-btn"
      />
      <h2 class="page-title">{{ $t('withdrawRecord') }}</h2>
      <el-button
        @click="onRefresh"
        :icon="Refresh"
        circle
        size="small"
        class="refresh-btn"
      />
    </div>

    <!-- 状态筛选标签页 -->
    <el-card class="filter-card" shadow="never">
      <el-tabs v-model="activeStatus" @tab-change="onTabChange">
        <el-tab-pane :label="$t('all')" name=""></el-tab-pane>
        <el-tab-pane :label="$t('pending')" name="0"></el-tab-pane>
        <el-tab-pane :label="$t('approved')" name="1"></el-tab-pane>
        <el-tab-pane :label="$t('rejected')" name="2"></el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 提现记录列表 -->
    <el-card class="record-list-card" shadow="never" v-loading="loading">
      <div class="record-list">
        <div
          v-for="item in list"
          :key="item.id"
          class="record-item"
          @click="showRecordDetail(item)"
        >
          <div class="record-main">
            <div class="record-left">
              <div class="amount-row">
                <span class="amount" :class="getAmountClass(item.status)">
                  ¥{{ item.amount }}
                </span>
                <el-tag
                  :type="getStatusTagType(item.status)"
                  size="small"
                  effect="dark"
                >
                  {{ item.status_text }}
                </el-tag>
              </div>
              <div class="fee-info">
                <span class="label">{{ $t('actualAmount') }}:</span>
                <span class="actual-amount">¥{{ item.actual_amount }}</span>
                <el-tooltip
                  v-if="item.fee && parseFloat(item.fee) > 0"
                  :content="`${$t('handlingFee')}: ¥${item.fee}`"
                  placement="top"
                >
                  <el-icon class="fee-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
            </div>

            <div class="record-center">
              <div class="info-row">
                <span class="label">{{ $t('orderNumber') }}:</span>
                <span class="value">{{ item.id }}</span>
              </div>
              <div class="info-row" v-if="item.pay_type_text">
                <span class="label">{{ $t('withdrawMethod') }}:</span>
                <span class="value">{{ item.pay_type_text }}</span>
              </div>
            </div>

            <div class="record-right">
              <div class="time-info">
                <div class="time-row">
                  <span class="label">{{ $t('applyTime') }}:</span>
                  <span class="value">{{ formatTime(item.create_time) }}</span>
                </div>
                <div class="time-row" v-if="item.success_time">
                  <span class="label">{{ $t('completeTime') }}:</span>
                  <span class="value">{{ formatTime(item.success_time) }}</span>
                </div>
              </div>
            </div>
          </div>

          <el-button
            type="primary"
            link
            :icon="View"
            class="view-detail-btn"
          >
            {{ $t('viewDetail') }}
          </el-button>
        </div>

        <!-- 空状态 -->
        <el-empty
          v-if="!loading && list.length === 0"
          :description="$t('noData')"
          class="empty-state"
        />
      </div>

      <!-- 分页 -->
      <el-pagination
        v-if="list.length > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="showDetail"
      :title="$t('withdrawDetail')"
      width="650px"
      class="detail-dialog"
    >
      <div class="detail-content" v-if="selectedRecord">
        <!-- 金额和状态 -->
        <div class="detail-header-info">
          <div class="detail-amounts">
            <div class="amount-item">
              <label>{{ $t('withdrawAmount') }}</label>
              <span class="amount-value" :class="getAmountClass(selectedRecord.status)">
                ¥{{ selectedRecord.amount }}
              </span>
            </div>
            <div class="amount-item">
              <label>{{ $t('actualAmount') }}</label>
              <span class="actual-value">¥{{ selectedRecord.actual_amount }}</span>
            </div>
          </div>
          <el-tag
            :type="getStatusTagType(selectedRecord.status)"
            size="large"
            effect="dark"
          >
            {{ selectedRecord.status_text }}
          </el-tag>
        </div>

        <!-- 费用明细 -->
        <div class="fee-detail" v-if="selectedRecord.fee && parseFloat(selectedRecord.fee) > 0">
          <el-alert
            :title="$t('feeDetail')"
            type="info"
            :closable="false"
            show-icon
          >
            <div class="fee-breakdown">
              <span>{{ $t('withdrawAmount') }}: ¥{{ selectedRecord.amount }}</span>
              <span class="minus">-</span>
              <span>{{ $t('handlingFee') }}: ¥{{ selectedRecord.fee }}</span>
              <span class="equals">=</span>
              <span class="result">{{ $t('actualAmount') }}: ¥{{ selectedRecord.actual_amount }}</span>
            </div>
          </el-alert>
        </div>

        <!-- 详细信息 -->
        <el-descriptions :column="1" border class="detail-descriptions">
          <el-descriptions-item :label="$t('orderNumber')">
            {{ selectedRecord.id }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('applyTime')">
            {{ formatTime(selectedRecord.create_time) }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedRecord.success_time"
            :label="$t('completeTime')"
          >
            {{ formatTime(selectedRecord.success_time) }}
          </el-descriptions-item>
          <el-descriptions-item :label="$t('withdrawMethod')">
            {{ selectedRecord.pay_type_text }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedRecord.bank_name"
            :label="$t('bankName')"
          >
            {{ selectedRecord.bank_name }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedRecord.account"
            :label="$t('receivingAccount')"
          >
            {{ formatAccount(selectedRecord.account) }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedRecord.account_name"
            :label="$t('mine.accountHolder')"
          >
            {{ selectedRecord.account_name }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedRecord.remark"
            :label="$t('remark')"
          >
            <div class="remark-content">{{ selectedRecord.remark }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="showDetail = false">{{ $t('close') }}</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Refresh, View, InfoFilled } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { invokeApi } from '@/utils/tools'

defineOptions({ name: 'PcWithdrawRecord' })

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

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 数据相关
const list = ref<WithdrawRecordItem[]>([])
const loading = ref(false)
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
function getStatusTagType(status: number): 'success' | 'danger' | 'warning' {
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

// 格式化账号（隐藏中间部分）
function formatAccount(account: string): string {
  if (!account || account.length < 8) return account

  const start = account.substring(0, 4)
  const end = account.substring(account.length - 4)
  const middle = '*'.repeat(Math.min(account.length - 8, 8))

  return `${start}${middle}${end}`
}

// 显示详情
function showRecordDetail(record: WithdrawRecordItem) {
  selectedRecord.value = record
  showDetail.value = true
}

// 标签切换
function onTabChange() {
  currentPage.value = 1
  getWithdrawRecords()
}

// 刷新
const onRefresh = async () => {
  currentPage.value = 1
  await getWithdrawRecords()
  ElMessage.success(t('refreshSuccess'))
}

// 分页大小改变
function handleSizeChange() {
  currentPage.value = 1
  getWithdrawRecords()
}

// 页码改变
function handleCurrentChange() {
  getWithdrawRecords()
}

// 返回上一页
function onClickLeft() {
  router.back()
}

// 获取提现记录
async function getWithdrawRecords() {
  loading.value = true

  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value
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
      list.value = data.list ?? []
      total.value = data.pagination?.total ?? 0

      // 更新当前页码（处理超出范围的情况）
      if (data.pagination?.current_page) {
        currentPage.value = data.pagination.current_page
      }
    }
  } catch (error) {
    console.error('获取提现记录失败:', error)
    ElMessage.error(t('getWithdrawRecordFailed'))
  } finally {
    loading.value = false
  }
}

// 监听状态变化
watch(activeStatus, () => {
  currentPage.value = 1
})

onMounted(() => {
  getWithdrawRecords()
})
</script>

<style scoped lang="scss">
.withdraw-record-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);

  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
    padding: 0 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0;
      flex: 1;
      text-align: center;
    }

    .back-btn,
    .refresh-btn {
      flex-shrink: 0;
    }
  }

  .filter-card {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding: 10px 20px;
    }

    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
  }

  .record-list-card {
    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .record-list {
    .record-item {
      padding: 20px;
      margin-bottom: 16px;
      background: #fff;
      border: 1px solid #e4e7ed;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: space-between;

      &:hover {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-2px);
        border-color: #c0c4cc;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .record-main {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 40px;

        .record-left {
          min-width: 200px;

          .amount-row {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 12px;

            .amount {
              font-size: 24px;
              font-weight: 600;

              &.amount-success {
                color: #67c23a;
              }

              &.amount-error {
                color: #f56c6c;
              }

              &.amount-pending {
                color: #e6a23c;
              }
            }
          }

          .fee-info {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;

            .label {
              color: #909399;
            }

            .actual-amount {
              color: #303133;
              font-weight: 500;
            }

            .fee-icon {
              color: #909399;
              cursor: help;
            }
          }
        }

        .record-center {
          flex: 1;

          .info-row {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
            font-size: 14px;

            &:last-child {
              margin-bottom: 0;
            }

            .label {
              color: #909399;
            }

            .value {
              color: #606266;
            }
          }
        }

        .record-right {
          min-width: 240px;

          .time-info {
            .time-row {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 6px;
              font-size: 14px;

              &:last-child {
                margin-bottom: 0;
              }

              .label {
                color: #909399;
                min-width: 80px;
              }

              .value {
                color: #606266;
              }
            }
          }
        }
      }

      .view-detail-btn {
        font-size: 14px;
      }
    }

    .empty-state {
      padding: 60px 0;
    }
  }

  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: center;
  }
}

.detail-dialog {
  :deep(.el-dialog__body) {
    padding: 20px 30px;
  }

  .detail-content {
    .detail-header-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      background: #f5f7fa;
      border-radius: 8px;
      margin-bottom: 20px;

      .detail-amounts {
        display: flex;
        gap: 40px;

        .amount-item {
          display: flex;
          flex-direction: column;
          gap: 8px;

          label {
            font-size: 14px;
            color: #909399;
          }

          .amount-value {
            font-size: 28px;
            font-weight: 600;

            &.amount-success {
              color: #67c23a;
            }

            &.amount-error {
              color: #f56c6c;
            }

            &.amount-pending {
              color: #e6a23c;
            }
          }

          .actual-value {
            font-size: 24px;
            font-weight: 500;
            color: #303133;
          }
        }
      }
    }

    .fee-detail {
      margin-bottom: 20px;

      .fee-breakdown {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 14px;
        margin-top: 8px;

        span {
          color: #606266;
        }

        .minus,
        .equals {
          color: #909399;
          font-weight: bold;
        }

        .result {
          font-weight: 500;
          color: #303133;
        }
      }
    }

    .detail-descriptions {
      :deep(.el-descriptions__label) {
        width: 140px;
        font-weight: 500;
      }

      .remark-content {
        word-break: break-all;
        white-space: pre-wrap;
        line-height: 1.6;
      }
    }
  }
}

// 响应式适配
@media (max-width: 1400px) {
  .withdraw-record-container {
    .record-list {
      .record-item {
        .record-main {
          gap: 20px;

          .record-left {
            min-width: 180px;
          }

          .record-right {
            min-width: 200px;
          }
        }
      }
    }
  }
}

@media (max-width: 1200px) {
  .withdraw-record-container {
    padding: 16px;

    .record-list {
      .record-item {
        .record-main {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;

          .record-left,
          .record-center,
          .record-right {
            width: 100%;
            min-width: unset;
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .withdraw-record-container {
    padding: 12px;

    .page-header {
      padding: 0 12px;

      .page-title {
        font-size: 20px;
      }
    }

    .record-list {
      .record-item {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;

        .view-detail-btn {
          align-self: flex-end;
        }
      }
    }
  }

  .detail-dialog {
    width: 90% !important;
    max-width: 550px;

    .detail-content {
      .detail-header-info {
        flex-direction: column;
        gap: 16px;

        .detail-amounts {
          flex-direction: column;
          gap: 16px;
          width: 100%;
        }
      }
    }
  }
}
</style>
