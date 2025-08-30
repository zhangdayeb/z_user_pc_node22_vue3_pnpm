<template>
  <div class="money-records-container">
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
      <h2 class="page-title">{{ $t('mine.moneyLog') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm" class="filter-form">
          <el-form-item :label="$t('mine.recordType')">
            <el-select
              v-model="filterForm.type"
              :placeholder="$t('all')"
              clearable
              @change="handleFilterChange"
            >
              <el-option :label="$t('all')" value="" />
              <el-option :label="$t('mine.totalIncome')" value="income" />
              <el-option :label="$t('mine.totalExpense')" value="expense" />
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

      <!-- 记录列表 -->
      <div class="records-table">
        <el-table
          v-loading="loading"
          :data="recordList"
          :empty-text="$t('noMoneyRecord')"
          style="width: 100%"
          stripe
        >
          <el-table-column
            prop="create_time"
            :label="$t('mine.time')"
            width="180"
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
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
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

const { t } = useI18n()
const router = useRouter()

// 状态
const loading = ref(false)
const recordList = ref<RecordItem[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 筛选表单
const filterForm = reactive({
  type: '',
  dateRange: null as [string, string] | null
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

    const resp:any = await api.moneyRecord(params)

    if (resp && resp.code === 200) {
      const data = resp.data
      recordList.value = data.list || []
      total.value = data.pagination?.total || 0
    }
  } catch (error) {
    console.error('获取资金记录失败:', error)
    ElMessage.error(t('getMoneyRecordFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchRecords()
})
</script>

<style scoped>
.money-records-container {
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

.records-table .amount-income {
  color: #67c23a;
  font-weight: 600;
  font-size: 15px;
}

.records-table .amount-expense {
  color: #f56c6c;
  font-weight: 600;
  font-size: 15px;
}

.records-table .el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

/* Element Plus 样式覆盖 */
.money-records-container :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.money-records-container :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.money-records-container :deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.money-records-container :deep(.el-table td) {
  padding: 16px 12px;
}

.money-records-container :deep(.el-table__empty-block) {
  padding: 60px 0;
}

.money-records-container :deep(.el-pagination) {
  padding: 12px 0;
}

@media (min-width: 1600px) {
  .money-records-container {
    max-width: 1400px;
  }
}
</style>
