<template>
  <div class="m-deposit">
    <van-nav-bar
      left-arrow
      :title="$t('mine.quickDeposit')"
      @click-left="onClickLeft"
    />

    <!-- 支付方式选择 -->
    <div class="mg-top-10 m-cell">
      <div class="m-title">
        <span>1、</span>{{ $t('pay_type') }}
      </div>
      <div class="m-cell-bd">
        <div class="m-scroll">
          <div
            v-for="(method, idx) in payMethods"
            :key="method.method_code"
            class="m-cell-bd-item"
            :class="{ 'm-activie': selectedMethodIdx === idx }"
            @click.stop="selectPayMethod(idx)"
          >
            <van-image
              :src="getMethodIcon(method.method_code)"
              fit="contain"
              class="m-img"
            />
            <div class="m-label">{{ method.method_name }}</div>
            <van-image
              v-if="selectedMethodIdx === idx"
              class="m-border m-bor"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABSElEQVRYR8XXP07DMBQG8O9VvUKvwMItMjMgVe0J2JCqRIwM5QS0LGyMLHQBdW99CRbmzsxdmoccqVVa4vg58Z/Mkd8vn/1sh7IFPyHhQ7p2tuQPAJPYDgZUBUiFOAOkQPwDxEY0AgIivgFc19eZEeAbwcDjYIBPLqEX+wnRCvCFYMbDtqDnqt0Jc3ECHbpjddnKDNxvc3ptKq7HtybggFhtcprW95MSuFM5vZmKOwGs00HYgzDdzGitESXjSxX0nr3wHAzjTitOQJjEb8kYq4JUBbYUd05AiNjxATc0xG3blx/Hck5AhGD8gHAlOVc6A6xrQlLdpQtM4/U9RXslIJoOSxJeAH2mwxugK8IroAvCO8AVEQTggggGkCKCAiSI4AAbIgqgDRENYEJEBTQhogMuEUkAdUQywBHBwOj0cyq8Q3h9Td8n/gCgr8muR5XnggAAAABJRU5ErkJggg=="
              fit="contain"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 收款账户选择 -->
    <div v-if="selectedMethod && payAccounts.length > 0" class="mg-top-10 m-cell">
      <div class="m-title">
        <span>2、</span>{{ $t('pay_channel') }}
      </div>
      <div class="m-cell-bd m-account-list">
        <div
          v-for="(account, idx) in payAccounts"
          :key="account.id"
          class="m-account-item"
          :class="{ 'm-activie': selectedAccountIdx === idx }"
          @click.stop="selectPayAccount(idx)"
        >
          <div class="m-account-header">
            <van-image
              :src="getMethodIcon(selectedMethod.method_code)"
              fit="contain"
              class="m-method-icon"
            />
            <div class="m-account-info">
              <div class="m-account-name">{{ account.account_name }}</div>
              <div class="m-account-desc">{{ getAccountDesc(account) }}</div>
            </div>
            <van-image
              v-if="selectedAccountIdx === idx"
              class="m-check-icon"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAABSElEQVRYR8XXP07DMBQG8O9VvUKvwMItMjMgVe0J2JCqRIwM5QS0LGyMLHQBdW99CRbmzsxdmoccqVVa4vg58Z/Mkd8vn/1sh7IFPyHhQ7p2tuQPAJPYDgZUBUiFOAOkQPwDxEY0AgIivgFc19eZEeAbwcDjYIBPLqEX+wnRCvCFYMbDtqDnqt0Jc3ECHbpjddnKDNxvc3ptKq7HtybggFhtcprW95MSuFM5vZmKOwGs00HYgzDdzGitESXjSxX0nr3wHAzjTitOQJjEb8kYq4JUBbYUd05AiNjxATc0xG3blx/Hck5AhGD8gHAlOVc6A6xrQlLdpQtM4/U9RXslIJoOSxJeAH2mwxugK8IroAvCO8AVEQTggggGkCKCAiSI4AAbIgqgDRENYEJEBTQhogMuEUkAdUQywBHBwOj0cyq8Q3h9Td8n/gCgr8muR5XnggAAAABJRU5ErkJggg=="
              fit="contain"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 当没有选择支付方式时显示提示 -->
    <!-- 收款信息展示 -->
    <div v-if="selectedAccount" class="mg-top-10 m-cell w-100">
      <!-- 银行转账信息 -->
      <div v-if="selectedMethod.method_code === 'bank'">
        <van-cell-group inset style="margin: 0px">
          <van-field
            :model-value="selectedAccount.account_number"
            :label="$t('account')"
            readonly
            class="m-account-field"
          >
            <template #button>
              <van-button
                size="small"
                plain
                hairline
                type="primary"
                @click="copyHandler(selectedAccount.account_number)"
              >
                {{ $t('copy') }}
              </van-button>
            </template>
          </van-field>

          <van-field
            :model-value="selectedAccount.account_name"
            :label="$t('recharge_username')"
            readonly
            class="m-account-field"
          >
            <template #button>
              <van-button
                size="small"
                plain
                hairline
                type="primary"
                @click="copyHandler(selectedAccount.account_name)"
              >
                {{ $t('copy') }}
              </van-button>
            </template>
          </van-field>

          <van-field
            :model-value="selectedAccount.bank_name"
            :label="$t('open_bank')"
            readonly
            class="m-account-field"
          >
            <template #button>
              <van-button
                size="small"
                plain
                hairline
                type="primary"
                @click="copyHandler(selectedAccount.bank_name)"
              >
                {{ $t('copy') }}
              </van-button>
            </template>
          </van-field>

          <!-- 银行二维码（如果有） -->
          <div v-if="selectedAccount.qr_code_url" class="m-qrcode-container">
            <div class="m-qrcode-label">{{ $t('recharge_qrcode') }}</div>
            <div class="m-qrcode-wrapper">
              <van-image
                :src="getImgUrl(selectedAccount.qr_code_url)"
                fit="contain"
                class="m-qrcode"
                :show-loading="false"
                :show-error="false"
              />
            </div>
          </div>
        </van-cell-group>
      </div>

      <!-- 汇旺支付信息 -->
      <div v-else-if="selectedMethod.method_code === 'huiwang'">
        <van-cell-group inset style="margin: 0px">
          <!-- 二维码显示 -->
          <div v-if="selectedAccount.qr_code_url" class="m-qrcode-container">
            <div class="m-qrcode-label">{{ $t('recharge_qrcode') }}</div>
            <div class="m-qrcode-wrapper">
              <van-image
                :src="getImgUrl(selectedAccount.qr_code_url)"
                fit="contain"
                class="m-qrcode"
                :show-loading="false"
                :show-error="false"
              />
            </div>
          </div>

          <van-field
            :model-value="selectedAccount.account_number"
            :label="$t('recharge_account')"
            readonly
            class="m-account-field"
          >
            <template #button>
              <van-button
                size="small"
                plain
                hairline
                type="primary"
                @click="copyHandler(selectedAccount.account_number)"
              >
                {{ $t('copy') }}
              </van-button>
            </template>
          </van-field>

          <van-field
            :model-value="selectedAccount.account_name"
            :label="$t('recharge_username')"
            readonly
            class="m-account-field"
          >
            <template #button>
              <van-button
                size="small"
                plain
                hairline
                type="primary"
                @click="copyHandler(selectedAccount.account_name)"
              >
                {{ $t('copy') }}
              </van-button>
            </template>
          </van-field>

          <van-field
            v-if="selectedAccount.phone_number"
            :model-value="selectedAccount.phone_number"
            label="手机号码"
            readonly
            class="m-account-field"
          >
            <template #button>
              <van-button
                size="small"
                plain
                hairline
                type="primary"
                @click="copyHandler(selectedAccount.phone_number)"
              >
                {{ $t('copy') }}
              </van-button>
            </template>
          </van-field>
        </van-cell-group>
      </div>

      <!-- USDT支付信息 -->
      <div v-else-if="selectedMethod.method_code === 'usdt'">
        <van-cell-group inset style="margin: 0px">
          <!-- 二维码显示 -->
          <div v-if="selectedAccount.qr_code_url" class="m-qrcode-container">
            <div class="m-qrcode-label">{{ $t('recharge_qrcode') }}</div>
            <div class="m-qrcode-wrapper">
              <van-image
                :src="getImgUrl(selectedAccount.qr_code_url)"
                fit="contain"
                class="m-qrcode"
                :show-loading="false"
                :show-error="false"
              />
            </div>
          </div>

          <van-field
            :model-value="selectedAccount.wallet_address"
            :label="$t('rechate_address')"
            readonly
            class="m-account-field"
          >
            <template #button>
              <van-button
                size="small"
                plain
                hairline
                type="primary"
                @click="copyHandler(selectedAccount.wallet_address)"
              >
                {{ $t('copy') }}
              </van-button>
            </template>
          </van-field>

          <van-field
            :model-value="selectedAccount.network_type"
            label="网络类型"
            readonly
            class="m-account-field"
          >
            <template #button>
              <van-button
                size="small"
                plain
                hairline
                type="primary"
                @click="copyHandler(selectedAccount.network_type)"
              >
                {{ $t('copy') }}
              </van-button>
            </template>
          </van-field>
        </van-cell-group>
      </div>
    </div>

    <!-- 充值表单 -->
    <div v-if="selectedAccount" class="mg-top-10 m-cell m-3f" style="height: auto">
      <van-cell-group inset style="margin: 0px">
        <div class="m-title m-f14">
          {{ $t('transfer_amount') }}
          <span class="m-c-red">
            ({{ selectedMethod?.min_amount }}~{{ selectedMethod?.max_amount }})
          </span>
        </div>
        <van-field
          v-model="form.amount"
          type="digit"
          :placeholder="$t('input_transfer_amount')"
          class="m-input"
        />

        <div class="m-title m-f14 mg-top-10">
          {{ $t('transfer_user') }}
        </div>
        <van-field
          v-model="form.transferUser"
          :placeholder="$t('iput_transfer_amount')"
          class="m-input"
        />

        <div class="m-title m-f14 mg-top-10">
          {{ $t('upload_cert') }}
        </div>
        <van-field v-model="form.certImage" class="m-input">
          <template #input>
            <van-uploader
              v-model="fileList"
              :max-count="1"
              accept="image/*"
              :after-read="uploadHandler"
            />
          </template>
        </van-field>
      </van-cell-group>

      <van-button
        type="primary"
        round
        size="large"
        class="m-sub-btn"
        :loading="submitting"
        @click="submitHandler"
      >
        {{ $t('confirm') }}
      </van-button>
    </div>

    <!-- 温馨提示 -->
    <div class="mg-top-10 m-cell m-tips m-c-red2">
      <div class="m-c-red m-b10">{{ $t('sweetWarning') }}：</div>
      <p class="m-f12">{{ $t('deposit.detail1') }}</p>
      <p class="m-f12">{{ $t('deposit.detail2') }}</p>
      <p class="m-f12">{{ $t('deposit.detail3') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ref, onMounted, computed } from 'vue'
import { getImgUrl } from '@/utils/tools'
import api from '@/api'
import useClipboard from 'vue-clipboard3'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

// 引入图片资源
import alipayImg from '@/assets/mobile/pay_alipay.png'
import wechactImg from '@/assets/mobile/pay_wechat.png'
import bankImg from '@/assets/mobile/pay_bank.png'
import usdtImg from '@/assets/mobile/usdt.jpg'

defineOptions({ name: 'DepositVue' })

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
const { toClipboard } = useClipboard()
const { t } = useI18n()

// 响应式数据
const payMethods = ref<PayMethod[]>([])
const selectedMethodIdx = ref(-1) // 初始为-1，表示未选择
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

// 图标映射
const iconMap: { [key: string]: string } = {
  bank: bankImg,
  huiwang: wechactImg, // 汇旺使用微信图标
  usdt: usdtImg
}

// 方法
function onClickLeft() {
  router.back()
}

function getMethodIcon(methodCode: string) {
  return iconMap[methodCode] || bankImg
}

function getAccountDesc(account: PayAccount) {
  const methodCode = account.method_code || selectedMethod.value?.method_code

  switch (methodCode) {
    case 'bank':
      return `${account.bank_name || ''} ${account.account_number || ''}`.trim()
    case 'huiwang':
      return `账号: ${account.account_number || ''}`
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
  selectedAccountIdx.value = 0 // 重置账户选择
}

function selectPayAccount(idx: number) {
  selectedAccountIdx.value = idx
}

function copyHandler(text?: string) {
  if (text && text.trim().length > 0) {
    toClipboard(text)
    showToast('复制成功')
  }
}

async function uploadHandler(file: any) {
  store.loading()
  try {
    const formData = new FormData()
    formData.append('image', file.file)  // 使用 'image' 字段名

    const resp = await api.uploadImg(formData)

    if (resp && resp.code === 200 && resp.data?.image_url) {  // 使用 image_url
      form.value.certImage = resp.data.image_url
      showToast('上传成功')
    } else {
      throw new Error(resp.message || '上传失败')
    }
  } catch (err) {
    console.error('上传失败:', err)
    showToast((err as Error).message || '上传失败')
  } finally {
    store.stopLoad()
  }
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
    showToast('请选择收款账户')
    return
  }

  if (!form.value.amount || Number(form.value.amount) <= 0) {
    showToast(t('input_transfer_amount'))
    return
  }

  const amount = Number(form.value.amount)
  if (selectedMethod.value && (amount < selectedMethod.value.min_amount || amount > selectedMethod.value.max_amount)) {
    showToast(`充值金额须在 ${selectedMethod.value.min_amount}-${selectedMethod.value.max_amount} 之间`)
    return
  }

  if (!form.value.transferUser.trim()) {
    showToast(t('iput_transfer_amount'))
    return
  }

  if (!form.value.certImage) {
    showToast('请上传转账凭证')
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
      // 根据支付方式添加对应字段
      user_bank_name: getTransferBankName(),
      user_bank_card: getTransferAccount()
    }

    const resp = await api.topUp(submitData)
    console.log('充值提交响应:', resp)

    if (resp && resp.code === 200) {
      // 显示成功提示
      showToast('充值成功！请按照收款信息进行转账')

      // 重置表单
      form.value = {
        amount: '',
        transferUser: '',
        certImage: ''
      }
      fileList.value = []

      // 延迟跳转到 mine 页面，让用户看到成功提示
      setTimeout(() => {
        router.push('/mine')
      }, 1500)

    } else {
      throw new Error(resp.message || '提交失败')
    }
  } catch (err) {
    console.error('充值提交失败:', err)
    showToast((err as Error).message || '提交失败，请重试')
  } finally {
    submitting.value = false
  }
}

async function loadPayMethods() {
  try {
    const resp = await api.topUpInfo()
    console.log('充值信息响应:', resp)

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
    console.error('获取充值信息失败:', err)
    showToast((err as Error).message || '获取充值信息失败')
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
.mg-top(@n: 10px) {
  margin-top: @n;
}

.flex(@r: row, @j: flex-start, @a: center) {
  display: flex;
  flex-direction: @r;
  justify-content: @j;
  align-items: @a;
}

.m-deposit {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--color-m-background);

  .mg-top-10 {
    .mg-top();
  }

  .m-cell {
    .flex(column, flex-start, flex-start);
    background-color: var(--m-item-background);
    padding: 10px 16px;

    .m-title {
      height: 22px;
      font-size: 14px;
      color: var(--m-mine-label-color);
    }

    .m-cell-bd {
      height: 104px;
      width: 100%;
      overflow-x: auto;
      padding: 15px 10px;

      .m-scroll {
        .flex(row, flex-start, center);
        gap: 10px;

        .m-cell-bd-item {
          height: 74px;
          min-width: 66px;
          width: 66px;
          .flex(column, center, center);
          gap: 5px;
          background-color: #f9f9f9;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 0 3px;
          position: relative;

          .m-label {
            font-size: 12px;
            height: 17px;
            white-space: nowrap;
          }

          .m-border {
            width: 21px;
            height: 21px;
            position: absolute;
            top: 0px;
            right: 0px;
            display: none;
          }
        }

        .m-activie {
          border: 1px solid #4290ff;
          background-color: #fff;

          .m-bor {
            display: inherit;
          }
        }

        .m-img {
          width: 30px;
          height: 30px;
        }
      }
    }

    // 账户列表样式
    .m-account-list {
      padding: 10px 0;
      height: auto;
      min-height: 80px;

      .m-account-item {
        margin-bottom: 10px;
        padding: 12px;
        background-color: #f9f9f9;
        border: 1px solid #eee;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;

        &.m-activie {
          border-color: #4290ff;
          background-color: #fff;
          box-shadow: 0 2px 8px rgba(66, 144, 255, 0.2);
        }

        .m-account-header {
          .flex(row, flex-start, center);
          gap: 12px;
          position: relative;

          .m-method-icon {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
          }

          .m-account-info {
            flex: 1;
            min-width: 0;

            .m-account-name {
              font-size: 14px;
              font-weight: 500;
              color: #333;
              margin-bottom: 4px;
            }

            .m-account-desc {
              font-size: 12px;
              color: #666;
              word-break: break-all;
              line-height: 1.4;
            }
          }

          .m-check-icon {
            width: 20px;
            height: 20px;
            position: absolute;
            top: -2px;
            right: -2px;
            flex-shrink: 0;
          }
        }
      }
    }

    // 占位符样式
    .m-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #999;

      .m-placeholder-icon {
        width: 64px;
        height: 64px;
        margin-bottom: 12px;
        opacity: 0.6;
      }

      .m-placeholder-text {
        font-size: 14px;
        color: #999;
      }
    }

    // 二维码容器样式
    .m-qrcode-container {
      padding: 16px;
      text-align: center;
      background-color: #fff;
      margin-bottom: 10px;
      border-radius: 8px;

      .m-qrcode-label {
        font-size: 14px;
        color: #333;
        margin-bottom: 12px;
        font-weight: 500;
      }

      .m-qrcode-wrapper {
        display: inline-block;
        padding: 16px;
        background-color: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;

        .m-qrcode {
          width: 200px;
          height: 200px;
          max-width: 200px;
          max-height: 200px;
        }
      }
    }

    // 账户字段样式
    .m-account-field {
      word-break: break-all;

      :deep(.van-field__control) {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.4;
      }
    }
  }

  .w-100 > div {
    width: 100%;
  }

  .m-3f {
    .m-input {
      font-size: 16px;
    }

    .m-sub-btn {
      height: 50px;
      margin: 20px 0px;
    }
  }

  .m-tips {
    .m-f12 {
      font-size: 12px;
      line-height: 1.5;
      margin-bottom: 8px;
    }

    .m-c-red {
      color: #ff4444;
      font-weight: bold;
    }

    .m-c-red2 {
      color: #666;
    }

    .m-b10 {
      margin-bottom: 10px;
    }
  }

  .m-f14 {
    font-size: 14px;
  }

  .m-c-red {
    color: #ff4444;
  }

  ::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
  }
}
</style>
