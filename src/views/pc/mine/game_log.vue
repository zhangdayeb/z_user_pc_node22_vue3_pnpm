<template>
  <div class="pc-game-record">
    <!-- PC端头部 -->
    <div class="pc-header">
      <el-button
        type="primary"
        :icon="ArrowLeft"
        @click="onClickLeft"
        class="back-btn"
      >
        {{ $t('common.back') }}
      </el-button>
      <h2 class="page-title">{{ $t('mine.gameLog') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 游戏记录表格 -->
      <el-table
        v-loading="loading"
        :data="list"
        class="record-table"
        :empty-text="$t('noGameRecord')"
        stripe
      >
        <el-table-column
          prop="operate_type_text"
          :label="$t('mine.operateType')"
          min-width="150"
        />
        <el-table-column
          prop="money_type_text"
          :label="$t('mine.walletType')"
          width="120"
        />
        <el-table-column
          prop="description"
          :label="$t('moneyLog.desc')"
          min-width="200"
          show-overflow-tooltip
        />
        <el-table-column
          prop="created_at"
          :label="$t('moneyLog.tradeDate')"
          width="180"
        >
          <template #default="{ row }">
            {{ row.created_at || $t('timeUnknown') }}
          </template>
        </el-table-column>
        <el-table-column
          prop="amount_display"
          :label="$t('mine.moneyLogAmount')"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <span :class="getAmountClass(row.money)">
              {{ row.amount_display }}
            </span>
          </template>
        </el-table-column>
        <el-table-column
          prop="money_after"
          :label="$t('moneyLog.afterMoney')"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            {{ row.money_after }}
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页组件 -->
      <el-pagination
        v-if="total > 0"
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :background="true"
        layout="total, prev, pager, next, jumper"
        @current-change="handlePageChange"
        class="pagination"
      />

      <!-- 空状态 -->
      <el-empty
        v-if="!loading && list.length === 0"
        :description="$t('noGameRecord')"
        class="empty-state"
      />

      <!-- 刷新按钮 -->
      <el-button
        v-if="list.length > 0"
        type="primary"
        :loading="refreshing"
        @click="onRefresh"
        class="refresh-btn"
        :icon="Refresh"
      >
        {{ $t('refresh') }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Refresh } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { invokeApi } from '@/utils/tools'

defineOptions({ name: 'PcGameRecord' })

interface GameRecordItem {
  id: number
  member_id: number
  money: string
  money_before: string
  money_after: string
  money_type: string
  money_type_text: string
  number_type: number
  operate_type: number
  operate_type_text: string
  operate_type_color: string
  user_id: number
  model_name: string
  model_id: number
  description: string
  remark: string
  amount_display: string
  created_at: string | null
  updated_at: string | null
}

const router = useRouter()
const { t } = useI18n()

// 分页相关
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

// 数据相关
const list = ref<GameRecordItem[]>([])
const loading = ref(false)
const refreshing = ref(false)

// 获取金额样式类
function getAmountClass(money: string): string {
  const amount = parseFloat(money)
  return amount >= 0 ? 'amount-positive' : 'amount-negative'
}

// 刷新数据
async function onRefresh() {
  refreshing.value = true
  currentPage.value = 1
  await getGameRecords()
  refreshing.value = false
  ElMessage.success(t('success'))
}

// 处理分页变化
async function handlePageChange(page: number) {
  currentPage.value = page
  await getGameRecords()
}

// 返回上一页
function onClickLeft() {
  router.back()
}

// 获取游戏记录
async function getGameRecords() {
  loading.value = true

  try {
    const resp = await invokeApi('gameRecord', {
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
    ElMessage.error(t('getGameRecordFailed'))
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 页面加载时获取数据
onMounted(() => {
  getGameRecords()
})
</script>

<style scoped>
.pc-game-record {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
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
  position: relative;
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
  display: flex;
  justify-content: center;
}

.empty-state {
  padding: 80px 0;
}

.refresh-btn {
  position: absolute;
  top: 24px;
  right: 24px;
}

/* Element Plus 样式覆盖 */
.pc-game-record :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.pc-game-record :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.pc-game-record :deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.pc-game-record :deep(.el-table td) {
  padding: 16px 12px;
}

.pc-game-record :deep(.el-table__empty-block) {
  padding: 60px 0;
}

.pc-game-record :deep(.el-pagination) {
  padding: 12px 0;
}

/* 大屏优化 */
@media (min-width: 1200px) {
  .pc-game-record {
    max-width: 1400px;
    margin: 0 auto;
  }
}

@media (min-width: 1600px) {
  .pc-game-record {
    max-width: 1600px;
  }
}
</style>
