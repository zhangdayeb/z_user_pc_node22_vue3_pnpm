<template>
  <div class="daili-record">
    <van-nav-bar
      left-arrow
      :title="$t('agentRecord')"
      @click-left="onClickLeft"
      class="nav-bar"
    />

    <!-- 代理记录列表 -->
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
        >
          <div class="record-info">
            <div class="record-title">{{ item.name }}</div>
            <div class="record-time">{{ $t('balance') }}:{{ item.money }}</div>
            <div class="record-time">{{ item.created_at }}</div>
          </div>
          <div class="record-action">
            <div class="record-proportion">{{ item.fanyong_proportion }}%</div>
            <div class="action-buttons">
              <van-button
                type="primary"
                size="small"
                @click="handleEdit(item)"
                class="edit-btn"
              >
                {{ $t('adjustProportion') }}
              </van-button>
              <van-button
                type="warning"
                size="small"
                @click="handleAddMoney(item)"
                class="add-money-btn"
              >
                {{ $t('addCredits') }}
              </van-button>
            </div>
          </div>
        </div>
      </van-list>
    </van-pull-refresh>

    <!-- 空状态 -->
    <van-empty
      v-if="!loading && !refreshing && list.length === 0"
      :description="$t('noAgentRecord')"
      image="https://img.yzcdn.cn/vant/custom-empty-image.png"
    />

    <!-- 编辑比例弹窗 -->
    <van-dialog
      v-model:show="showEditDialog"
      :title="$t('adjustCommissionRate')"
      show-cancel-button
      :confirm-button-text="$t('confirm')"
      :cancel-button-text="$t('cancel')"
      :before-close="handleEditConfirm"
    >
      <div class="edit-content">
        <div class="edit-info">
          <p>{{ $t('agent') }}：{{ currentEditItem?.name || '' }}</p>
          <p>{{ $t('currentRate') }}：{{ currentEditItem?.fanyong_proportion || '0.00' }}</p>
          <p>{{ $t('yourRate') }}：{{ currentUserInfo?.fanyong_proportion || '0.00' }}</p>
        </div>
        <van-field
          v-model="editProportion"
          type="number"
          :label="$t('newRate')"
          :placeholder="$t('enterDecimal')"
          step="0.01"
        />
      </div>
    </van-dialog>

    <!-- 上分弹窗 -->
    <van-dialog
      v-model:show="showAddMoneyDialog"
      :title="$t('memberAddCredits')"
      show-cancel-button
      :confirm-button-text="$t('confirmTransfer')"
      :cancel-button-text="$t('cancel')"
      :before-close="handleAddMoneyConfirm"
    >
      <div class="add-money-content">
        <div class="add-money-info">
          <p>{{ $t('member') }}：{{ currentAddMoneyItem?.name || '' }}</p>
          <p>{{ $t('yourBalance') }}：{{ currentUserInfo?.money || '0.00' }}</p>
        </div>
        <van-field
          v-model="addMoneyAmount"
          type="number"
          :label="$t('transferAmount')"
          :placeholder="$t('enterTransferAmount')"
          step="0.01"
        />
        <div class="add-money-tips">
          <p class="tip-text">• {{ $t('transferAmountTip1') }}</p>
          <p class="tip-text">• {{ $t('transferAmountTip2') }}</p>
          <p class="tip-text">• {{ $t('transferAmountTip3') }}</p>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { invokeApi } from '@/utils/tools'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'DailiRecord' })

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
const loading = ref(false)
const refreshing = ref(false)
const finished = ref(false)

// === 编辑比例状态 ===
const showEditDialog = ref(false)
const currentEditItem = ref<DailiRecordItem | null>(null)
const editProportion = ref('')

// === 上分状态 ===
const showAddMoneyDialog = ref(false)
const currentAddMoneyItem = ref<DailiRecordItem | null>(null)
const addMoneyAmount = ref('')

// === 初始化 ===
onMounted(() => {
  loadData(1, true)
})

// === 核心数据加载函数 ===
async function loadData(page: number, isRefresh: boolean = false) {
  try {
    console.log(`开始加载第${page}页数据，是否刷新:${isRefresh}`)

    if (isRefresh) {
      loading.value = false
      finished.value = false
      currentPage.value = 1
      list.value = []
    } else {
      loading.value = true
    }

    const resp = await invokeApi('dailiRecord', {
      page: page,
      limit: 20
    })

    if (!resp || !resp.message) {
      console.error('API响应异常')
      finished.value = true
      return
    }

    const data = resp.message
    console.log('API响应数据:', data)

    // 更新用户信息
    if (data.user_info) {
      currentUserInfo.value = data.user_info
      updateLocalStorage(data.user_info.money)
      console.log('更新用户信息:', currentUserInfo.value)
    }

    // 处理列表数据
    const newList = data.list || []
    if (page === 1) {
      list.value = newList
      console.log('设置第一页数据，共:', newList.length, '条')
    } else {
      list.value = [...list.value, ...newList]
      console.log('追加第', page, '页数据，新增:', newList.length, '条，总计:', list.value.length, '条')
    }

    // 更新分页状态
    currentPage.value = page
    finished.value = !data.pagination?.has_more

    console.log('数据加载完成，当前页:', currentPage.value, '是否还有更多:', !finished.value)

  } catch (error) {
    console.error('加载数据失败:', error)
    finished.value = true
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

// === 下拉刷新 ===
async function onRefresh() {
  console.log('=== 开始下拉刷新 ===')
  await loadData(1, true)
  console.log('=== 下拉刷新完成 ===')
}

// === 上拉加载更多 ===
async function onLoad() {
  console.log('=== 开始加载更多 ===')
  await loadData(currentPage.value + 1, false)
  console.log('=== 加载更多完成 ===')
}

// === 更新本地存储 ===
function updateLocalStorage(money: string) {
  try {
    const currentUser = JSON.parse(localStorage.getItem('current_user') || '{}')
    currentUser.money = money
    localStorage.setItem('current_user', JSON.stringify(currentUser))
    console.log('localStorage已更新，余额:', money)
  } catch (error) {
    console.error('更新localStorage失败:', error)
  }
}

// === 编辑比例 ===
function handleEdit(item: DailiRecordItem) {
  console.log('打开编辑弹窗:', item.name)
  currentEditItem.value = item
  editProportion.value = item.fanyong_proportion
  showEditDialog.value = true
}

async function handleEditConfirm(action: string) {
  if (action !== 'confirm') {
    showEditDialog.value = false
    return true
  }

  if (!currentEditItem.value || !editProportion.value) {
    showToast(t('enterCommissionRate'))
    return false
  }

  const inputValue = parseFloat(editProportion.value)
  const userProportion = parseFloat(currentUserInfo.value?.fanyong_proportion || '0')

  if (isNaN(inputValue) || inputValue < 0 || inputValue > userProportion) {
    showToast(t('rateMustBeBetween', { max: userProportion }))
    return false
  }

  try {
    const resp = await invokeApi('dailiEdit', {
      user_id: currentEditItem.value.id,
      fanyong_proportion: inputValue.toFixed(2)
    })

    if (resp && resp.code === 200) {
      showToast(t('modifySuccess'))

      // 更新列表中的数据
      const index = list.value.findIndex(item => item.id === currentEditItem.value?.id)
      if (index !== -1) {
        list.value[index].fanyong_proportion = inputValue.toFixed(2)
      }

      showEditDialog.value = false
      return true
    } else {
      showToast(resp?.message || t('modifyFailed'))
      return false
    }
  } catch (error) {
    console.error('修改失败:', error)
    showToast(t('modifyFailed'))
    return false
  }
}

// === 上分功能 ===
function handleAddMoney(item: DailiRecordItem) {
  console.log('打开上分弹窗:', item.name)
  currentAddMoneyItem.value = item
  addMoneyAmount.value = ''
  showAddMoneyDialog.value = true
}

async function handleAddMoneyConfirm(action: string) {
  if (action !== 'confirm') {
    showAddMoneyDialog.value = false
    return true
  }

  if (!currentAddMoneyItem.value || !addMoneyAmount.value) {
    showToast(t('enterTransferAmount'))
    return false
  }

  const inputValue = parseFloat(addMoneyAmount.value)
  const userMoney = parseFloat(currentUserInfo.value?.money || '0')

  if (isNaN(inputValue) || inputValue <= 0) {
    showToast(t('enterValidAmount'))
    return false
  }

  if (inputValue > userMoney) {
    showToast(t('amountExceedsBalance', { balance: userMoney.toFixed(2) }))
    return false
  }

  try {
    console.log('发送转账请求:', {
      user_id: currentAddMoneyItem.value.id,
      amount: inputValue.toFixed(2)
    })

    const resp = await invokeApi('dailiAddMemberMoney', {
      user_id: currentAddMoneyItem.value.id,
      amount: inputValue.toFixed(2)
    })

    console.log('转账响应:', resp)

    // 检查成功条件
    const isSuccess = (resp && resp.code === 200) ||
                     (resp && resp.message && resp.message.includes('成功'))

    if (isSuccess) {
      showAddMoneyDialog.value = false

      // 延时提示和刷新
      setTimeout(() => {
        showToast(t('transferSuccess'))
      }, 200)

      setTimeout(() => {
        console.log('转账成功，开始刷新列表')
        onRefresh()
      }, 400)

      return true
    } else {
      showToast(resp?.message || t('transferFailed'))
      return false
    }
  } catch (error) {
    console.error('转账失败:', error)
    showToast(t('transferFailed'))
    return false
  }
}

// === 返回上一页 ===
function onClickLeft() {
  router.back()
}
</script>

<style scoped>
.daili-record {
  min-height: 100vh;
  background-color: #f7f8fa;
}

.nav-bar {
  background-color: #fff;
  border-bottom: 1px solid #ebedf0;
}

.record-list {
  padding: 16px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.record-info {
  flex: 1;
}

.record-title {
  font-size: 16px;
  color: #333;
  font-weight: 500;
  margin-bottom: 4px;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.record-action {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.record-proportion {
  font-size: 14px;
  color: #07c160;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn, .add-money-btn {
  min-width: 70px;
  height: 32px;
  font-size: 12px;
}

.edit-content, .add-money-content {
  padding: 16px;
}

.edit-info, .add-money-info {
  margin-bottom: 16px;
}

.edit-info p, .add-money-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #666;
}

.add-money-tips {
  margin-top: 16px;
  padding: 12px;
  background-color: #f7f8fa;
  border-radius: 6px;
}

.tip-text {
  margin: 4px 0;
  font-size: 12px;
  color: #999;
  line-height: 1.4;
}

.daili-record :deep(.van-list__finished-text) {
  color: #999;
  font-size: 12px;
  padding: 20px 0;
}

.daili-record :deep(.van-empty) {
  padding: 100px 0;
}

.daili-record :deep(.van-dialog) {
  border-radius: 12px;
}

.daili-record :deep(.van-field__label) {
  font-size: 14px;
  color: #333;
}

.daili-record :deep(.van-field__control) {
  font-size: 14px;
}

.daili-record :deep(.van-button--warning) {
  background-color: #ff976a;
  border-color: #ff976a;
}

.daili-record :deep(.van-button--warning):active {
  background-color: #e8663c;
  border-color: #e8663c;
}
</style>
