<template>
  <div class="pc-fanshui-record">
    <!-- PC端头部 -->
    <div class="pc-header">
      <el-button
        type="primary"
        :icon="ArrowLeft"
        @click="handleBack"
        class="back-btn"
      >
        {{ t('common.back') }}
      </el-button>
      <h2 class="page-title">{{ t('records.rebateRecord') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 返水记录表格 -->
      <el-table
        v-loading="loading"
        :data="list"
        class="record-table"
        :empty-text="t('mine.noRebateRecord')"
        stripe
      >
        <el-table-column
          prop="remark"
          :label="t('common.remark')"
          min-width="200"
        />
        <el-table-column
          prop="create_time"
          :label="t('moneyLog.tradeDate')"
          width="180"
        />
        <el-table-column
          prop="money_display"
          :label="t('records.rebateAmount')"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <span :class="getAmountClass(row.money)">
              {{ row.money_display }}
            </span>
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

defineOptions({ name: 'PcFanshuiRecord' })

interface FanshuiRecordItem {
  id: number
  create_time: string
  money: string
  money_display: string
  remark: string
}

const router = useRouter()
const { t } = useI18n()

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 数据相关
const list = ref<FanshuiRecordItem[]>([])
const loading = ref(false)

// 获取金额样式类
function getAmountClass(money: string): string {
  const amount = parseFloat(money)
  return amount >= 0 ? 'amount-positive' : 'amount-negative'
}

// 处理分页变化
async function handlePageChange(page: number) {
  currentPage.value = page
  await getFanshuiRecords()
}

// 分页大小变化
function handleSizeChange(val: number) {
  pageSize.value = val
  currentPage.value = 1
  getFanshuiRecords()
}

// 返回上一页
function handleBack() {
  router.back()
}

// 获取返水记录
async function getFanshuiRecords() {
  loading.value = true

  try {
    const resp:any = await invokeApi('fanshuiRecord', {
      page: currentPage.value,
      limit: pageSize.value
    })

    if (!resp) {
      loading.value = false
      return
    }

    if (resp.data) {
      const data = resp.data
      list.value = data.list || []

      // 更新分页信息
      if (data.pagination) {
        total.value = data.pagination.total || 0
        currentPage.value = data.pagination.current_page || 1
      }
    } else {
      list.value = []
      total.value = 0
    }
  } catch (error) {
    ElMessage.error(t('mine.getRebateRecordFailed'))
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  getFanshuiRecords()
})
</script>

<style scoped>
.pc-fanshui-record {
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

.record-table {
  width: 100%;
  margin-bottom: 20px;
}

.amount-positive {
  color: #67c23a;
  font-weight: 600;
  font-size: 16px;
}

.amount-negative {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

/* Element Plus 样式覆盖 */
.pc-fanshui-record :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.pc-fanshui-record :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.pc-fanshui-record :deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.pc-fanshui-record :deep(.el-table td) {
  padding: 16px 12px;
}

.pc-fanshui-record :deep(.el-table__empty-block) {
  padding: 60px 0;
}

.pc-fanshui-record :deep(.el-pagination) {
  padding: 12px 0;
}

@media (min-width: 1600px) {
  .pc-fanshui-record {
    max-width: 1400px;
  }
}
</style>
