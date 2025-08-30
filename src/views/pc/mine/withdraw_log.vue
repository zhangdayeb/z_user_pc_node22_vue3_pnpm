<template>
  <div class="pc-withdraw-record">
    <!-- PC端头部 -->
    <div class="pc-header">
      <el-button
        type="primary"
        :icon="ArrowLeft"
        @click="handleBack"
        class="back-btn"
      >
        {{ $t('common.back') }}
      </el-button>
      <h2 class="page-title">{{ $t('withdrawRecord') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :inline="true" class="filter-form">
          <el-form-item :label="$t('moneyLog.status')">
            <el-select
              v-model="activeStatus"
              :placeholder="$t('all')"
              clearable
              @change="handleFilterChange"
            >
              <el-option :label="$t('all')" value="" />
              <el-option :label="$t('pending')" value="0" />
              <el-option :label="$t('approved')" value="1" />
              <el-option :label="$t('rejected')" value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              {{ $t('common.search') }}
            </el-button>
            <el-button @click="handleReset">
              {{ $t('common.reset') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 提现记录表格 -->
      <el-table
        v-loading="loading"
        :data="list"
        class="record-table"
        :empty-text="$t('noData')"
        stripe
      >
        <el-table-column
          prop="create_time"
          :label="$t('applyTime')"
          width="180"
        >
          <template #default="{ row }">
            {{ formatTime(row.create_time) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="id"
          :label="$t('orderNumber')"
          width="150"
        />

        <el-table-column
          prop="amount"
          :label="$t('withdrawAmount')"
          width="130"
          align="right"
        >
          <template #default="{ row }">
            <span :class="getAmountClass(row.status)">
              ¥{{ row.amount }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="actual_amount"
          :label="$t('actualAmount')"
          width="130"
          align="right"
        >
          <template #default="{ row }">
            <span class="actual-amount">
              ¥{{ row.actual_amount }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="fee"
          :label="$t('handlingFee')"
          width="100"
          align="right"
        >
          <template #default="{ row }">
            {{ row.fee && parseFloat(row.fee) > 0 ? `¥${row.fee}` : '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="status_text"
          :label="$t('moneyLog.status')"
          width="120"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ row.status_text }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="pay_type_text"
          :label="$t('withdrawMethod')"
          width="120"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.pay_type_text || '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="success_time"
          :label="$t('completeTime')"
          width="180"
        >
          <template #default="{ row }">
            {{ row.success_time ? formatTime(row.success_time) : '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="remark"
          :label="$t('remark')"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.remark || '-' }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
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

// 筛选变化
function handleFilterChange() {
  currentPage.value = 1
  getWithdrawRecords()
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  getWithdrawRecords()
}

// 重置
function handleReset() {
  activeStatus.value = ''
  currentPage.value = 1
  getWithdrawRecords()
}

// 分页大小变化
function handleSizeChange(val: number) {
  pageSize.value = val
  currentPage.value = 1
  getWithdrawRecords()
}

// 页码变化
function handlePageChange(val: number) {
  currentPage.value = val
  getWithdrawRecords()
}

// 返回上一页
function handleBack() {
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

onMounted(() => {
  getWithdrawRecords()
})
</script>

<style scoped>
.pc-withdraw-record {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.pc-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.back-btn {
  margin-right: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.pc-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-section {
  margin-bottom: 20px;
}

.filter-form .el-form-item {
  margin-bottom: 0;
}

.record-table {
  width: 100%;
  margin-bottom: 20px;
}

.amount-success {
  color: #67c23a;
  font-weight: 600;
  font-size: 16px;
}

.amount-error {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.amount-pending {
  color: #e6a23c;
  font-weight: 600;
  font-size: 16px;
}

.actual-amount {
  color: #303133;
  font-weight: 500;
  font-size: 15px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

/* Element Plus 样式覆盖 */
.pc-withdraw-record :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.pc-withdraw-record :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.pc-withdraw-record :deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.pc-withdraw-record :deep(.el-table td) {
  padding: 16px 12px;
}

.pc-withdraw-record :deep(.el-table__empty-block) {
  padding: 60px 0;
}

.pc-withdraw-record :deep(.el-pagination) {
  padding: 12px 0;
}

@media (min-width: 1600px) {
  .pc-withdraw-record {
    max-width: 1400px;
  }
}
</style>
