<template>
  <div class="pc-deposit">
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
      <h2 class="page-title">{{ $t('mine.quickDeposit') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 支付方式选择 -->
      <el-card class="pay-method-card">
        <template #header>
          <div class="card-header">
            <span class="step-number">1</span>
            <span class="step-title">{{ $t('pay_type') }}</span>
          </div>
        </template>
        <div class="pay-method-list">
          <div
            v-for="(method, idx) in payMethods"
            :key="method.method_code"
            class="pay-method-item"
            :class="{ 'active': selectedMethodIdx === idx }"
            @click="selectPayMethod(idx)"
          >
            <div class="method-icon" :class="`icon-${method.method_code}`"></div>
            <div class="method-name">{{ method.method_name }}</div>
            <div v-if="selectedMethodIdx === idx" class="check-mark">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 收款账户选择 -->
      <el-card v-if="selectedMethod && payAccounts.length > 0" class="account-card">
        <template #header>
          <div class="card-header">
            <span class="step-number">2</span>
            <span class="step-title">{{ $t('pay_channel') }}</span>
          </div>
        </template>
        <div class="account-list">
          <div
            v-for="(account, idx) in payAccounts"
            :key="account.id"
            class="account-item"
            :class="{ 'active': selectedAccountIdx === idx }"
            @click="selectPayAccount(idx)"
          >
            <div class="account-icon" :class="`icon-${selectedMethod.method_code}`"></div>
            <div class="account-info">
              <div class="account-name">{{ account.account_name }}</div>
              <div class="account-desc">{{ getAccountDesc(account) }}</div>
            </div>
            <div v-if="selectedAccountIdx === idx" class="check-mark">
              <el-icon><Check /></el-icon>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 收款信息展示 -->
      <el-card v-if="selectedAccount" class="payment-info-card">
        <template #header>
          <div class="card-header">
            <span class="step-number">3</span>
            <span class="step-title">{{ $t('recharge_account') }}</span>
          </div>
        </template>

        <!-- 银行转账信息 -->
        <div v-if="selectedMethod?.method_code === 'bank'" class="payment-details">
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('account')">
              <div class="copy-field">
                <span>{{ selectedAccount.account_number }}</span>
                <el-button type="primary" size="small" @click="copyHandler(selectedAccount.account_number)">
                  {{ $t('copy') }}
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('recharge_username')">
              <div class="copy-field">
                <span>{{ selectedAccount.account_name }}</span>
                <el-button type="primary" size="small" @click="copyHandler(selectedAccount.account_name)">
                  {{ $t('copy') }}
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('open_bank')">
              <div class="copy-field">
                <span>{{ selectedAccount.bank_name }}</span>
                <el-button type="primary" size="small" @click="copyHandler(selectedAccount.bank_name)">
                  {{ $t('copy') }}
                </el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>

          <!-- 二维码 -->
          <div v-if="selectedAccount.qr_code_url" class="qrcode-container">
            <h4>{{ $t('recharge_qrcode') }}</h4>
            <el-image
              :src="getImgUrl(selectedAccount.qr_code_url)"
              fit="contain"
              class="qrcode-image"
            />
          </div>
        </div>

        <!-- 汇旺支付信息 -->
        <div v-else-if="selectedMethod?.method_code === 'huiwang'" class="payment-details">
          <!-- 二维码 -->
          <div v-if="selectedAccount.qr_code_url" class="qrcode-container">
            <h4>{{ $t('recharge_qrcode') }}</h4>
            <el-image
              :src="getImgUrl(selectedAccount.qr_code_url)"
              fit="contain"
              class="qrcode-image"
            />
          </div>

          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('recharge_account')">
              <div class="copy-field">
                <span>{{ selectedAccount.account_number }}</span>
                <el-button type="primary" size="small" @click="copyHandler(selectedAccount.account_number)">
                  {{ $t('copy') }}
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('recharge_username')">
              <div class="copy-field">
                <span>{{ selectedAccount.account_name }}</span>
                <el-button type="primary" size="small" @click="copyHandler(selectedAccount.account_name)">
                  {{ $t('copy') }}
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item v-if="selectedAccount.phone_number" :label="$t('mine.phoneNumber')">
              <div class="copy-field">
                <span>{{ selectedAccount.phone_number }}</span>
                <el-button type="primary" size="small" @click="copyHandler(selectedAccount.phone_number)">
                  {{ $t('copy') }}
                </el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- USDT支付信息 -->
        <div v-else-if="selectedMethod?.method_code === 'usdt'" class="payment-details">
          <!-- 二维码 -->
          <div v-if="selectedAccount.qr_code_url" class="qrcode-container">
            <h4>{{ $t('recharge_qrcode') }}</h4>
            <el-image
              :src="getImgUrl(selectedAccount.qr_code_url)"
              fit="contain"
              class="qrcode-image"
            />
          </div>

          <el-descriptions :column="1" border>
            <el-descriptions-item :label="$t('rechate_address')">
              <div class="copy-field">
                <span>{{ selectedAccount.wallet_address }}</span>
                <el-button type="primary" size="small" @click="copyHandler(selectedAccount.wallet_address)">
                  {{ $t('copy') }}
                </el-button>
              </div>
            </el-descriptions-item>
            <el-descriptions-item :label="$t('mine.networkType')">
              <div class="copy-field">
                <span>{{ selectedAccount.network_type }}</span>
                <el-button type="primary" size="small" @click="copyHandler(selectedAccount.network_type)">
                  {{ $t('copy') }}
                </el-button>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>

      <!-- 充值表单 -->
      <el-card v-if="selectedAccount" class="recharge-form-card">
        <template #header>
          <div class="card-header">
            <span class="step-number">4</span>
            <span class="step-title">{{ $t('transfer_amount') }}</span>
            <span class="amount-range">
              ({{ selectedMethod?.min_amount }}~{{ selectedMethod?.max_amount }})
            </span>
          </div>
        </template>

        <el-form
          :model="form"
          label-position="top"
          class="recharge-form"
        >
          <el-form-item :label="$t('transfer_amount')" required>
            <el-input
              v-model="form.amount"
              type="number"
              :placeholder="$t('input_transfer_amount')"
              size="large"
            />
          </el-form-item>

          <el-form-item :label="$t('transfer_user')" required>
            <el-input
              v-model="form.transferUser"
              :placeholder="$t('iput_transfer_amount')"
              size="large"
            />
          </el-form-item>

          <el-form-item :label="$t('upload_cert')" required>
            <el-upload
              v-model:file-list="fileList"
              class="upload-cert"
              :limit="1"
              accept="image/*"
              :on-success="uploadSuccess"
              :on-error="uploadError"
              :before-upload="beforeUpload"
              list-type="picture-card"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
          </el-form-item>

          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            @click="submitHandler"
            class="submit-btn"
          >
            {{ $t('common.confirm') }}
          </el-button>
        </el-form>
      </el-card>

      <!-- 温馨提示 -->
      <el-alert
        type="warning"
        :closable="false"
        class="tips-alert"
      >
        <template #title>
          <strong>{{ $t('sweetWarning') }}：</strong>
        </template>
        <div class="tips-content">
          <p>{{ $t('deposit.detail1') }}</p>
          <p>{{ $t('deposit.detail2') }}</p>
          <p>{{ $t('deposit.detail3') }}</p>
        </div>
      </el-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ref, onMounted, computed } from 'vue'
import { getImgUrl } from '@/utils/tools'
import api from '@/api'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check, Plus } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'PcDepositVue' })

// 类型定义
interface PayAccount {
  id: number
  method_code?: string
  account_name: string
  account_number?: string
  bank_name?: string
  phone_number?: string
  wallet_address?: string
  network_type?: string
  qr_code_url?: string
  remark?: string
  daily_limit?: number
  balance_limit?: number
  usage_count?: number
}

interface PayMethod {
  method_code: string
  method_name: string
  method_desc: string
  icon: string
  min_amount: number
  max_amount: number
  processing_time: string
  accounts: PayAccount[]
}

const router = useRouter()
const store = useAppStore()
const { t } = useI18n()

// 响应式数据
const payMethods = ref<PayMethod[]>([])
const selectedMethodIdx = ref(-1)
const selectedAccountIdx = ref(0)
const submitting = ref(false)
const fileList = ref([])

// 表单数据
const form = ref({
  amount: '',
  transferUser: '',
  certImage: ''
})

// 计算属性
const selectedMethod = computed(() => {
  return selectedMethodIdx.value >= 0 ? payMethods.value[selectedMethodIdx.value] : null
})

const payAccounts = computed(() => {
  return selectedMethod.value?.accounts || []
})

const selectedAccount = computed(() => {
  return payAccounts.value[selectedAccountIdx.value] || null
})

// 方法
function handleBack() {
  router.back()
}

function getAccountDesc(account: PayAccount) {
  const methodCode = account.method_code || selectedMethod.value?.method_code

  switch (methodCode) {
    case 'bank':
      return `${account.bank_name || ''} ${account.account_number || ''}`.trim()
    case 'huiwang':
      return `${t('mine.accountNumber')}: ${account.account_number || ''}`
    case 'usdt':
      const address = account.wallet_address || ''
      const shortAddress = address.length > 16 ?
        `${address.slice(0, 8)}...${address.slice(-8)}` : address
      return `${account.network_type || 'USDT'} ${shortAddress}`
    default:
      return account.remark || account.account_number || ''
  }
}

function selectPayMethod(idx: number) {
  if (selectedMethodIdx.value === idx) return
  selectedMethodIdx.value = idx
  selectedAccountIdx.value = 0
}

function selectPayAccount(idx: number) {
  selectedAccountIdx.value = idx
}

async function copyHandler(text?: string) {
  if (text && text.trim().length > 0) {
    try {
      await navigator.clipboard.writeText(text)
      ElMessage.success(t('mine.copySuccess'))
    } catch {
      // 兼容处理
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      ElMessage.success(t('mine.copySuccess'))
    }
  }
}

function beforeUpload(file: any) {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }

  // 手动上传
  uploadHandler(file)
  return false
}

async function uploadHandler(file: any) {
  store.loading()
  try {
    const formData = new FormData()
    formData.append('image', file)

    const resp:any = await api.uploadImg(formData)

    if (resp && resp.code === 200 && resp.data?.image_url) {
      form.value.certImage = resp.data.image_url
      ElMessage.success('上传成功')
    } else {
      throw new Error(resp.message || '上传失败')
    }
  } catch (err) {
    ElMessage.error((err as Error).message || '上传失败')
  } finally {
    store.stopLoad()
  }
}

function uploadSuccess(response: any) {
  if (response && response.data?.image_url) {
    form.value.certImage = response.data.image_url
    ElMessage.success('上传成功')
  }
}

function uploadError() {
  ElMessage.error('上传失败')
}

function getTransferBankName() {
  const methodCode = selectedMethod.value?.method_code
  switch (methodCode) {
    case 'bank':
      return '转账银行'
    case 'huiwang':
      return '汇旺'
    case 'usdt':
      return 'USDT钱包'
    default:
      return ''
  }
}

function getTransferAccount() {
  const methodCode = selectedMethod.value?.method_code
  switch (methodCode) {
    case 'bank':
      return '转账卡号'
    case 'huiwang':
      return '汇旺账号'
    case 'usdt':
      return '转出钱包地址'
    default:
      return ''
  }
}

async function submitHandler() {
  // 表单验证
  if (!selectedAccount.value) {
    ElMessage.warning('请选择收款账户')
    return
  }

  if (!form.value.amount || Number(form.value.amount) <= 0) {
    ElMessage.warning(t('input_transfer_amount'))
    return
  }

  const amount = Number(form.value.amount)
  if (selectedMethod.value && (amount < selectedMethod.value.min_amount || amount > selectedMethod.value.max_amount)) {
    ElMessage.warning(`充值金额须在 ${selectedMethod.value.min_amount}-${selectedMethod.value.max_amount} 之间`)
    return
  }

  if (!form.value.transferUser.trim()) {
    ElMessage.warning(t('iput_transfer_amount'))
    return
  }

  if (!form.value.certImage) {
    ElMessage.warning('请上传转账凭证')
    return
  }

  submitting.value = true

  try {
    const submitData = {
      method_code: selectedMethod.value?.method_code,
      amount: form.value.amount,
      user_bank_user_name: form.value.transferUser,
      pay_account_id: selectedAccount.value.id,
      cert_image: form.value.certImage,
      user_bank_name: getTransferBankName(),
      user_bank_card: getTransferAccount()
    }

    const resp:any = await api.topUp(submitData)

    if (resp && resp.code === 200) {
      ElMessage.success(t('rechargeSubmitSuccess'))

      // 重置表单
      form.value = {
        amount: '',
        transferUser: '',
        certImage: ''
      }
      fileList.value = []

      // 延迟跳转
      setTimeout(() => {
        router.push('/mine')
      }, 1500)

    } else {
      throw new Error(resp.message || '提交失败')
    }
  } catch (err) {
    ElMessage.error((err as Error).message || '提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

async function loadPayMethods() {
  try {
    const resp:any = await api.topUpInfo()

    if (resp && resp.code === 200 && resp.data) {
      if (resp.data.pay_methods && Array.isArray(resp.data.pay_methods)) {
        payMethods.value = resp.data.pay_methods

        // 初始选择第一个支付方式
        if (payMethods.value.length > 0) {
          selectedMethodIdx.value = 0
          selectedAccountIdx.value = 0
        }
      }
    } else {
      throw new Error(resp.message || '获取充值信息失败')
    }
  } catch (err) {
    ElMessage.error((err as Error).message || '获取充值信息失败')
  }
}

async function init() {
  store.loading()
  try {
    await loadPayMethods()
  } finally {
    store.stopLoad()
  }
}

onMounted(() => {
  init()
})
</script>

<style lang="less" scoped>
.pc-deposit {
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
  .el-card {
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 16px;
    font-weight: 600;

    .step-number {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      background: #409eff;
      color: #fff;
      border-radius: 50%;
      font-size: 14px;
    }

    .amount-range {
      margin-left: auto;
      color: #f56c6c;
      font-size: 14px;
      font-weight: normal;
    }
  }

  // 支付方式样式
  .pay-method-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;

    .pay-method-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 20px;
      border: 2px solid #e4e7ed;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;

      &:hover {
        border-color: #409eff;
        background: #f0f9ff;
      }

      &.active {
        border-color: #409eff;
        background: #f0f9ff;
      }

      .method-icon {
        width: 50px;
        height: 50px;
        margin-bottom: 10px;
        border-radius: 8px;

        &.icon-bank {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;

          &::before {
            content: '';
            position: absolute;
            width: 30px;
            height: 20px;
            background: #fff;
            border-radius: 4px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        &.icon-huiwang {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          position: relative;

          &::before {
            content: 'W';
            position: absolute;
            color: #fff;
            font-size: 24px;
            font-weight: bold;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        &.icon-usdt {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          position: relative;

          &::before {
            content: '₮';
            position: absolute;
            color: #fff;
            font-size: 24px;
            font-weight: bold;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }
      }

      .method-name {
        font-size: 14px;
        color: #303133;
        font-weight: 500;
      }

      .check-mark {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 24px;
        height: 24px;
        background: #67c23a;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }
    }
  }

  // 账户列表样式
  .account-list {
    display: flex;
    flex-direction: column;
    gap: 12px;

    .account-item {
      display: flex;
      align-items: center;
      padding: 16px;
      border: 2px solid #e4e7ed;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
      position: relative;

      &:hover {
        border-color: #409eff;
        background: #f0f9ff;
      }

      &.active {
        border-color: #409eff;
        background: #f0f9ff;
      }

      .account-icon {
        width: 50px;
        height: 50px;
        margin-right: 16px;
        border-radius: 8px;
        flex-shrink: 0;

        &.icon-bank {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;

          &::before {
            content: '';
            position: absolute;
            width: 30px;
            height: 20px;
            background: #fff;
            border-radius: 4px;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        &.icon-huiwang {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          position: relative;

          &::before {
            content: 'W';
            position: absolute;
            color: #fff;
            font-size: 24px;
            font-weight: bold;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }

        &.icon-usdt {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          position: relative;

          &::before {
            content: '₮';
            position: absolute;
            color: #fff;
            font-size: 24px;
            font-weight: bold;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
          }
        }
      }

      .account-info {
        flex: 1;

        .account-name {
          font-size: 16px;
          font-weight: 500;
          color: #303133;
          margin-bottom: 4px;
        }

        .account-desc {
          font-size: 14px;
          color: #909399;
        }
      }

      .check-mark {
        width: 24px;
        height: 24px;
        background: #67c23a;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
      }
    }
  }

  // 支付详情样式
  .payment-details {
    .copy-field {
      display: flex;
      align-items: center;
      justify-content: space-between;

      span {
        font-family: monospace;
        font-size: 14px;
      }
    }

    .qrcode-container {
      text-align: center;
      padding: 20px;
      margin-bottom: 20px;

      h4 {
        margin-bottom: 16px;
        color: #303133;
      }

      .qrcode-image {
        width: 200px;
        height: 200px;
        border: 1px solid #e4e7ed;
        padding: 10px;
        background: #fff;
        border-radius: 8px;
      }
    }
  }

  // 充值表单样式
  .recharge-form {
    max-width: 600px;
    margin: 0 auto;

    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 16px;
      margin-top: 20px;
    }

    :deep(.el-upload-list__item) {
      width: 148px;
      height: 148px;
    }
  }

  // 提示信息样式
  .tips-alert {
    .tips-content {
      margin-top: 10px;

      p {
        margin: 8px 0;
        line-height: 1.6;
        color: #e6a23c;
      }
    }
  }
}

@media (min-width: 1600px) {
  .pc-deposit {
    max-width: 1400px;
  }
}
</style>
