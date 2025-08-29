<template>
  <div class="withdraw-apply-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <el-button
        @click="onClickLeft"
        :icon="ArrowLeft"
        circle
        size="small"
        class="back-btn"
      />
      <h2 class="page-title">{{ $t('mine.sunmitWithdraw') }}</h2>
    </div>

    <!-- 提现表单 -->
    <el-card class="withdraw-card" shadow="never">
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
              <span class="currency-unit">{{ $t('yuan') }}</span>
            </template>
          </el-input>
        </el-form-item>

        <!-- 收款账户 -->
        <el-form-item :label="$t('mine.shouChannel')" prop="account_id">
          <el-select
            v-model="frm.account_id"
            :placeholder="$t('selected')"
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
                  {{ $t('default') }}
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
            {{ $t('add') }}
          </el-button>
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
              {{ $t('withdrawAmount') }}: ¥{{ frm.amount }}
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
            {{ submitting ? $t('submitting') : $t('submit') }}
          </el-button>
          <el-button
            size="large"
            @click="resetForm"
            class="reset-btn"
          >
            {{ $t('reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 提现说明 -->
    <el-card class="info-card" shadow="never">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>{{ $t('withdrawNotice') }}</span>
        </div>
      </template>
      <div class="info-content">
        <el-alert
          :title="$t('importantNotice')"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul class="notice-list">
              <li>{{ $t('withdrawNotice1') }}</li>
              <li>{{ $t('withdrawNotice2') }}</li>
              <li>{{ $t('withdrawNotice3') }}</li>
              <li>{{ $t('withdrawNotice4') }}</li>
            </ul>
          </template>
        </el-alert>
      </div>
    </el-card>
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
import { ref, onMounted, reactive, computed } from 'vue'
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
    { required: true, message: t('selectWithdrawAccount'), trigger: 'change' }
  ],
  amount: [
    { required: true, message: t('mine.inputPlz'), trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const amount = parseFloat(value)
        if (isNaN(amount) || amount <= 0) {
          callback(new Error(t('enterValidAmount')))
        } else {
          const userMoney = store.getUser()?.money ?? 0
          if (amount > userMoney) {
            callback(new Error(t('insufficientBalance')))
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
    { min: 6, message: t('passwordMinLength'), trigger: 'blur' }
  ]
})

// 方法
function onClickLeft() {
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
      const resp = await moneyApi.withdraw({
        account_id: parseInt(frm.account_id),
        amount: parseFloat(frm.amount),
        withdraw_pwd: frm.withdraw_pwd,
      })

      if (resp && resp.code === 200) {
        ElMessage.success(resp.message || t('withdrawApplySuccess'))

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
        throw new Error(resp?.message || t('withdrawApplyFailed'))
      }
    } catch (error) {
      console.error('提现申请错误:', error)
      const message = (error as Error).message || t('withdrawApplyFailed')
      ElMessage.error(message)
    } finally {
      submitting.value = false
    }
  })
}

// 获取用户账户列表
async function loadAccountList() {
  try {
    const resp = await moneyApi.accountList()

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
      throw new Error(resp?.message || t('getAccountListFailed'))
    }
  } catch (error) {
    console.error('获取账户列表错误:', error)
    ElMessage.error(t('getAccountListFailed'))
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

<style scoped lang="scss">
.withdraw-apply-container {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 40px);
  max-width: 900px;
  margin: 0 auto;

  .page-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    padding: 0 20px;

    .page-title {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 0 20px;
      flex: 1;
    }

    .back-btn {
      flex-shrink: 0;
    }
  }

  .withdraw-card {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding: 30px;
    }

    .withdraw-form {
      :deep(.el-form-item) {
        margin-bottom: 24px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      .readonly-input {
        :deep(.el-input__wrapper) {
          background-color: #f5f7fa;
        }
      }

      .account-select {
        flex: 1;
        margin-right: 12px;
      }

      .account-option {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;

        .account-name {
          flex: 1;
        }
      }

      .add-account-btn {
        flex-shrink: 0;
      }

      .amount-input {
        :deep(.el-input-group__append) {
          padding: 0;
          background-color: transparent;
          border: none;

          .all-money-btn {
            border-radius: 0 4px 4px 0;
            border-left: 1px solid #dcdfe6;
          }
        }
      }

      .amount-tips {
        margin-top: 8px;
        padding-left: 4px;
      }

      .currency-unit {
        font-weight: 500;
        color: #606266;
      }

      .submit-item {
        :deep(.el-form-item__content) {
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

          &:hover:not(:disabled) {
            background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
          }
        }
      }
    }
  }

  .info-card {
    .card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 16px;
      font-weight: 500;
      color: #303133;

      .el-icon {
        font-size: 20px;
        color: #409eff;
      }
    }

    .info-content {
      .notice-list {
        margin: 12px 0 0 0;
        padding-left: 20px;
        list-style: none;

        li {
          position: relative;
          margin-bottom: 8px;
          line-height: 1.6;
          color: #606266;
          font-size: 14px;

          &:before {
            content: '•';
            position: absolute;
            left: -16px;
            color: #e6a23c;
          }

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .withdraw-apply-container {
    padding: 12px;

    .page-header {
      padding: 0 12px;
      margin-bottom: 16px;

      .page-title {
        font-size: 20px;
        margin-left: 12px;
      }
    }

    .withdraw-card {
      :deep(.el-card__body) {
        padding: 20px;
      }

      .withdraw-form {
        :deep(.el-form) {
          .el-form-item__label {
            width: 100px !important;
          }
        }

        .submit-item {
          :deep(.el-form-item__content) {
            flex-direction: column;

            .submit-btn,
            .reset-btn {
              width: 100%;
            }
          }
        }
      }
    }
  }
}

// 大屏优化
@media (min-width: 1200px) {
  .withdraw-apply-container {
    max-width: 1000px;

    .withdraw-card {
      :deep(.el-card__body) {
        padding: 40px;
      }

      .withdraw-form {
        :deep(.el-form-item) {
          margin-bottom: 28px;
        }

        :deep(.el-form-item__label) {
          font-size: 15px;
        }

        :deep(.el-input) {
          font-size: 15px;
        }

        .submit-item {
          .submit-btn,
          .reset-btn {
            min-width: 160px;
            height: 52px;
            font-size: 17px;
          }
        }
      }
    }

    .info-card {
      .card-header {
        font-size: 17px;

        .el-icon {
          font-size: 22px;
        }
      }

      .info-content {
        .notice-list {
          li {
            font-size: 15px;
            margin-bottom: 10px;
          }
        }
      }
    }
  }
}
</style>
