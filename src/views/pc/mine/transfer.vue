<template>
  <div class="m-transfer">
    <van-nav-bar
      left-arrow
      :title="$t('mine.transferAmount')"
      @click-left="onClickLeft"
      @click-right="onClickRight"
      class="m-nav"
    >
      <template #right>
        <van-icon name="replay" size="18" />
      </template>
    </van-nav-bar>

    <!-- 汇总 -->
    <div class="m-static">
      <div class="m-col m-static-item">
        <span>{{ statistic?.money?.money ?? '0.00' }}</span>
        <h5>{{ $t('mine.totalBalance') }}</h5>
      </div>
      <div class="m-col m-static-item">
        <span class="m-c-red">{{ statistic?.money_rebate?.money ?? '0.00' }}</span>
        <h5>{{ $t('mine.money_rebate') }}</h5>
      </div>
    </div>

    <!-- 手动转账 -->
    <div class="m-manual-money">
      <van-button type="primary" size="small" round @click="changeTransfer">{{
        btnLabel === 0 ? t('changeAuto') : t('changeManual')
      }}</van-button>
      <van-button
        type="default"
        size="small"
        round
        @click="transAmount"
        :disabled="btnLabel === 1"
        >{{ $t('mine.transferAmount') }}</van-button
      >
    </div>
    <!-- 钱包列表 -->
    <div class="m-wallets">
      <van-grid :column-num="3" :border="false">
        <van-grid-item v-for="(it, idx) in list" :key="idx">
          <template #default>
            <div class="m-g-item">
              <h5>{{ it.api_title }}</h5>
              <div class="m-money">
                <span>{{ it.money ?? 'N/A' }}</span>
                <van-icon
                  name="replay"
                  size="12"
                  color="#59bafc"
                  style="font-weight: 700"
                  v-show="(it?.loading ?? false) === false"
                  @click="refreshHandler(it)"
                />
                <van-loading
                  size="12"
                  color="#59bafc"
                  v-show="(it?.loading ?? false) === true"
                />
              </div>
            </div>
          </template>
        </van-grid-item>
      </van-grid>
    </div>
    <van-popup
      v-model:show="showBottom"
      position="bottom"
      closeable
      :close-on-click-overlay="false"
      :style="{ height: '40%' }"
      class="m-pop-transfer"
    >
      <van-nav-bar :title="$t('mine.transferAmount')"></van-nav-bar>
      <van-dropdown-menu class="m-menu">
        <van-dropdown-item
          v-model="frm.from"
          :options="fromList"
          @change="(value: string) => updateDropList('from', value)"
        />
        <van-dropdown-item
          v-model="frm.to"
          :options="toList"
          @change="(value: string) => updateDropList('to', value)"
        />
        <van-icon name="down" size="14" class="m-icon" />
      </van-dropdown-menu>
      <van-cell-group class="m-input">
        <van-field
          v-model="money"
          :label="$t('mine.money2')"
          :placeholder="$t('mine.inputTransferMoney')"
        />
      </van-cell-group>
      <div class="m-btn">
        <van-button round block type="primary" @click="transferMoneyHandler">
          {{ $t('confirm') }}
        </van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, computed } from 'vue'
import { invokeApi } from '@/utils/tools'
import type { ApiMoneiesResp, ApiWallet } from 'typings/api'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { showToast, type DropdownItemOption } from 'vant'

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
const money = ref('')

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
  console.log(
    'type=',
    type,
    'value=',
    value,
    'from=',
    frm.value.from,
    'to=',
    frm.value.to,
    'cw=',
    cw,
    'toList=',
    toList.value,
    'fromList=',
    fromList.value,
  )
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
      break // toList changed
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
    showToast(t('mine.inputTransferMoney'))
    return
  }
  if (['money', 'money_rebate'].includes(frm.value.from)) {
    if (['money', 'money_rebate'].includes(frm.value.to)) {
      showToast(t('moneyTransferMoneyNot'))
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
    showToast(resp.message ?? t('depositFailed'))
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
    showToast(resp.message ?? t('depositFailed'))
    return false
  }
  await getMoneies()
  //
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
  showToast(t('success'))
}
// 刷新指定游戏余额
async function getGameBalance(gameCode: string) {
  const resp = await invokeApi('gameBalance', { api_code: gameCode })
  if (resp && resp.code && resp.code !== 200) {
    showToast(resp.message ?? t('refreshBalanceFailed'))
    return false
  }
  return resp?.data ?? false
}

//切换钱包模式 0手动/1自动 取决于me接口返回【is_trans_on】字段
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
      console.log('idx=', idx, 'it=', it)
      if (idx === 0) {
        if (frm.value.from === '') {
          //给from赋值
          frm.value.from = it.api_name
        }
      }
      if (!moneyArr.value.includes(it.api_name)) {
        if (frm.value.to === '') {
          //给to赋值
          frm.value.to = it.api_name
          // toList.value.push({ text: it.api_title, value: it.api_name })
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
    console.log('fromList=', fromList.value, 'toList=', toList.value)
    list.value = tmp
  }
}

onMounted(async () => {
  await getMoneies()
})
</script>

<style lang="less" scoped>
.m-flex {
  flex: 1;
}
.m-align-cen {
  align-items: center;
}
.m-col {
  display: flex;
  flex-direction: column;
}
.m-row {
  display: flex;
  flex-direction: row;
}
.m-transfer {
  display: flex;
  flex-direction: column;
  // min-height: 100%;

  .m-static {
    margin-top: 10px;
    padding: 10px 16px;
    background-color: var(--van-grid-item-content-background);
    .m-row;
    justify-content: space-around;
    align-items: center;

    &-item {
      .m-flex;
      .m-align-cen;
      gap: 5px;

      h5 {
        font-size: 14px;
        color: #999;
        font-weight: 400;
      }
      span {
        font-size: 14px;
      }
    }
  }

  .m-manual-money {
    margin-top: 10px;
    padding: 10px 16px;
    display: flex;
    flex-direction: row;
    background-color: var(--van-grid-item-content-background);
    justify-content: space-around;
    align-items: center;
  }

  .m-wallets {
    margin-top: 10px;
    margin-bottom: 10px;
    background-color: var(--van-grid-item-content-background);
    .m-g-item {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      gap: 3px;

      h5 {
        color: #666;
        font-size: 13px;
      }
      .m-money {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 5px;
      }

      span {
        color: #aaa;
        font-size: 11px;
      }
    }
  }
  .m-pop-transfer {
    background-color: #eef3f8;
    .m-menu {
      margin: 0px 16px 0px 16px;
      position: relative;
      .m-icon {
        position: absolute;
        top: 28%;
        left: 48%;
        z-index: 20;
        transform: rotate(-90deg);
      }
    }

    .m-input {
      margin: 0px 16px;
    }
    .m-btn {
      margin: 0px 16px 16px 16px;
      padding: 16px;
      background-color: #fff;
    }
  }
}
</style>
<style lang="less">
@import url('@/views/mobile/common.less');
.m-pop-transfer {
  .van-dropdown-menu__bar {
    height: 44px;
  }
  .van-ellipsis {
    font-size: 14px;
  }
  .van-cell--clickable {
    align-items: center;
  }
}
</style>
