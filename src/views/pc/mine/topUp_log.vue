<template>
  <div class="top-up-record-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button
        @click="onClickLeft"
        :icon="ArrowLeft"
        circle
        size="small"
        class="back-btn"
      />
      <h2 class="page-title">{{ $t('rechargeRecord') }}</h2>
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

    <!-- 充值记录列表 -->
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
                  {{ getStatusText(item.status) }}
                </el-tag>
              </div>
              <div class="info-row">
                <span class="label">{{ $t('orderNumber') }}:</span>
                <span class="value">{{ item.id }}</span>
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
              <div class="bank-info" v-if="item.u_bank_name">
                <span class="label">{{ $t('transferBankName') }}:</span>
                <span class="value">{{ item.u_bank_name }}</span>
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
      :title="$t('rechargeDetail')"
      width="600px"
      class="detail-dialog"
    >
      <div class="detail-content" v-if="selectedRecord">
        <!-- 金额和状态 -->
        <div class="detail-header-info">
          <div class="detail-amount">
            <label>{{ $t('rechargeAmount') }}</label>
            <span class="amount-value" :class="getAmountClass(selectedRecord.status)">
              ¥{{ selectedRecord.amount }}
            </span>
          </div>
          <el-tag
            :type="getStatusTagType(selectedRecord.status)"
            size="large"
            effect="dark"
          >
            {{ getStatusText(selectedRecord.status) }}
          </el-tag>
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
          <el-descriptions-item
            v-if="selectedRecord.u_bank_name"
            :label="$t('transferBankName')"
          >
            {{ selectedRecord.u_bank_name }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedRecord.u_bank_user_name"
            :label="$t('bankAccountName')"
          >
            {{ selectedRecord.u_bank_user_name }}
          </el-descriptions-item>
          <el-descriptions-item
            v-if="selectedRecord.u_bank_card"
            :label="$t('bankCardNumber')"
          >
            {{ formatBankCard(selectedRecord.u_bank_card) }}
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
import { ArrowLeft, Refresh, View } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { invokeApi } from '@/utils/tools'

defineOptions({ name: 'PcTopUpRecord' })

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

const { t, locale } = useI18n()
const router = useRouter()

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 数据相关
const list = ref<TopUpRecordItem[]>([])
const loading = ref(false)
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
function onTabChange() {
  currentPage.value = 1
  getTopUpRecords()
}

// 刷新
const onRefresh = async () => {
  currentPage.value = 1
  await getTopUpRecords()
  ElMessage.success(t('refreshSuccess'))
}

// 分页大小改变
function handleSizeChange() {
  currentPage.value = 1
  getTopUpRecords()
}

// 页码改变
function handleCurrentChange() {
  getTopUpRecords()
}

// 返回上一页
function onClickLeft() {
  router.back()
}

// 获取充值记录
async function getTopUpRecords() {
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

    const resp = await invokeApi('topUpRecord', params)

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
    console.error('获取充值记录失败:', error)
    ElMessage.error(t('getRechargeRecordFailed'))
  } finally {
    loading.value = false
  }
}

// 监听状态变化
watch(activeStatus, () => {
  currentPage.value = 1
})

onMounted(() => {
  getTopUpRecords()
})
</script>

<style scoped lang="scss">
.top-up-record-container {
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

          .info-row {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;

            .label {
              color: #909399;
            }

            .value {
              color: #606266;
              font-family: monospace;
            }
          }
        }

        .record-right {
          flex: 1;

          .time-info {
            margin-bottom: 8px;

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

          .bank-info {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 14px;

            .label {
              color: #909399;
            }

            .value {
              color: #606266;
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

      .detail-amount {
        display: flex;
        flex-direction: column;
        gap: 8px;

        label {
          font-size: 14px;
          color: #909399;
        }

        .amount-value {
          font-size: 32px;
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
    }

    .detail-descriptions {
      :deep(.el-descriptions__label) {
        width: 140px;
        font-weight: 500;
      }
    }
  }
}

// 响应式适配
@media (max-width: 1200px) {
  .top-up-record-container {
    padding: 16px;

    .record-list {
      .record-item {
        .record-main {
          flex-direction: column;
          align-items: flex-start;
          gap: 16px;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .top-up-record-container {
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
    max-width: 500px;
  }
}
</style>
