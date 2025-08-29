<template>
  <div class="m-withdraw">
    <van-nav-bar
      left-arrow
      :title="$t('mine.sunmitWithdraw')"
      @click-left="onClickLeft"
      class="nav-bar"
    />
    <!-- form -->
    <van-form @submit="onSubmit" class="m-frm">
      <van-field
        v-model="frm.name"
        type="text"
        readonly
        :label="$t('mine.name')"
      >
        <template #left-icon>
          <div class="icon-user"></div>
        </template>
      </van-field>

      <van-field
        :model-value="store.getUser()?.money ?? 0"
        type="text"
        readonly
        :label="$t('mine.canDrawMoney')"
      >
        <template #left-icon>
          <div class="icon-wallet"></div>
        </template>
      </van-field>

      <van-field readonly :label="$t('mine.shouChannel')">
        <template #left-icon>
          <div class="icon-bank"></div>
        </template>
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
          >
            <div class="icon-plus"></div>
            {{ $t('add') }}
          </van-button>
        </template>
      </van-field>

      <van-field
        :model-value="selectedAccount?.account_name || ''"
        type="text"
        readonly
        :label="$t('mine.cardName')"
      >
        <template #left-icon>
          <div class="icon-card"></div>
        </template>
      </van-field>

      <van-field
        :model-value="selectedAccount?.display_info || ''"
        type="text"
        readonly
        :label="$t('mine.cardAccount')"
      >
        <template #left-icon>
          <div class="icon-info"></div>
        </template>
      </van-field>

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
        <template #left-icon>
          <div class="icon-money"></div>
        </template>
        <template #button>
          <van-button
            size="small"
            type="primary"
            plain
            hairline
            @click="allMoney"
          >
            <div class="icon-all"></div>
            {{ $t('mine.allMoney') }}
          </van-button>
        </template>
      </van-field>

      <van-field
        v-model="frm.withdraw_pwd"
        type="password"
        :label="$t('mine.drawingPwd')"
        :placeholder="$t('mine.inputPlz')"
        :rules="[{ required: true, message: $t('mine.inputPlz') }]"
      >
        <template #left-icon>
          <div class="icon-password"></div>
        </template>
      </van-field>

      <div class="submit-container">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          size="large"
          class="m-btn"
          :loading="submitting"
        >
          <div class="icon-submit"></div>
          {{ $t('submit') }}
        </van-button>
      </div>
    </van-form>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { showToast, type DropdownItemOption } from 'vant'
import { ElMessageBox } from 'element-plus'
import { moneyApi } from '@/api'
import { ref, onMounted } from 'vue'
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
  return account ? account.remark_name : t('selected')
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

      // 提现成功后跳转到 mine 页面
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
    // 使用Element Plus的MessageBox
    ElMessageBox.alert(
      t('mine.bindDrawingAddress'),
      t('common.tip'),
      {
        confirmButtonText: t('common.confirm'),
        type: 'warning',
        center: true,
        showClose: false,
        customClass: 'withdraw-alert-box',
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

<style lang="less" scoped>
.m-withdraw {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f8fa;

  .nav-bar {
    background-color: #fff;
    border-bottom: 1px solid #ebedf0;
  }

  .m-frm {
    margin-top: 10px;
    padding: 0 16px;

    .submit-container {
      margin: 16px 0;

      .m-btn {
        margin-top: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }
    }
  }

  /* CSS图标样式 */
  .icon-user,
  .icon-wallet,
  .icon-bank,
  .icon-card,
  .icon-info,
  .icon-money,
  .icon-password,
  .icon-plus,
  .icon-all,
  .icon-submit {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-right: 8px;
  }

  .icon-user {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);

    &::before {
      content: '';
      width: 8px;
      height: 8px;
      background: #fff;
      border-radius: 50%;
      margin-bottom: 2px;
    }

    &::after {
      content: '';
      position: absolute;
      width: 12px;
      height: 8px;
      background: #fff;
      border-radius: 6px 6px 0 0;
      bottom: 3px;
    }
  }

  .icon-wallet {
    background: linear-gradient(135deg, #667eea, #764ba2);

    &::before {
      content: '';
      width: 12px;
      height: 8px;
      background: #fff;
      border-radius: 2px;
      border: 1px solid #667eea;
    }

    &::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 2px;
      background: #667eea;
      top: 9px;
    }
  }

  .icon-bank {
    background: linear-gradient(135deg, #f093fb, #f5576c);

    &::before {
      content: '';
      width: 12px;
      height: 10px;
      background: #fff;
      clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
      margin-bottom: 1px;
    }

    &::after {
      content: '';
      position: absolute;
      width: 14px;
      height: 2px;
      background: #fff;
      bottom: 3px;
    }
  }

  .icon-card {
    background: linear-gradient(135deg, #fa709a, #fee140);

    &::before {
      content: '';
      width: 12px;
      height: 8px;
      background: #fff;
      border-radius: 2px;
    }

    &::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 1px;
      background: #fa709a;
      top: 7px;
    }
  }

  .icon-info {
    background: linear-gradient(135deg, #00c9ff, #92fe9d);

    &::before {
      content: '';
      width: 2px;
      height: 8px;
      background: #fff;
      border-radius: 1px;
    }

    &::after {
      content: '';
      position: absolute;
      width: 2px;
      height: 2px;
      background: #fff;
      border-radius: 50%;
      top: 4px;
    }
  }

  .icon-money {
    background: linear-gradient(135deg, #ff6b6b, #ffa500);

    &::before {
      content: '$';
      color: #fff;
      font-size: 12px;
      font-weight: bold;
    }
  }

  .icon-password {
    background: linear-gradient(135deg, #667eea, #764ba2);

    &::before {
      content: '';
      width: 8px;
      height: 10px;
      border: 2px solid #fff;
      border-radius: 2px;
      border-top: 3px solid #fff;
      border-bottom: 3px solid #fff;
    }

    &::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      border: 2px solid #fff;
      border-radius: 50% 50% 0 0;
      border-bottom: none;
      top: 4px;
    }
  }

  .icon-plus {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);
    width: 16px;
    height: 16px;
    margin-right: 4px;

    &::before {
      content: '';
      width: 8px;
      height: 2px;
      background: #fff;
      position: absolute;
    }

    &::after {
      content: '';
      width: 2px;
      height: 8px;
      background: #fff;
      position: absolute;
    }
  }

  .icon-all {
    background: linear-gradient(135deg, #ff9800, #f57c00);
    width: 16px;
    height: 16px;
    margin-right: 4px;

    &::before {
      content: '';
      width: 10px;
      height: 8px;
      border: 2px solid #fff;
      border-radius: 2px;
      background: transparent;
    }
  }

  .icon-submit {
    background: linear-gradient(135deg, #4caf50, #45a049);
    width: 18px;
    height: 18px;
    margin-right: 6px;

    &::before {
      content: '';
      width: 6px;
      height: 10px;
      border: 2px solid #fff;
      border-left: none;
      border-top: none;
      transform: rotate(45deg);
      margin-left: -2px;
    }
  }

  /* 移动端表单样式 */
  .m-withdraw :deep(.van-field) {
    background-color: #fff;
    margin-bottom: 8px;
    border-radius: 8px;
    padding: 16px;
  }

  .m-withdraw :deep(.van-field__label) {
    font-size: 14px;
    color: #333;
    font-weight: 500;
  }

  .m-withdraw :deep(.van-field__control) {
    font-size: 16px;
    color: #333;
  }

  .m-withdraw :deep(.van-button--small) {
    height: 28px;
    padding: 0 8px;
    font-size: 12px;
  }
}

/* PC端适配样式 */
@media (min-width: 768px) {
  .m-withdraw {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .nav-bar {
      border-radius: 8px 8px 0 0;
    }

    .m-frm {
      margin-top: 0;
      padding: 24px 32px;

      .submit-container {
        margin: 32px 0;

        .m-btn {
          margin-top: 40px;
          height: 48px;
          font-size: 16px;
          gap: 10px;
        }
      }
    }

    .m-withdraw :deep(.van-field) {
      margin-bottom: 16px;
      padding: 20px 24px;
      border: 1px solid #ebedf0;
      transition: all 0.3s ease;
    }

    .m-withdraw :deep(.van-field:hover) {
      border-color: #d0d0d0;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .m-withdraw :deep(.van-field:focus-within) {
      border-color: #1989fa;
      box-shadow: 0 0 0 2px rgba(25, 137, 250, 0.2);
    }

    .m-withdraw :deep(.van-field__label) {
      font-size: 16px;
      min-width: 120px;
    }

    .m-withdraw :deep(.van-field__control) {
      font-size: 16px;
    }

    .m-withdraw :deep(.van-button--small) {
      height: 32px;
      padding: 0 12px;
      font-size: 14px;
    }

    /* PC端图标尺寸调整 */
    .icon-user,
    .icon-wallet,
    .icon-bank,
    .icon-card,
    .icon-info,
    .icon-money,
    .icon-password {
      width: 24px;
      height: 24px;
      margin-right: 12px;
    }

    .icon-plus,
    .icon-all {
      width: 18px;
      height: 18px;
      margin-right: 6px;
    }

    .icon-submit {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }
  }
}

/* 大屏PC端适配 */
@media (min-width: 1200px) {
  .m-withdraw {
    max-width: 1000px;

    .m-frm {
      padding: 32px 48px;

      .submit-container {
        margin: 40px 0;

        .m-btn {
          margin-top: 50px;
          height: 52px;
          font-size: 18px;
        }
      }
    }

    .m-withdraw :deep(.van-field) {
      margin-bottom: 20px;
      padding: 24px 32px;
    }

    .m-withdraw :deep(.van-field__label) {
      font-size: 18px;
      min-width: 140px;
    }

    .m-withdraw :deep(.van-field__control) {
      font-size: 18px;
    }

    .m-withdraw :deep(.van-button--small) {
      height: 36px;
      padding: 0 16px;
      font-size: 15px;
    }

    /* 大屏图标尺寸调整 */
    .icon-user,
    .icon-wallet,
    .icon-bank,
    .icon-card,
    .icon-info,
    .icon-money,
    .icon-password {
      width: 28px;
      height: 28px;
      margin-right: 16px;
    }

    .icon-plus,
    .icon-all {
      width: 20px;
      height: 20px;
      margin-right: 8px;
    }

    .icon-submit {
      width: 22px;
      height: 22px;
      margin-right: 10px;
    }
  }
}

/* 超大屏适配 */
@media (min-width: 1600px) {
  .m-withdraw {
    max-width: 1200px;
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

  /* PC端下拉菜单优化 */
  @media (min-width: 768px) {
    .van-dropdown-menu {
      .van-dropdown-menu__bar {
        height: 24px;
      }

      .van-dropdown-menu__title {
        font-size: 16px;
      }
    }
  }

  @media (min-width: 1200px) {
    .van-dropdown-menu {
      .van-dropdown-menu__title {
        font-size: 18px;
      }
    }
  }
}

/* Element Plus MessageBox 样式定制 */
.withdraw-alert-box {
  width: 420px;
  border-radius: 12px;
  padding: 0;

  .el-message-box__header {
    padding: 20px 20px 15px;
    border-bottom: 1px solid #ebedf0;

    .el-message-box__title {
      font-size: 18px;
      font-weight: 500;
      color: #323233;
    }
  }

  .el-message-box__content {
    padding: 25px 20px;

    .el-message-box__message {
      font-size: 16px;
      color: #646566;
      line-height: 24px;
      text-align: center;
    }

    .el-message-box__status {
      font-size: 48px;

      &.el-message-box__status--warning {
        color: #ff976a;
      }
    }
  }

  .el-message-box__btns {
    padding: 15px 20px 20px;

    .el-button--primary {
      width: 100%;
      height: 44px;
      font-size: 16px;
      border-radius: 22px;
      background: linear-gradient(135deg, #1989fa, #1570d6);
      border: none;

      &:hover {
        background: linear-gradient(135deg, #1570d6, #1460b8);
      }
    }
  }
}

/* 大屏优化 */
@media (min-width: 1200px) {
  .withdraw-alert-box {
    width: 460px;

    .el-message-box__header {
      padding: 24px 24px 16px;

      .el-message-box__title {
        font-size: 20px;
      }
    }

    .el-message-box__content {
      padding: 30px 24px;

      .el-message-box__message {
        font-size: 17px;
        line-height: 26px;
      }
    }

    .el-message-box__btns {
      padding: 16px 24px 24px;

      .el-button--primary {
        height: 48px;
        font-size: 17px;
        border-radius: 24px;
      }
    }
  }
}
</style>
