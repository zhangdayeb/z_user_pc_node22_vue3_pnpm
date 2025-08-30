<template>
  <div class="pc-topup-record">
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
      <h2 class="page-title">{{ $t('deposit.rechargeRecord') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :inline="true" class="filter-form">
          <el-form-item :label="$t('moneyLog.status')">
            <el-select
              v-model="activeStatus"
              :placeholder="$t('common.all')"
              clearable
              @change="handleFilterChange"
            >
              <el-option :label="$t('common.all')" value="" />
              <el-option :label="$t('common.pending')" value="0" />
              <el-option :label="$t('common.approved')" value="1" />
              <el-option :label="$t('common.rejected')" value="2" />
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

      <!-- 充值记录表格 -->
      <el-table
        v-loading="loading"
        :data="list"
        class="record-table"
        :empty-text="$t('common.noData')"
        stripe
      >
        <el-table-column
          prop="create_time"
          :label="$t('deposit.applyTime')"
          width="180"
        >
          <template #default="{ row }">
            {{ formatTime(row.create_time) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="id"
          :label="$t('deposit.orderNumber')"
          width="150"
        />

        <el-table-column
          prop="amount"
          :label="$t('deposit.rechargeAmount')"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <span :class="getAmountClass(row.status)">
              ¥{{ row.amount }}
            </span>
          </template>
        </el-table-column>

        <el-table-column
          prop="status_text"
          :label="$t('moneyLog.status')"
          width="120"
        >
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="success_time"
          :label="$t('deposit.completeTime')"
          width="180"
        >
          <template #default="{ row }">
            {{ row.success_time ? formatTime(row.success_time) : '-' }}
          </template>
        </el-table-column>

        <el-table-column
          prop="u_bank_name"
          :label="$t('deposit.transferBankName')"
          min-width="150"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ row.u_bank_name || '-' }}
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

// 获取状态文本
function getStatusText(status: number): string {
  switch (status) {
    case 0:
      return t('common.pending')
    case 1:
      return t('common.approved')
    case 2:
      return t('common.rejected')
    default:
      return t('deposit.unknownStatus')
  }
}

// 格式化时间
function formatTime(timeStr: string): string {
  if (!timeStr) return '-'

  try {
    const date = new Date(timeStr)
    const currentLocale = t('common.locale')

    return date.toLocaleString(currentLocale, {
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
  getTopUpRecords()
}

// 搜索
function handleSearch() {
  currentPage.value = 1
  getTopUpRecords()
}

// 重置
function handleReset() {
  activeStatus.value = ''
  currentPage.value = 1
  getTopUpRecords()
}

// 分页大小变化
function handleSizeChange(val: number) {
  pageSize.value = val
  currentPage.value = 1
  getTopUpRecords()
}

// 页码变化
function handlePageChange(val: number) {
  currentPage.value = val
  getTopUpRecords()
}

// 返回上一页
function handleBack() {
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

    const resp:any = await invokeApi('topUpRecord', params)

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
    ElMessage.error(t('deposit.getRechargeRecordFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getTopUpRecords()
})
</script>

<style scoped>
.pc-topup-record {
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

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

/* Element Plus 样式覆盖 */
.pc-topup-record :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.pc-topup-record :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.pc-topup-record :deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.pc-topup-record :deep(.el-table td) {
  padding: 16px 12px;
}

.pc-topup-record :deep(.el-table__empty-block) {
  padding: 60px 0;
}

.pc-topup-record :deep(.el-pagination) {
  padding: 12px 0;
}

@media (min-width: 1600px) {
  .pc-topup-record {
    max-width: 1400px;
  }
}
</style>
