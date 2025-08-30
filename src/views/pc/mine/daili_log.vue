<template>
  <div class="pc-daili-record">
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
      <h2 class="page-title">{{ $t('agentRecord') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 代理记录表格 -->
      <el-table
        v-loading="loading"
        :data="list"
        class="record-table"
        :empty-text="$t('noAgentRecord')"
        stripe
      >
        <el-table-column
          prop="name"
          :label="$t('agent')"
          min-width="150"
        />
        <el-table-column
          :label="$t('balance')"
          width="150"
          align="right"
        >
          <template #default="{ row }">
            <span class="money-value">¥{{ formatMoney(row.money) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          :label="$t('currentRate')"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            <el-tag type="success">{{ row.fanyong_proportion }}%</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="created_at"
          :label="$t('applyTime')"
          width="180"
        />
        <el-table-column
          :label="$t('common.operate')"
          width="240"
          align="center"
        >
          <template #default="{ row }">
            <el-button-group>
              <el-button
                type="primary"
                size="small"
                @click="handleEdit(row)"
              >
                {{ $t('adjustProportion') }}
              </el-button>
              <el-button
                type="warning"
                size="small"
                @click="handleAddMoney(row)"
              >
                {{ $t('addCredits') }}
              </el-button>
            </el-button-group>
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

    <!-- 编辑比例弹窗 -->
    <el-dialog
      v-model="showEditDialog"
      :title="$t('adjustCommissionRate')"
      width="500px"
      :before-close="handleEditDialogClose"
    >
      <div class="edit-content">
        <div class="edit-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('agent')">
              {{ currentEditItem?.name || '' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('currentRate')">
              {{ currentEditItem?.fanyong_proportion || '0.00' }}%
            </el-descriptions-item>
            <el-descriptions-item :label="$t('yourRate')">
              {{ currentUserInfo?.fanyong_proportion || '0.00' }}%
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-form class="edit-form" label-width="100px">
          <el-form-item :label="$t('newRate')">
            <el-input
              v-model="editProportion"
              type="number"
              :placeholder="$t('enterDecimal')"
              step="0.01"
            >
              <template #suffix>%</template>
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="showEditDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="handleEditConfirm('confirm')"
          :loading="editLoading"
        >
          {{ $t('common.confirm') }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 上分弹窗 -->
    <el-dialog
      v-model="showAddMoneyDialog"
      :title="$t('memberAddCredits')"
      width="500px"
      :before-close="handleAddMoneyDialogClose"
    >
      <div class="add-money-content">
        <div class="add-money-info">
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('member')">
              {{ currentAddMoneyItem?.name || '' }}
            </el-descriptions-item>
            <el-descriptions-item :label="$t('yourBalance')">
              ¥{{ formatMoney(currentUserInfo?.money) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <el-form class="add-money-form" label-width="120px">
          <el-form-item :label="$t('transferAmount')">
            <el-input
              v-model="addMoneyAmount"
              type="number"
              :placeholder="$t('enterTransferAmount')"
              step="0.01"
            />
          </el-form-item>
        </el-form>

        <el-alert
          type="warning"
          :closable="false"
          class="transfer-tips"
        >
          <template #default>
            <div class="tip-list">
              <p>• {{ $t('transferAmountTip1') }}</p>
              <p>• {{ $t('transferAmountTip2') }}</p>
              <p>• {{ $t('transferAmountTip3') }}</p>
            </div>
          </template>
        </el-alert>
      </div>

      <template #footer>
        <el-button @click="showAddMoneyDialog = false">{{ $t('common.cancel') }}</el-button>
        <el-button
          type="primary"
          @click="handleAddMoneyConfirm('confirm')"
          :loading="transferLoading"
        >
          {{ $t('confirmTransfer') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { invokeApi } from '@/utils/tools'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'PcDailiRecord' })

interface DailiRecordItem {
  id: number
  name: string
  created_at: string
  money: string
  fanyong_proportion: string
}

interface UserInfo {
  fanyong_proportion: string
  money: string
}

const router = useRouter()
const { t } = useI18n()

// === 数据状态 ===
const list = ref<DailiRecordItem[]>([])
const currentUserInfo = ref<UserInfo | null>(null)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)
const loading = ref(false)

// === 编辑比例状态 ===
const showEditDialog = ref(false)
const currentEditItem = ref<DailiRecordItem | null>(null)
const editProportion = ref('')
const editLoading = ref(false)

// === 上分状态 ===
const showAddMoneyDialog = ref(false)
const currentAddMoneyItem = ref<DailiRecordItem | null>(null)
const addMoneyAmount = ref('')
const transferLoading = ref(false)

// 格式化金额显示
function formatMoney(amount: string | undefined): string {
  if (!amount) return '0.00'
  const num = parseFloat(amount)
  return isNaN(num) ? '0.00' : num.toFixed(2)
}

// === 初始化 ===
onMounted(() => {
  loadData()
})

// === 核心数据加载函数 ===
async function loadData() {
  loading.value = true

  try {
    const resp:any = await invokeApi('dailiRecord', {
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

      // 更新用户信息
      if (data.user_info) {
        currentUserInfo.value = data.user_info
        updateLocalStorage(data.user_info.money)
      }

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
    ElMessage.error(t('getAgentRecordFailed'))
    list.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 处理分页变化
async function handlePageChange(page: number) {
  currentPage.value = page
  await loadData()
}

// 分页大小变化
function handleSizeChange(val: number) {
  pageSize.value = val
  currentPage.value = 1
  loadData()
}

// === 更新本地存储 ===
function updateLocalStorage(money: string) {
  try {
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}')
    currentUser.money = money
    localStorage.setItem('current_user', JSON.stringify(currentUser))
  } catch (error) {
    // 忽略错误
  }
}

// === 编辑比例 ===
function handleEdit(item: DailiRecordItem) {
  currentEditItem.value = item
  editProportion.value = item.fanyong_proportion
  showEditDialog.value = true
}

function handleEditDialogClose() {
  showEditDialog.value = false
}

async function handleEditConfirm(action: string) {
  if (action !== 'confirm') {
    showEditDialog.value = false
    return true
  }

  if (!currentEditItem.value || !editProportion.value) {
    ElMessage.error(t('enterCommissionRate'))
    return false
  }

  const inputValue = parseFloat(editProportion.value)
  const userProportion = parseFloat(currentUserInfo.value?.fanyong_proportion || '0')

  if (isNaN(inputValue) || inputValue < 0 || inputValue > userProportion) {
    ElMessage.error(t('rateMustBeBetween', { max: userProportion }))
    return false
  }

  editLoading.value = true

  try {
    const resp:any = await invokeApi('dailiEdit', {
      user_id: currentEditItem.value.id,
      fanyong_proportion: inputValue.toFixed(2)
    })

    if (resp && resp.code === 200) {
      ElMessage.success(t('modifySuccess'))

      // 更新列表中的数据
      const index = list.value.findIndex(item => item.id === currentEditItem.value?.id)
      if (index !== -1) {
        list.value[index].fanyong_proportion = inputValue.toFixed(2)
      }

      showEditDialog.value = false
      return true
    } else {
      ElMessage.error(resp?.message || t('modifyFailed'))
      return false
    }
  } catch (error) {
    ElMessage.error(t('modifyFailed'))
    return false
  } finally {
    editLoading.value = false
  }
}

// === 上分功能 ===
function handleAddMoney(item: DailiRecordItem) {
  currentAddMoneyItem.value = item
  addMoneyAmount.value = ''
  showAddMoneyDialog.value = true
}

function handleAddMoneyDialogClose() {
  showAddMoneyDialog.value = false
}

async function handleAddMoneyConfirm(action: string) {
  if (action !== 'confirm') {
    showAddMoneyDialog.value = false
    return true
  }

  if (!currentAddMoneyItem.value || !addMoneyAmount.value) {
    ElMessage.error(t('enterTransferAmount'))
    return false
  }

  const inputValue = parseFloat(addMoneyAmount.value)
  const userMoney = parseFloat(currentUserInfo.value?.money || '0')

  if (isNaN(inputValue) || inputValue <= 0) {
    ElMessage.error(t('enterValidAmount'))
    return false
  }

  if (inputValue > userMoney) {
    ElMessage.error(t('amountExceedsBalance', { balance: userMoney.toFixed(2) }))
    return false
  }

  transferLoading.value = true

  try {
    const resp:any = await invokeApi('dailiAddMemberMoney', {
      user_id: currentAddMoneyItem.value.id,
      amount: inputValue.toFixed(2)
    })

    // 检查成功条件
    const isSuccess = (resp && resp.code === 200) ||
                     (resp && resp.message && resp.message.includes('成功'))

    if (isSuccess) {
      showAddMoneyDialog.value = false
      ElMessage.success(t('transferSuccess'))

      // 刷新数据
      setTimeout(() => {
        loadData()
      }, 500)

      return true
    } else {
      ElMessage.error(resp?.message || t('transferFailed'))
      return false
    }
  } catch (error) {
    ElMessage.error(t('transferFailed'))
    return false
  } finally {
    transferLoading.value = false
  }
}

// === 返回上一页 ===
function handleBack() {
  router.back()
}
</script>

<style scoped>
.pc-daili-record {
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

.money-value {
  font-weight: 600;
  color: #67c23a;
  font-size: 15px;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

.edit-content,
.add-money-content {
  padding: 20px 0;
}

.edit-info,
.add-money-info {
  margin-bottom: 24px;
}

.edit-form,
.add-money-form {
  margin-top: 24px;
}

.transfer-tips {
  margin-top: 20px;
}

.tip-list p {
  margin: 8px 0;
  line-height: 1.6;
}

/* Element Plus 样式覆盖 */
.pc-daili-record :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.pc-daili-record :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.pc-daili-record :deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.pc-daili-record :deep(.el-table td) {
  padding: 16px 12px;
}

.pc-daili-record :deep(.el-table__empty-block) {
  padding: 60px 0;
}

.pc-daili-record :deep(.el-pagination) {
  padding: 12px 0;
}

.pc-daili-record :deep(.el-button-group .el-button) {
  margin: 0;
}

.pc-daili-record :deep(.el-dialog__header) {
  padding: 20px 24px 10px;
  border-bottom: 1px solid #ebeef5;
}

.pc-daili-record :deep(.el-dialog__body) {
  padding: 20px 24px;
}

.pc-daili-record :deep(.el-dialog__footer) {
  padding: 10px 24px 20px;
  border-top: 1px solid #ebeef5;
}

@media (min-width: 1600px) {
  .pc-daili-record {
    max-width: 1400px;
  }
}
</style>
