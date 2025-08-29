<template>
  <div class="m-withdraw">
    <van-nav-bar
      left-arrow
      :title="$t('mine.sunmitWithdraw')"
      @click-left="onClickLeft"
    />
    <!-- form -->
    <van-form @submit="onSubmit" class="m-frm">
      <van-field
        v-model="frm.name"
        type="text"
        readonly
        :label="$t('mine.name')"
      />
      <van-field
        :model-value="store.getUser()?.money ?? 0"
        type="text"
        readonly
        :label="$t('mine.canDrawMoney')"
      />
      <van-field readonly :label="$t('mine.shouChannel')">
        <template #input>
          <van-dropdown-menu>
            <van-dropdown-item
              v-model="frm.account_id"
              :options="accountList"
              :title="
                frm.account_id === '' ? $t('selected') : getAccountDisplayName(frm.account_id)
              "
              @change="changeAccountHandler"
            />
          </van-dropdown-menu>
        </template>
        <template #button>
          <van-button
            size="small"
            plain
            hairline
            type="primary"
            @click.stop="goAddAccount"
            >{{ $t('add') }}</van-button
          >
        </template>
      </van-field>
      <van-field
        :model-value="selectedAccount?.account_name || ''"
        type="text"
        readonly
        :label="$t('mine.cardName')"
      />
      <van-field
        :model-value="selectedAccount?.display_info || ''"
        type="text"
        readonly
        :label="$t('mine.cardAccount')"
      />
      <van-field
        v-model="frm.amount"
        type="digit"
        :placeholder="$t('mine.inputPlz')"
        :label="$t('mine.drawMoney')"
        :rules="[
          { required: true, message: $t('mine.inputPlz') },
          { validator: validateAmount, message: '请输入有效金额' }
        ]"
      >
        <template #button>
          <van-button
            size="small"
            type="primary"
            plain
            hairline
            @click="allMoney"
            >{{ $t('mine.allMoney') }}</van-button
          >
        </template>
      </van-field>

      <van-field
        v-model="frm.withdraw_pwd"
        type="password"
        :label="$t('mine.drawingPwd')"
        :placeholder="$t('mine.inputPlz')"
        :rules="[{ required: true, message: $t('mine.inputPlz') }]"
      />

      <div style="margin: 16px">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          size="large"
          class="m-btn"
          :loading="submitting"
        >
          {{ $t('submit') }}
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { showDialog, showToast, type DropdownItemOption } from 'vant'
import { moneyApi } from '@/api'
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'WithdrawVue' })

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

const { t } = useI18n()
const router = useRouter()
const store = useAppStore()

// 响应式数据
const accountList = ref<DropdownItemOption[]>([])
const accounts = ref<UserAccount[]>([])
const selectedAccount = ref<UserAccount | null>(null)
const submitting = ref(false)

// 表单数据
const frm = ref({
  name: store.getUser()?.name ?? '',
  account_id: '',
  amount: '',
  withdraw_pwd: '',
})

// 计算属性 - 移除提现密码相关

// 方法
function onClickLeft() {
  router.back()
}

function goAddAccount() {
  router.push({ name: 'card' })
}

function allMoney() {
  const userMoney = store.getUser()?.money ?? 0
  frm.value.amount = userMoney.toString()
}

// 账户选择变化处理
function changeAccountHandler(accountId: string | number) {
  const account = accounts.value.find(acc => acc.id === Number(accountId))
  if (account) {
    selectedAccount.value = account
    frm.value.account_id = accountId.toString()
  }
}

// 获取账户显示名称
function getAccountDisplayName(accountId: string | number): string {
  const account = accounts.value.find(acc => acc.id === Number(accountId))
  return account ? account.remark_name : $t('selected')
}

// 金额验证
function validateAmount(value: string): boolean {
  const amount = parseFloat(value)
  return !isNaN(amount) && amount > 0
}

// 提交提现申请
async function onSubmit() {
  try {
    // 验证表单
    if (!frm.value.account_id) {
      showToast('请选择提现账户')
      return
    }
    if (!frm.value.amount || parseFloat(frm.value.amount) <= 0) {
      showToast('请输入有效的提现金额')
      return
    }
    if (!frm.value.withdraw_pwd) {
      showToast('请输入提现密码')
      return
    }

    const userMoney = store.getUser()?.money ?? 0
    if (parseFloat(frm.value.amount) > userMoney) {
      showToast('提现金额不能超过可用余额')
      return
    }

    submitting.value = true

    // 调用提现接口
    const resp = await moneyApi.withdraw({
      account_id: parseInt(frm.value.account_id),
      amount: parseFloat(frm.value.amount),
      withdraw_pwd: frm.value.withdraw_pwd,
    })

    if (resp && resp.code === 200) {
      showToast(resp.message || '提现申请成功')

      // 更新用户余额
      const user = store.getUser()
      if (user && resp.data?.balance !== undefined) {
        user.money = resp.data.balance
        store.setUser(user)
      }

      // 清空表单
      resetForm()

      // 🔥 新增：提现成功后跳转到 mine 页面
      setTimeout(() => {
        router.push('/mine')
      }, 1500) // 延迟1.5秒让用户看到成功提示

    } else {
      throw new Error(resp?.message || '提现申请失败')
    }
  } catch (error) {
    console.error('提现申请错误:', error)
    const message = (error as Error).message || '提现申请失败，请稍后重试'
    showToast(message)
  } finally {
    submitting.value = false
  }
}

// 重置表单
function resetForm() {
  frm.value.amount = ''
  frm.value.withdraw_pwd = ''
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
      }))

      // 自动选择默认账户
      const defaultAccount = accounts.value.find(acc => acc.is_default === 1)
      if (defaultAccount && accountList.value.length > 0) {
        frm.value.account_id = defaultAccount.id.toString()
        selectedAccount.value = defaultAccount
      }
    } else {
      throw new Error(resp?.message || '获取账户列表失败')
    }
  } catch (error) {
    console.error('获取账户列表错误:', error)
    showToast('获取账户列表失败')
  }
}

// 检查提现条件
function checkWithdrawConditions() {
  // 检查是否有账户
  if (accounts.value.length === 0) {
    showDialog({
      message: t('mine.bindDrawingAddress'),
      beforeClose: () => {
        return true
      },
    })
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

<style lang="less" scoped>
.m-withdraw {
  display: flex;
  flex-direction: column;
  height: 100%;

  .m-frm {
    margin-top: 10px;
    .m-btn {
      margin-top: 30px;
    }
  }
}
</style>

<style lang="less">
@import url('@/views/mobile/common.less');
.m-withdraw {
  .van-dropdown-menu {
    min-width: 30px;

    .van-dropdown-menu__bar {
      box-shadow: none;
      height: 20px;
      .van-dropdown-menu__title {
        padding-left: 0px;
      }
    }
  }
}
</style>
