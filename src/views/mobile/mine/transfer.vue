<template>
  <div class="pc-transfer">
    <el-page-header @back="onClickLeft" class="pc-header">
      <template #title>
        <span class="pc-header-title">{{ $t('mine.transferAmount') }}</span>
      </template>
      <template #extra>
        <el-button type="primary" size="small" @click="onClickRight">
          <el-icon class="el-icon--left"><Refresh /></el-icon>
          刷新余额
        </el-button>
      </template>
    </el-page-header>

    <!-- 汇总 -->
    <el-row :gutter="20" class="pc-static">
      <el-col :span="12">
        <el-card shadow="hover" class="pc-static-card">
          <el-statistic :value="statistic?.money?.money ?? '0.00'" class="pc-statistic">
            <template #title>
              <span class="pc-stat-title">{{ $t('mine.totalBalance') }}</span>
            </template>
            <template #prefix>
              <span class="pc-stat-prefix">¥</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover" class="pc-static-card">
          <el-statistic
            :value="statistic?.money_rebate?.money ?? '0.00'"
            class="pc-statistic pc-red"
          >
            <template #title>
              <span class="pc-stat-title">{{ $t('mine.money_rebate') }}</span>
            </template>
            <template #prefix>
              <span class="pc-stat-prefix">¥</span>
            </template>
          </el-statistic>
        </el-card>
      </el-col>
    </el-row>

    <!-- 手动转账 -->
    <el-card class="pc-manual-money">
      <div class="pc-manual-header">
        <h3>转账模式</h3>
        <div class="pc-manual-actions">
          <el-button type="primary" @click="changeTransfer">
            <el-icon class="el-icon--left"><Switch /></el-icon>
            {{ btnLabel === 0 ? t('changeAuto') : t('changeManual') }}
          </el-button>
          <el-button
            type="success"
            @click="transAmount"
            :disabled="btnLabel === 1"
          >
            <el-icon class="el-icon--left"><Promotion /></el-icon>
            {{ $t('mine.transferAmount') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 钱包列表 -->
    <el-card class="pc-wallets">
      <template #header>
        <div class="card-header">
          <span>游戏钱包</span>
        </div>
      </template>
      <el-row :gutter="20">
        <el-col :span="8" v-for="(it, idx) in list" :key="idx">
          <div class="pc-wallet-item">
            <h5>{{ it.api_title }}</h5>
            <div class="pc-money">
              <span>{{ it.money ?? 'N/A' }}</span>
              <el-button
                v-if="!(it?.loading ?? false)"
                type="primary"
                link
                @click="refreshHandler(it)"
              >
                <el-icon><Refresh /></el-icon>
              </el-button>
              <el-icon v-else class="is-loading" color="#409EFF">
                <Loading />
              </el-icon>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 转账弹窗 -->
    <el-dialog
      v-model="showBottom"
      :title="$t('mine.transferAmount')"
      width="600px"
      class="pc-transfer-dialog"
    >
      <el-form class="pc-transfer-form">
        <el-form-item label="转出账户">
          <el-select
            v-model="frm.from"
            placeholder="请选择转出账户"
            size="large"
            @change="(value: string) => updateDropList('from', value)"
          >
            <el-option
              v-for="item in fromList"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <div class="pc-transfer-arrow">
          <el-icon :size="24" color="#409EFF"><Bottom /></el-icon>
        </div>

        <el-form-item label="转入账户">
          <el-select
            v-model="frm.to"
            placeholder="请选择转入账户"
            size="large"
            @change="(value: string) => updateDropList('to', value)"
          >
            <el-option
              v-for="item in toList"
              :key="item.value"
              :label="item.text"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item :label="$t('mine.money2')">
          <el-input-number
            v-model="money"
            :placeholder="$t('mine.inputTransferMoney')"
            :min="0"
            :precision="2"
            size="large"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showBottom = false">取消</el-button>
          <el-button type="primary" @click="transferMoneyHandler">
            {{ $t('confirm') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { invokeApi } from '@/utils/tools'
import type { ApiMoneiesResp, ApiWallet } from 'typings/api'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import type { DropdownItemOption } from 'typings/common'
import {
  Refresh,
  Switch,
  Promotion,
  Loading,
  Bottom
} from '@element-plus/icons-vue'

defineOptions({ name: 'transferVue' })

const { t } = useI18n()
const store = useAppStore()
const router = useRouter()
const list = ref<ApiWallet[]>([])
const statistic = ref<{ [key: string]: ApiWallet | null }>({
  money: null,
  money_rebate: null,
})
const moneyArr = ref(['money', 'money_rebate'])
const btnLabel = computed(() => {
  return store.getUser()?.is_trans_on ?? 0
})
const frm = ref({
  from: '',
  to: '',
})
const fromList = ref<DropdownItemOption[]>([])
const toList = ref<DropdownItemOption[]>([])
const showBottom = ref(false)
const money = ref(0)

function onClickLeft() {
  router.back()
}

//刷新所有游戏余额
function onClickRight() {
  getAllGameBalance()
}

async function refreshHandler(n: ApiWallet) {
  n.loading = true
  const data = await getGameBalance(n.api_name)
  if (data) {
    n.money = Number(data?.balance ?? '0.00').toFixed(2)
  }
  n.loading = false
}

function updateDropList(type: string, value: string) {
  const cw = statistic.value.money

  switch (type) {
    case 'from': //fromList changed
      if (cw?.api_name !== value) {
        //del
        const indx = fromList.value.findIndex(it => it.value === cw?.api_name)
        if (indx >= 0) {
          fromList.value.splice(indx, 1)
          //add
          const idx = toList.value.findIndex(it => it.value === cw?.api_name)
          if (idx < 0) {
            toList.value.unshift({
              text: cw?.api_title ?? '',
              value: cw?.api_name ?? '',
            })
          }
        }

        const idx = toList.value.findIndex(it => it.value == value)
        if (idx >= 0) {
          toList.value.splice(idx, 1)
        }

        frm.value.to = moneyArr.value[0]
      }
      break
    case 'to':
      if (cw?.api_name !== value) {
        const cw = statistic.value.money

        //del
        const indx = toList.value.findIndex(it => it.value === cw?.api_name)
        if (indx >= 0) {
          toList.value.splice(indx, 1)
          //add
          const idx = fromList.value.findIndex(it => it.value === cw?.api_name)
          if (idx < 0) {
            fromList.value.unshift({
              text: cw?.api_title ?? '',
              value: cw?.api_name ?? '',
            })
          }
        }

        if (cw?.api_name !== frm.value.from) {
          frm.value.from = moneyArr.value[0]
        }
      }
      break
  }
}

//显示额度转换面板
function transAmount() {
  if (btnLabel.value === 0) {
    showBottom.value = true
  }
}

//额度转换
async function transferMoneyHandler() {
  const m = Number(money.value)
  if (m <= 0) {
    ElMessage.warning(t('mine.inputTransferMoney'))
    return
  }
  if (['money', 'money_rebate'].includes(frm.value.from)) {
    if (['money', 'money_rebate'].includes(frm.value.to)) {
      ElMessage.warning(t('moneyTransferMoneyNot'))
    } else {
      const rest = await deposit(m)
      if (rest) {
        showBottom.value = false
      }
    }
  } else {
    const rest = await withdraw(m)
    if (rest) {
      showBottom.value = false
    }
  }
}

async function deposit(m: number) {
  const resp = await invokeApi('gameDeposit', {
    money: m,
    money_type: frm.value.from,
    api_code: frm.value.to,
  })
  if (resp && resp.code && resp.code !== 200) {
    ElMessage.error(resp.message ?? t('depositFailed'))
    return false
  }
  await getMoneies()
  list.value.forEach(async it => {
    if (it.api_name === frm.value.to) {
      await refreshHandler(it)
    }
  })
  return true
}

async function withdraw(m: number) {
  const resp = await invokeApi('gameWithdraw', {
    money: m,
    api_code: frm.value.from,
    money_type: frm.value.to,
  })
  if (resp && resp.code && resp.code !== 200) {
    ElMessage.error(resp.message ?? t('depositFailed'))
    return false
  }
  await getMoneies()
  list.value.forEach(async it => {
    if (it.api_name === frm.value.from) {
      await refreshHandler(it)
    }
  })
  return true
}

//获取所有游戏余额
async function getAllGameBalance() {
  const resp = await invokeApi('recoveryLast')
  if (!resp) {
    return
  }
  const data = resp.data as ApiMoneiesResp<ApiWallet>
  parseResp(data)
  ElMessage.success(t('success'))
}

// 刷新指定游戏余额
async function getGameBalance(gameCode: string) {
  const resp = await invokeApi('gameBalance', { api_code: gameCode })
  if (resp && resp.code && resp.code !== 200) {
    ElMessage.error(resp.message ?? t('refreshBalanceFailed'))
    return false
  }
  return resp?.data ?? false
}

//切换钱包模式 0手动/1自动
async function changeTransfer() {
  const status = btnLabel.value === 0 ? 1 : 0
  const resp = await invokeApi('changeTrans', {
    status: status,
  })
  if (!resp) {
    return
  }
  const user = store.getUser()
  if (user) {
    user.is_trans_on = status
    store.setUser(user)
  }
}

//余额获取
async function getMoneies() {
  const resp = await invokeApi('moneies')
  if (!resp) {
    return
  }
  const data = resp.data as ApiMoneiesResp<ApiWallet>
  parseResp(data)
}

function parseResp(data: ApiMoneiesResp<ApiWallet>) {
  if (data && data.api_moneys && (data?.api_moneys ?? []).length > 0) {
    const lst = data?.api_moneys ?? []
    const tmp: ApiWallet[] = []
    lst.forEach((it, idx) => {
      if (idx === 0) {
        if (frm.value.from === '') {
          frm.value.from = it.api_name
        }
      }
      if (!moneyArr.value.includes(it.api_name)) {
        if (frm.value.to === '') {
          frm.value.to = it.api_name
        }
        fromList.value.push({ text: it.api_title, value: it.api_name })
        toList.value.push({ text: it.api_title, value: it.api_name })
      } else {
        fromList.value.push({ text: it.api_title, value: it.api_name })
      }

      if (moneyArr.value.includes(it.api_name)) {
        statistic.value[it.api_name] = it
      } else {
        tmp.push(it)
      }
    })
    list.value = tmp
  }
}

onMounted(async () => {
  await getMoneies()
})
</script>

<style lang="less" scoped>
.pc-transfer {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: #f5f7fa;

  .pc-header {
    background: #fff;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

    .pc-header-title {
      font-size: 20px;
      font-weight: 600;
      color: #303133;
    }
  }

  .pc-static {
    margin-bottom: 20px;

    .pc-static-card {
      border-radius: 12px;
      overflow: hidden;

      .pc-statistic {
        .pc-stat-title {
          font-size: 14px;
          color: #909399;
        }

        .pc-stat-prefix {
          font-size: 20px;
          margin-right: 4px;
        }

        :deep(.el-statistic__number) {
          font-size: 28px;
          font-weight: 600;
        }
      }

      .pc-red {
        :deep(.el-statistic__number) {
          color: #f56c6c;
        }

        .pc-stat-prefix {
          color: #f56c6c;
        }
      }
    }
  }

  .pc-manual-money {
    margin-bottom: 20px;
    border-radius: 12px;

    .pc-manual-header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      h3 {
        margin: 0;
        font-size: 18px;
        color: #303133;
      }

      .pc-manual-actions {
        display: flex;
        gap: 12px;
      }
    }
  }

  .pc-wallets {
    border-radius: 12px;

    .card-header {
      font-size: 18px;
      font-weight: 600;
      color: #303133;
    }

    .pc-wallet-item {
      padding: 20px;
      background: #f7f8fa;
      border-radius: 8px;
      text-align: center;
      transition: all 0.3s;
      border: 2px solid transparent;
      margin-bottom: 20px;

      &:hover {
        background: #fff;
        border-color: #409eff;
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.15);
      }

      h5 {
        margin: 0 0 12px 0;
        font-size: 16px;
        color: #606266;
        font-weight: 500;
      }

      .pc-money {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;

        span {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }

        .is-loading {
          animation: rotate 1s linear infinite;
        }
      }
    }
  }

  .pc-transfer-dialog {
    .pc-transfer-form {
      padding: 20px;

      .pc-transfer-arrow {
        text-align: center;
        padding: 10px 0;
      }

      :deep(.el-form-item__label) {
        font-weight: 500;
      }

      :deep(.el-select),
      :deep(.el-input-number) {
        width: 100%;
      }
    }

    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
