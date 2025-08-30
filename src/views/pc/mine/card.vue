<template>
  <div class="pc-card">
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
      <h2 class="page-title">{{ t('mine.bankManage') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 账户列表展示 -->
      <div class="pc-bank-list" v-if="list.length > 0">
        <div class="pc-bank-item" v-for="(item) in list" :key="`account-${item.id}`" :class="{ 'is-default': item.is_default }">
          <div class="pc-bank-info">
            <div class="pc-bank-left">
              <div class="pc-bank-name">
                {{ getDisplayName(item) }}
                <el-tag v-if="item.is_default" type="danger" size="small" effect="dark">
                  {{ t('mine.currentDefault') }}
                </el-tag>
              </div>
              <div class="pc-bank-details">{{ getAccountDetails(item) }}</div>
            </div>
            <div class="pc-bank-actions">
              <el-button
                size="small"
                @click="setDefaultHandler(item)"
                :loading="setDefaultLoading === item.id"
                :type="(item.is_default === 1 || item.is_default === 1) ? 'success' : 'default'"
              >
                {{ (item.is_default === 1 || item.is_default === 1 )? t('mine.currentDefault') : t('mine.setDefault') }}
              </el-button>
              <el-button
                size="small"
                type="primary"
                @click="editCardHandler(item)"
              >
                {{ t('mine.edit') }}
              </el-button>
            </div>
          </div>
          <div class="pc-bank-card">{{ getFullAccountNumber(item) }}</div>
          <div class="pc-bank-extra-info">
            <span class="pc-account-holder">{{ t('mine.accountHolder') }}：{{ item.account_name }}</span>
            <span class="pc-account-date">{{ formatDate(item?.created_at as string) }}</span>
          </div>
        </div>
      </div>

      <!-- 无数据提示 -->
      <div class="pc-empty-state" v-else>
        <el-empty :description="t('mine.noAccount')">
          <template #image>
            <div class="pc-empty-icon">
              <span class="icon-bank-empty"></span>
            </div>
          </template>
          <div class="pc-empty-desc">{{ t('mine.addAccountTip') }}</div>
        </el-empty>
      </div>

      <el-button
        type="primary"
        size="large"
        class="pc-btn-add"
        @click.stop="addBindHandler"
      >
        <el-icon><Plus /></el-icon>
        {{ t('mine.addBind') }}
      </el-button>
    </div>

    <!-- 编辑弹窗 -->
    <el-dialog
      v-model="showBottom"
      :title="isEditMode ? t('mine.editAccount') : t('mine.addAccount')"
      width="600px"
      @close="onPopupClose"
      class="pc-card-dialog"
    >
      <el-tabs v-model="activeTab" @tab-click="onClickTab">
        <!-- 银行卡 -->
        <el-tab-pane :label="t('mine.bankCard')" name="bank">
          <el-form :model="frm" label-position="right" label-width="120px">
            <el-form-item :label="t('mine.openingBank')" required>
              <el-input v-model="frm.bank_name" :placeholder="t('mine.inputBankName')" />
            </el-form-item>
            <el-form-item :label="t('mine.accountName')" required>
              <el-input
                v-model="frm.account_name"
                :readonly="isEditMode && frm.account_name.length > 0"
                :placeholder="t('mine.inputAccountName')"
              />
            </el-form-item>
            <el-form-item :label="t('mine.accountNumber')" required>
              <el-input v-model="frm.account_number" :placeholder="t('mine.inputAccountNumber')" />
            </el-form-item>
            <el-form-item :label="t('mine.bankBranch')" required>
              <el-input v-model="frm.bank_branch" :placeholder="t('mine.inputBankBranch')" />
            </el-form-item>
            <el-form-item :label="t('mine.idNumber')">
              <el-input v-model="frm.id_number" :placeholder="t('mine.inputIdNumber')" />
            </el-form-item>
            <el-form-item :label="t('mine.phoneNumber')">
              <el-input v-model="frm.phone_number" :placeholder="t('mine.inputPhoneNumber')" />
            </el-form-item>
            <el-form-item :label="t('mine.setAsDefault')">
              <el-checkbox v-model="frm.is_default" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 汇旺 -->
        <el-tab-pane :label="t('mine.huiwang')" name="huiwang">
          <el-form :model="frm" label-position="right" label-width="120px">
            <el-form-item :label="t('mine.accountName')" required>
              <el-input
                v-model="frm.account_name"
                :readonly="isEditMode && frm.account_name.length > 0"
                :placeholder="t('mine.inputAccountName')"
              />
            </el-form-item>
            <el-form-item :label="t('mine.huiwangAccount')" required>
              <el-input v-model="frm.account_number" :placeholder="t('mine.fillHuiwangAccount')" />
            </el-form-item>
            <el-form-item :label="t('mine.phoneNumber')" required>
              <el-input v-model="frm.phone_number" :placeholder="t('mine.inputHuiwangPhone')" />
            </el-form-item>
            <el-form-item :label="t('mine.setAsDefault')">
              <el-checkbox v-model="frm.is_default" />
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- USDT -->
        <el-tab-pane :label="t('mine.usdt')" name="usdt">
          <el-form :model="frm" label-position="right" label-width="120px">
            <el-form-item :label="t('mine.networkType')" required>
              <el-select v-model="frm.network_type" :placeholder="t('mine.selectNetworkType')">
                <el-option label="TRC20" value="TRC20" />
                <el-option label="ERC20" value="ERC20" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('mine.accountName')" required>
              <el-input
                v-model="frm.account_name"
                :readonly="isEditMode && frm.account_name.length > 0"
                :placeholder="t('mine.inputAccountName')"
              />
            </el-form-item>
            <el-form-item :label="t('mine.walletAddress')" required>
              <el-input v-model="frm.wallet_address" :placeholder="t('mine.inputWalletAddress')" />
            </el-form-item>
            <el-form-item :label="t('mine.setAsDefault')">
              <el-checkbox v-model="frm.is_default" />
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <el-button @click="showBottom = false">{{ t('common.cancel') }}</el-button>
        <el-button
          type="primary"
          :loading="submitLoading"
          @click="handleSubmit"
        >
          {{ isEditMode ? t('mine.updateAccount') : t('common.submit') }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { invokeApi } from '@/utils/tools'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, ArrowLeft } from '@element-plus/icons-vue'

defineOptions({ name: 'PcBankCardManage' })

// 账户类型接口
interface UserAccount {
  id: number
  account_type: 'bank' | 'huiwang' | 'usdt'
  account_name: string
  account_number?: string
  bank_branch?: string
  bank_name?: string
  phone_number?: string
  wallet_address?: string
  network_type?: string
  id_number?: string
  remark_name?: string
  is_default: number
  display_info?: string
  created_at?: string
  account_number_masked?: string
  phone_number_masked?: string
  wallet_address_masked?: string
}

const router = useRouter()
const store = useAppStore()
const { t } = useI18n()

// 响应式数据
const list = ref<UserAccount[]>([])
const showBottom = ref(false)
const activeTab = ref('bank')
const editId = ref(0)
const submitLoading = ref(false)
const setDefaultLoading = ref(0)

// 是否为编辑模式
const isEditMode = computed(() => editId.value > 0)

// 表单数据
const frm = ref({
  account_type: 'bank' as 'bank' | 'huiwang' | 'usdt',
  account_name: '',
  bank_name: '',
  account_number: '',
  bank_branch: '',
  phone_number: '',
  wallet_address: '',
  network_type: 'TRC20',
  id_number: '',
  is_default: false
})

// 重置表单
function resetForm() {
  frm.value = {
    account_type: 'bank',
    account_name: store.getUser()?.realname ?? '',
    bank_name: '',
    account_number: '',
    bank_branch: '',
    phone_number: '',
    wallet_address: '',
    network_type: 'TRC20',
    id_number: '',
    is_default: false
  }
  editId.value = 0
  activeTab.value = 'bank'
}

// 设为默认处理函数
async function setDefaultHandler(item: UserAccount) {
  if (item.is_default === 1) {
    ElMessage.warning(t('mine.alreadyDefault'))
    return
  }

  try {
    await ElMessageBox.confirm(
      t('mine.confirmSetDefaultMsg', { name: getDisplayName(item) }),
      t('mine.confirmSetDefault'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    setDefaultLoading.value = item.id

    const resp:any = await invokeApi('setDefaultAccount', { account_id: item.id })

    if (resp && resp.code === 200) {
      ElMessage.success(t('mine.switchSuccess'))
      await loadAccountList()
    } else {
      throw new Error(t('mine.switchFailed'))
    }
  } catch (err) {
    if (err !== 'cancel') {
      const msg = (err as Error).message
      ElMessage.error(msg || t('mine.switchFailed'))
    }
  } finally {
    setDefaultLoading.value = 0
  }
}

// 获取显示名称
function getDisplayName(item: UserAccount): string {
  switch (item.account_type) {
    case 'bank':
      return item.bank_name || item.remark_name || t('mine.bankCard')
    case 'huiwang':
      return t('mine.huiwang')
    case 'usdt':
      return `${t('mine.usdt')}-${item.network_type || 'TRC20'}`
    default:
      return item.account_name || t('mine.accountType')
  }
}

// 获取账户详细信息
function getAccountDetails(item: UserAccount): string {
  switch (item.account_type) {
    case 'bank':
      return `${t('mine.bankBranch')}：${item.bank_branch || t('mine.notSet')}`
    case 'huiwang':
      return `${t('mine.phoneNumber')}：${item.phone_number_masked || t('mine.notSet')}`
    case 'usdt':
      return `${t('mine.networkType')}：${item.network_type || 'TRC20'}`
    default:
      return ''
  }
}

// 获取完整账号信息
function getFullAccountNumber(item: UserAccount): string {
  switch (item.account_type) {
    case 'bank':
      return item.account_number_masked || maskBankCardForDisplay(item.account_number || '')
    case 'huiwang':
      return `${t('mine.accountNumber')}：${item.account_number_masked || maskAccount(item.account_number || '')}`
    case 'usdt':
      return `${t('mine.walletAddress')}：${item.wallet_address_masked || maskWalletAddressForDisplay(item.wallet_address || '')}`
    default:
      return item.account_number || ''
  }
}

// 银行卡号脱敏
function maskBankCardForDisplay(cardNo: string): string {
  if (!cardNo || cardNo.length < 8) return cardNo
  return cardNo.slice(0, 6) + '*'.repeat(Math.max(cardNo.length - 10, 4)) + cardNo.slice(-4)
}

// 钱包地址脱敏
function maskWalletAddressForDisplay(address: string): string {
  if (!address || address.length < 12) return address
  return address.slice(0, 8) + '...' + address.slice(-8)
}

// 账号脱敏
function maskAccount(account: string): string {
  if (!account || account.length < 6) return account
  return account.slice(0, 3) + '*'.repeat(account.length - 6) + account.slice(-3)
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(t('common.locale'), {
    month: 'short',
    day: 'numeric'
  })
}

// 添加绑定按钮事件
function addBindHandler() {
  resetForm()
  showBottom.value = true
}

// 弹窗关闭事件
function onPopupClose() {
  if (!submitLoading.value) {
    resetForm()
  }
}

// 点击tab事件
function onClickTab(tab: any) {
  const name = tab.props.name
  switch (name) {
    case 'bank':
      frm.value.account_type = 'bank'
      break
    case 'huiwang':
      frm.value.account_type = 'huiwang'
      break
    case 'usdt':
      frm.value.account_type = 'usdt'
      frm.value.network_type = 'TRC20'
      break
  }
}

// 修改按钮事件
async function editCardHandler(item: UserAccount) {
  editId.value = item.id

  frm.value.account_name = item.account_name || store.getUser()?.realname || ''
  frm.value.is_default = !!item.is_default

  switch (item.account_type) {
    case 'bank':
      activeTab.value = 'bank'
      frm.value.account_type = 'bank'
      frm.value.bank_name = item.bank_name || item.remark_name || ''
      frm.value.account_number = item.account_number || ''
      frm.value.bank_branch = item.bank_branch || ''
      frm.value.phone_number = item.phone_number || ''
      frm.value.id_number = item.id_number || ''
      break
    case 'huiwang':
      activeTab.value = 'huiwang'
      frm.value.account_type = 'huiwang'
      frm.value.account_number = item.account_number || ''
      frm.value.phone_number = item.phone_number || ''
      break
    case 'usdt':
      activeTab.value = 'usdt'
      frm.value.account_type = 'usdt'
      frm.value.wallet_address = item.wallet_address || ''
      frm.value.network_type = item.network_type || 'TRC20'
      break
  }

  showBottom.value = true
}

// 统一提交处理
function handleSubmit() {
  switch (activeTab.value) {
    case 'bank':
      submitBankHandler()
      break
    case 'huiwang':
      submitHuiwangHandler()
      break
    case 'usdt':
      submitUsdtHandler()
      break
  }
}

// 提交银行卡信息
async function submitBankHandler() {
  if (frm.value.bank_name.trim().length <= 0) {
    ElMessage.warning(t('mine.fillBankName'))
    return
  }
  if (frm.value.account_name.trim().length <= 0) {
    ElMessage.warning(t('mine.fillAccountName'))
    return
  }
  if (frm.value.account_number.trim().length <= 0) {
    ElMessage.warning(t('mine.fillAccountNumber'))
    return
  }
  if (frm.value.bank_branch.trim().length <= 0) {
    ElMessage.warning(t('mine.fillBankBranch'))
    return
  }

  const data = {
    account_type: 'bank',
    account_name: frm.value.account_name,
    remark_name: frm.value.bank_name,
    bank_name: frm.value.bank_name,
    account_number: frm.value.account_number,
    bank_branch: frm.value.bank_branch,
    phone_number: frm.value.phone_number,
    id_number: frm.value.id_number,
    is_default: frm.value.is_default
  }

  if (isEditMode.value) {
    await editAccount(editId.value, data)
  } else {
    await addAccount(data)
  }
}

// 提交汇旺信息
async function submitHuiwangHandler() {
  if (frm.value.account_name.trim().length <= 0) {
    ElMessage.warning(t('mine.fillAccountName'))
    return
  }
  if (frm.value.account_number.trim().length <= 0) {
    ElMessage.warning(t('mine.fillHuiwangAccount'))
    return
  }
  if (frm.value.phone_number.trim().length <= 0) {
    ElMessage.warning(t('mine.fillPhoneNumber'))
    return
  }

  const data = {
    account_type: 'huiwang',
    account_name: frm.value.account_name,
    account_number: frm.value.account_number,
    phone_number: frm.value.phone_number,
    is_default: frm.value.is_default
  }

  if (isEditMode.value) {
    await editAccount(editId.value, data)
  } else {
    await addAccount(data)
  }
}

// 提交USDT信息
async function submitUsdtHandler() {
  if (frm.value.network_type.trim().length <= 0) {
    ElMessage.warning(t('mine.selectNetwork'))
    return
  }
  if (frm.value.account_name.trim().length <= 0) {
    ElMessage.warning(t('mine.fillAccountName'))
    return
  }
  if (frm.value.wallet_address.trim().length <= 0) {
    ElMessage.warning(t('mine.fillWalletAddress'))
    return
  }

  const data = {
    account_type: 'usdt',
    account_name: frm.value.account_name,
    wallet_address: frm.value.wallet_address,
    network_type: frm.value.network_type,
    is_default: frm.value.is_default
  }

  if (isEditMode.value) {
    await editAccount(editId.value, data)
  } else {
    await addAccount(data)
  }
}

// 调用添加账户API
async function addAccount(data: object) {
  submitLoading.value = true
  try {
    const resp:any = await invokeApi('addAccount', data)
    if (resp && resp.code === 200) {
      showBottom.value = false
      ElMessage.success(t('mine.addSuccess'))
      await loadAccountList()
      resetForm()
    } else {
      throw new Error(resp.message || t('mine.addFailed'))
    }
  } catch (err) {
    const msg = (err as Error).message
    ElMessage.error(msg || t('mine.addFailed'))
  } finally {
    submitLoading.value = false
  }
}

// 调用编辑账户API
async function editAccount(id: number, data: object) {
  submitLoading.value = true
  try {
    const editData = {
      id: id,
      ...data
    }
    const resp:any = await invokeApi('editAccount', editData)
    if (resp && resp.code === 200) {
      showBottom.value = false
      ElMessage.success(t('mine.updateSuccess'))
      await loadAccountList()
      resetForm()
    } else {
      throw new Error(resp.message || t('mine.updateFailed'))
    }
  } catch (err) {
    const msg = (err as Error).message
    ElMessage.error(msg || t('mine.updateFailed'))
  } finally {
    submitLoading.value = false
  }
}

// 获取用户账户列表
async function loadAccountList() {
  try {
    const resp:any = await invokeApi('accountList')
    if (resp && resp.code === 200) {
      list.value = resp.data?.list || []
    } else {
      list.value = []
    }
  } catch (err) {
    list.value = []
    ElMessage.error(t('mine.loadFailed'))
  }
}

// 初始化
async function init() {
  store.loading()
  try {
    await loadAccountList()
  } finally {
    store.stopLoad()
  }
}

// 返回按钮
function handleBack() {
  router.back()
}

onMounted(() => {
  init()
})
</script>

<style lang="less" scoped>
.pc-card {
  min-height: 100vh;
  background: #f5f7fa;
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

  .pc-bank-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 30px;

    .pc-bank-item {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 20px;
      color: #fff;
      position: relative;
      transition: all 0.3s;
      min-height: 180px;
      display: flex;
      flex-direction: column;
      gap: 12px;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
      }

      &.is-default {
        border: 2px solid #ff6b35;
        box-shadow: 0 0 20px rgba(255, 107, 53, 0.3);
      }

      .pc-bank-info {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;

        .pc-bank-left {
          .pc-bank-name {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .pc-bank-details {
            font-size: 14px;
            opacity: 0.9;
          }
        }

        .pc-bank-actions {
          display: flex;
          gap: 10px;
        }
      }

      .pc-bank-card {
        font-size: 18px;
        font-weight: 500;
        word-break: break-all;
        line-height: 1.5;
      }

      .pc-bank-extra-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 14px;
        opacity: 0.85;
        margin-top: auto;

        .pc-account-holder {
          font-size: 14px;
        }

        .pc-account-date {
          font-size: 12px;
          opacity: 0.7;
        }
      }
    }
  }

  .pc-empty-state {
    padding: 60px 0;
    text-align: center;

    .pc-empty-icon {
      font-size: 80px;
      margin-bottom: 20px;

      .icon-bank-empty {
        display: inline-block;
        width: 80px;
        height: 80px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          width: 80px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          top: 10px;
          opacity: 0.3;
        }

        &::after {
          content: '';
          position: absolute;
          width: 60px;
          height: 40px;
          background: #fff;
          border-radius: 4px;
          top: 20px;
          left: 10px;
          box-shadow: inset 0 0 0 2px #667eea;
        }
      }
    }

    .pc-empty-desc {
      margin-top: 10px;
      color: #909399;
      font-size: 14px;
    }
  }

  .pc-btn-add {
    display: block;
    margin: 40px auto 0;
    width: 200px;
    height: 44px;
  }
}

// 弹窗样式
.pc-card-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }

  .el-form {
    padding: 20px 0;
  }
}

@media (min-width: 1600px) {
  .pc-card {
    max-width: 1400px;
  }
}
</style>
