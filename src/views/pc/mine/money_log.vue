<template>
  <div class="money-records-container">
    <el-card class="records-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button
              :icon="ArrowLeft"
              @click="handleBack"
              text
            >
              {{ $t('common.back') }}
            </el-button>
            <h2>{{ $t('mine.moneyLog') }}</h2>
          </div>
          <div class="header-right">
            <el-button
              :icon="Refresh"
              @click="handleRefresh"
              :loading="refreshing"
            >
              {{ $t('common.refresh') }}
            </el-button>
            <el-button
              :icon="Download"
              @click="handleExport"
            >
              {{ $t('common.export') }}
            </el-button>
          </div>
        </div>
      </template>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item :label="$t('mine.recordType')">
            <el-select
              v-model="filterForm.type"
              :placeholder="$t('common.all')"
              clearable
              @change="handleFilterChange"
            >
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('mine.income')" value="income" />
              <el-option :label="$t('mine.expense')" value="expense" />
            </el-select>
          </el-form-item>
          <el-form-item :label="$t('mine.dateRange')">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              :range-separator="$t('common.to')"
              :start-placeholder="$t('common.startDate')"
              :end-placeholder="$t('common.endDate')"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleFilterChange"
            />
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

      <!-- 统计信息 -->
      <div class="statistics-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic :title="$t('mine.totalIncome')" :value="statistics.totalIncome">
              <template #prefix>
                <el-icon color="#67c23a"><TrendCharts /></el-icon>
              </template>
              <template #suffix>{{ $t('common.yuan') }}</template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic :title="$t('mine.totalExpense')" :value="statistics.totalExpense">
              <template #prefix>
                <el-icon color="#f56c6c"><TrendCharts /></el-icon>
              </template>
              <template #suffix>{{ $t('common.yuan') }}</template>
            </el-statistic>
          </el-col>
          <el-col :span="8">
            <el-statistic :title="$t('mine.currentBalance')" :value="statistics.currentBalance">
              <template #prefix>
                <el-icon color="#409eff"><Wallet /></el-icon>
              </template>
              <template #suffix>{{ $t('common.yuan') }}</template>
            </el-statistic>
          </el-col>
        </el-row>
      </div>

      <el-divider />

      <!-- 记录列表 -->
      <div class="records-table">
        <el-table
          v-loading="loading"
          :data="recordList"
          :empty-text="$t('noMoneyRecord')"
          style="width: 100%"
          @sort-change="handleSortChange"
        >
          <el-table-column
            prop="create_time"
            :label="$t('mine.time')"
            width="180"
            sortable="custom"
          >
            <template #default="{ row }">
              {{ formatDateTime(row.create_time) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="type_text"
            :label="$t('mine.type')"
            width="150"
          >
            <template #default="{ row }">
              <el-tag :type="getTypeTagType(row.type)">
                {{ row.type_text }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column
            prop="amount"
            :label="$t('mine.amount')"
            width="150"
            sortable="custom"
          >
            <template #default="{ row }">
              <span :class="getAmountClass(row.type)">
                {{ formatAmount(row.amount, row.type) }}
              </span>
            </template>
          </el-table-column>

          <el-table-column
            prop="money_before"
            :label="$t('mine.balanceBefore')"
            width="120"
          >
            <template #default="{ row }">
              ¥{{ formatMoney(row.money_before) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="money_after"
            :label="$t('mine.balanceAfter')"
            width="120"
          >
            <template #default="{ row }">
              ¥{{ formatMoney(row.money_after) }}
            </template>
          </el-table-column>

          <el-table-column
            prop="remark"
            :label="$t('mine.remark')"
            min-width="200"
            show-overflow-tooltip
          />

          <el-table-column
            fixed="right"
            :label="$t('common.operation')"
            width="100"
          >
            <template #default="{ row }">
              <el-button link type="primary" @click="handleDetail(row)">
                {{ $t('common.detail') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <!-- 详情对话框 -->
    <el-dialog
      v-model="detailVisible"
      :title="$t('mine.recordDetail')"
      width="500px"
    >
      <el-descriptions :column="1" border>
        <el-descriptions-item :label="$t('mine.time')">
          {{ formatDateTime(currentRecord?.create_time) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('mine.type')">
          <el-tag :type="getTypeTagType(currentRecord?.type)">
            {{ currentRecord?.type_text }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('mine.amount')">
          <span :class="getAmountClass(currentRecord?.type)">
            {{ formatAmount(currentRecord?.amount, currentRecord?.type) }}
          </span>
        </el-descriptions-item>
        <el-descriptions-item :label="$t('mine.balanceBefore')">
          ¥{{ formatMoney(currentRecord?.money_before) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('mine.balanceAfter')">
          ¥{{ formatMoney(currentRecord?.money_after) }}
        </el-descriptions-item>
        <el-descriptions-item :label="$t('mine.remark')">
          {{ currentRecord?.remark || '-' }}
        </el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Refresh,
  Download,
  TrendCharts,
  Wallet
} from '@element-plus/icons-vue'
import api from '@/api'

defineOptions({ name: 'MoneyRecords' })

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

interface Statistics {
  totalIncome: number
  totalExpense: number
  currentBalance: number
}

const { t } = useI18n()
const router = useRouter()

// 状态
const loading = ref(false)
const refreshing = ref(false)
const recordList = ref<RecordItem[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const detailVisible = ref(false)
const currentRecord = ref<RecordItem | null>(null)

// 筛选表单
const filterForm = reactive({
  type: '',
  dateRange: null as [string, string] | null
})

// 统计数据
const statistics = reactive<Statistics>({
  totalIncome: 0,
  totalExpense: 0,
  currentBalance: 0
})

// 格式化日期时间
function formatDateTime(datetime: string): string {
  if (!datetime) return '-'
  return datetime.replace('T', ' ').slice(0, 19)
}

// 格式化金额
function formatMoney(amount: string | number): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return isNaN(num) ? '0.00' : num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化金额显示
function formatAmount(amount: string, type: number): string {
  const prefix = (type === 1 || type === 4) ? '+' : '-'
  return `${prefix}¥${formatMoney(amount)}`
}

// 获取金额样式类
function getAmountClass(type: number): string {
  return (type === 1 || type === 4) ? 'amount-income' : 'amount-expense'
}

// 获取类型标签样式
function getTypeTagType(type: number): string {
  return (type === 1 || type === 4) ? 'success' : 'danger'
}

// 返回
function handleBack() {
  router.back()
}

// 刷新
async function handleRefresh() {
  refreshing.value = true
  await fetchRecords()
  refreshing.value = false
  ElMessage.success(t('common.refreshSuccess'))
}

// 导出
function handleExport() {
  ElMessage.info(t('common.exportDeveloping'))
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  fetchRecords()
}

// 重置
function handleReset() {
  filterForm.type = ''
  filterForm.dateRange = null
  currentPage.value = 1
  fetchRecords()
}

// 筛选变化
function handleFilterChange() {
  currentPage.value = 1
  fetchRecords()
}

// 排序变化
function handleSortChange({ prop, order }: any) {
  console.log('Sort:', prop, order)
  fetchRecords()
}

// 分页大小变化
function handleSizeChange(val: number) {
  pageSize.value = val
  currentPage.value = 1
  fetchRecords()
}

// 页码变化
function handlePageChange(val: number) {
  currentPage.value = val
  fetchRecords()
}

// 查看详情
function handleDetail(row: RecordItem) {
  currentRecord.value = row
  detailVisible.value = true
}

// 获取资金记录
async function fetchRecords() {
  loading.value = true

  try {
    const params: any = {
      page: currentPage.value,
      limit: pageSize.value
    }

    // 添加筛选条件
    if (filterForm.type) {
      params.type = filterForm.type
    }

    if (filterForm.dateRange) {
      params.start_date = filterForm.dateRange[0]
      params.end_date = filterForm.dateRange[1]
    }

    const resp = await api.moneyRecord(params)

    if (resp && resp.code === 200) {
      const data = resp.data
      recordList.value = data.list || []
      total.value = data.pagination?.total || 0

      // 更新统计数据
      updateStatistics(data)
    }
  } catch (error) {
    console.error('获取资金记录失败:', error)
    ElMessage.error(t('getMoneyRecordFailed'))
  } finally {
    loading.value = false
  }
}

// 更新统计数据
function updateStatistics(data: any) {
  if (data.statistics) {
    statistics.totalIncome = data.statistics.total_income || 0
    statistics.totalExpense = data.statistics.total_expense || 0
    statistics.currentBalance = data.statistics.current_balance || 0
  }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style lang="less" scoped>
.money-records-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);

  .records-card {
    max-width: 1400px;
    margin: 0 auto;

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .header-left {
        display: flex;
        align-items: center;
        gap: 20px;

        h2 {
          margin: 0;
          font-size: 20px;
          color: #303133;
        }
      }

      .header-right {
        display: flex;
        gap: 10px;
      }
    }

    .filter-section {
      margin-bottom: 20px;

      .filter-form {
        .el-form-item {
          margin-bottom: 0;
        }
      }
    }

    .statistics-section {
      padding: 20px;
      background-color: #f5f7fa;
      border-radius: 4px;
      margin-bottom: 20px;

      .el-statistic {
        text-align: center;
      }
    }

    .records-table {
      .amount-income {
        color: #67c23a;
        font-weight: 600;
        font-size: 15px;
      }

      .amount-expense {
        color: #f56c6c;
        font-weight: 600;
        font-size: 15px;
      }

      .el-pagination {
        margin-top: 20px;
        justify-content: flex-end;
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .money-records-container {
    padding: 10px;

    .records-card {
      .card-header {
        flex-direction: column;
        gap: 10px;
        align-items: flex-start;

        .header-right {
          width: 100%;
          justify-content: flex-end;
        }
      }

      .filter-section {
        .filter-form {
          .el-form-item {
            display: block;
            margin-bottom: 10px;
          }
        }
      }

      .statistics-section {
        .el-col {
          margin-bottom: 10px;
        }
      }
    }
  }
}
</style>
