<template>
  <div class="pc-withdraw-apply">
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
      <h2 class="page-title">{{ $t('mine.submitWithdraw') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 提现表单 -->
      <div class="form-section">
        <el-form
          ref="withdrawFormRef"
          :model="frm"
          :rules="rules"
          label-width="140px"
          @submit.prevent="onSubmit"
          class="withdraw-form"
        >
          <!-- 用户信息 -->
          <el-form-item :label="$t('mine.name')">
            <el-input
              v-model="frm.name"
              readonly
              :prefix-icon="User"
              class="readonly-input"
            />
          </el-form-item>

          <!-- 可提现余额 -->
          <el-form-item :label="$t('mine.canDrawMoney')">
            <el-input
              :model-value="store.getUser()?.money ?? 0"
              readonly
              :prefix-icon="Wallet"
              class="readonly-input"
            >
              <template #append>
                <span class="currency-unit">{{ $t('common.yuan') }}</span>
              </template>
            </el-input>
          </el-form-item>

          <!-- 收款账户 -->
          <el-form-item :label="$t('mine.paymentAddress')" prop="account_id">
            <div class="account-row">
              <el-select
                v-model="frm.account_id"
                :placeholder="$t('common.selected')"
                class="account-select"
                @change="changeAccountHandler"
              >
                <el-option
                  v-for="account in accountList"
                  :key="account.value"
                  :label="account.text"
                  :value="account.value"
                >
                  <div class="account-option">
                    <span class="account-name">{{ account.text }}</span>
                    <el-tag v-if="account.isDefault" type="success" size="small">
                      {{ $t('mine.defaultBadge') }}
                    </el-tag>
                  </div>
                </el-option>
              </el-select>
              <el-button
                type="primary"
                :icon="Plus"
                @click="goAddAccount"
                class="add-account-btn"
              >
                {{ $t('common.add') }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 账户名称 -->
          <el-form-item :label="$t('mine.cardName')" v-if="selectedAccount">
            <el-input
              :model-value="selectedAccount?.account_name || ''"
              readonly
              :prefix-icon="CreditCard"
              class="readonly-input"
            />
          </el-form-item>

          <!-- 账户信息 -->
          <el-form-item :label="$t('mine.cardAccount')" v-if="selectedAccount">
            <el-input
              :model-value="selectedAccount?.display_info || ''"
              readonly
              :prefix-icon="InfoFilled"
              class="readonly-input"
            />
          </el-form-item>

          <!-- 提现金额 -->
          <el-form-item :label="$t('mine.drawMoney')" prop="amount">
            <el-input
              v-model="frm.amount"
              type="number"
              :placeholder="$t('mine.inputPlz')"
              :prefix-icon="Money"
              @input="handleAmountInput"
              class="amount-input"
            >
              <template #append>
                <el-button
                  type="primary"
                  @click="allMoney"
                  class="all-money-btn"
                >
                  {{ $t('mine.allMoney') }}
                </el-button>
              </template>
            </el-input>
            <div class="amount-tips" v-if="frm.amount">
              <el-text type="info" size="small">
                {{ $t('withdraw.amount') }}: ¥{{ frm.amount }}
              </el-text>
            </div>
          </el-form-item>

          <!-- 提现密码 -->
          <el-form-item :label="$t('mine.drawingPwd')" prop="withdraw_pwd">
            <el-input
              v-model="frm.withdraw_pwd"
              type="password"
              :placeholder="$t('mine.inputPlz')"
              :prefix-icon="Lock"
              show-password
              @keyup.enter="onSubmit"
            />
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item class="submit-item">
            <el-button
              type="primary"
              size="large"
              :loading="submitting"
              @click="onSubmit"
              class="submit-btn"
              :icon="Check"
            >
              {{ submitting ? $t('withdraw.submitting') : $t('common.submit') }}
            </el-button>
            <el-button
              size="large"
              @click="resetForm"
              class="reset-btn"
            >
              {{ $t('common.reset') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 提现说明 -->
      <div class="notice-section">
        <h3 class="section-title">{{ $t('withdraw.notice') }}</h3>
        <el-alert
          :title="$t('withdraw.importantNotice')"
          type="warning"
          :closable="false"
          show-icon
          class="notice-alert"
        >
          <template #default>
            <ul class="notice-list">
              <li>{{ $t('withdraw.notice1') }}</li>
              <li>{{ $t('withdraw.notice2') }}</li>
              <li>{{ $t('withdraw.notice3') }}</li>
              <li>{{ $t('withdraw.notice4') }}</li>
            </ul>
          </template>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  ArrowLeft,
  User,
  Wallet,
  CreditCard,
  InfoFilled,
  Money,
  Lock,
  Check,
  Plus
} from '@element-plus/icons-vue'
import { moneyApi } from '@/api'
import { ref, onMounted, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'PcWithdrawApply' })

// 定义账户接口类型
interface UserAccount {
  id: number
  account_type: string
  account_name: string
  remark_name: string
  is_default: number
  display_info: string
  account_number_masked?: string
  bank_branch?: string
  wallet_address_masked?: string
  network_type?: string
  phone_number_masked?: string
}

interface AccountListResponse {
  total: number
  list: UserAccount[]
}

interface AccountOption {
  text: string
  value: number
  isDefault?: boolean
}

const { t } = useI18n()
const router = useRouter()
const store = useAppStore()

// 表单引用
const withdrawFormRef = ref<FormInstance>()

// 响应式数据
const accountList = ref<AccountOption[]>([])
const accounts = ref<UserAccount[]>([])
const selectedAccount = ref<UserAccount | null>(null)
const submitting = ref(false)

// 表单数据
const frm = reactive({
  name: store.getUser()?.name ?? '',
  account_id: '',
  amount: '',
  withdraw_pwd: '',
})

// 验证规则
const rules = reactive<FormRules>({
  account_id: [
    { required: true, message: t('withdraw.selectAccount'), trigger: 'change' }
  ],
  amount: [
    { required: true, message: t('mine.inputPlz'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const amount = parseFloat(value)
        if (isNaN(amount) || amount <= 0) {
          callback(new Error(t('withdraw.enterValidAmount')))
        } else {
          const userMoney = store.getUser()?.money ?? 0
          if (amount > userMoney) {
            callback(new Error(t('withdraw.insufficientBalance')))
          } else {
            callback()
          }
        }
      },
      trigger: 'blur'
    }
  ],
  withdraw_pwd: [
    { required: true, message: t('mine.inputPlz'), trigger: 'blur' },
    { min: 6, message: t('withdraw.passwordMinLength'), trigger: 'blur' }
  ]
})

// 方法
function handleBack() {
  router.back()
}

function goAddAccount() {
  router.push({ name: 'card' })
}

function allMoney() {
  const userMoney = store.getUser()?.money ?? 0
  frm.amount = userMoney.toString()
}

// 处理金额输入
function handleAmountInput(value: string) {
  // 限制只能输入数字和小数点
  const formatted = value.replace(/[^\d.]/g, '')
  // 限制小数点后两位
  const parts = formatted.split('.')
  if (parts.length > 1) {
    frm.amount = parts[0] + '.' + parts[1].slice(0, 2)
  } else {
    frm.amount = formatted
  }
}

// 账户选择变化处理
function changeAccountHandler(accountId: number) {
  const account = accounts.value.find(acc => acc.id === accountId)
  if (account) {
    selectedAccount.value = account
  }
}

// 重置表单
function resetForm() {
  frm.amount = ''
  frm.withdraw_pwd = ''
  withdrawFormRef.value?.clearValidate()
}

// 提交提现申请
async function onSubmit() {
  if (!withdrawFormRef.value) return

  await withdrawFormRef.value.validate(async (valid) => {
    if (!valid) return

    try {
      submitting.value = true

      // 调用提现接口
      const resp:any = await moneyApi.withdraw({
        account_id: parseInt(frm.account_id),
        amount: parseFloat(frm.amount),
        withdraw_pwd: frm.withdraw_pwd,
      })

      if (resp && resp.code === 200) {
        ElMessage.success(resp.message || t('withdraw.applySuccess'))

        // 更新用户余额
        const user = store.getUser()
        if (user && resp.data?.balance !== undefined) {
          user.money = resp.data.balance
          store.setUser(user)
        }

        // 清空表单
        resetForm()

        // 提现成功后跳转
        setTimeout(() => {
          router.push('/mine')
        }, 1500)

      } else {
        throw new Error(resp?.message || t('withdraw.applyFailed'))
      }
    } catch (error) {
      console.error('提现申请错误:', error)
      const message = (error as Error).message || t('withdraw.applyFailed')
      ElMessage.error(message)
    } finally {
      submitting.value = false
    }
  })
}

// 获取用户账户列表
async function loadAccountList() {
  try {
    const resp:any = await moneyApi.accountList()

    if (resp && resp.code === 200) {
      const data = resp.data as AccountListResponse
      accounts.value = data.list || []

      // 构建下拉选项
      accountList.value = accounts.value.map(account => ({
        text: account.remark_name,
        value: account.id,
        isDefault: account.is_default === 1
      }))

      // 自动选择默认账户
      const defaultAccount = accounts.value.find(acc => acc.is_default === 1)
      if (defaultAccount && accountList.value.length > 0) {
        frm.account_id = defaultAccount.id.toString()
        selectedAccount.value = defaultAccount
      }
    } else {
      throw new Error(resp?.message || t('withdraw.getAccountListFailed'))
    }
  } catch (error) {
    console.error('获取账户列表错误:', error)
    ElMessage.error(t('withdraw.getAccountListFailed'))
  }
}

// 检查提现条件
function checkWithdrawConditions() {
  if (accounts.value.length === 0) {
    ElMessageBox.alert(
      t('mine.bindDrawingAddress'),
      t('common.tip'),
      {
        confirmButtonText: t('common.confirm'),
        type: 'warning',
        center: true,
        showClose: false,
        callback: () => {
          router.push({ name: 'card' })
        }
      }
    )
    return false
  }
  return true
}

// 初始化
async function init() {
  try {
    store.loading()
    await loadAccountList()
    checkWithdrawConditions()
  } finally {
    store.stopLoad()
  }
}

onMounted(() => {
  init()
})
</script>

<style scoped>
.pc-withdraw-apply {
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

.form-section {
  margin-bottom: 32px;
}

.withdraw-form .el-form-item {
  margin-bottom: 24px;
}

.withdraw-form .el-form-item:last-child {
  margin-bottom: 0;
}

.readonly-input :deep(.el-input__wrapper) {
  background-color: #f5f7fa;
}

.account-row {
  display: flex;
  gap: 12px;
  width: 100%;
}

.account-select {
  flex: 1;
}

.account-option {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.account-name {
  flex: 1;
}

.add-account-btn {
  flex-shrink: 0;
}

.amount-input :deep(.el-input-group__append) {
  padding: 0;
  background-color: transparent;
  border: none;
}

.amount-input :deep(.el-input-group__append .all-money-btn) {
  border-radius: 0 4px 4px 0;
  border-left: 1px solid #dcdfe6;
}

.amount-tips {
  margin-top: 8px;
  padding-left: 4px;
}

.currency-unit {
  font-weight: 500;
  color: #606266;
  padding: 0 12px;
}

.submit-item :deep(.el-form-item__content) {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
}

.submit-btn,
.reset-btn {
  min-width: 140px;
  height: 48px;
  font-size: 16px;
}

.submit-btn {
  background: linear-gradient(135deg, #409eff 0%, #3a8ee6 100%);
  border: none;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
}

.notice-section {
  border-top: 1px solid #ebeef5;
  padding-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 3px;
  width: 3px;
  height: 14px;
  background-color: #4290ff;
  border-radius: 2px;
}

.notice-alert {
  border: 1px solid #faecd8;
  background-color: #fdf6ec;
}

.notice-list {
  margin: 12px 0 0 0;
  padding-left: 20px;
  list-style: none;
}

.notice-list li {
  position: relative;
  margin-bottom: 8px;
  line-height: 1.6;
  color: #606266;
  font-size: 14px;
}

.notice-list li:before {
  content: '•';
  position: absolute;
  left: -16px;
  color: #e6a23c;
}

.notice-list li:last-child {
  margin-bottom: 0;
}

/* Element Plus 样式覆盖 */
.pc-withdraw-apply :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.pc-withdraw-apply :deep(.el-input__wrapper) {
  border-radius: 6px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.pc-withdraw-apply :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.pc-withdraw-apply :deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1px #409eff inset;
}

@media (min-width: 1600px) {
  .pc-withdraw-apply {
    max-width: 1400px;
  }
}
</style>
