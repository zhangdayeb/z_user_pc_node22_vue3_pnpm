<template>
  <div class="m-mine">
    <div class="m-header">
      <div class="m-user">
        <van-image :src="avatarImg" fit="contain" class="m-ava"></van-image>
        <div class="m-user-right">
          <h5 v-if="store.getUser() === null" @click.stop="loginHandler">
            {{ $t('mine.loginRegister') }}
          </h5>
          <div class="m-user-info" v-else>
            <span class="m-level-name">{{ store.getUser()?.name }}</span>
            <div class="m-user-level">
              <div class="m-img-bg">VIP</div>
              <span class="m-level-txt">{{ store.getUser()?.level }}</span>
            </div>
          </div>
          <span
            >{{ $t('mine.welcomeTo') }} {{ siteConfig?.site_name ?? '' }}</span
          >
        </div>
        <div class="m-seetings" @click="settingHandler"></div>
      </div>
      <div class="m-info">
        <div class="m-col m-gap10" @click="refreshBalance" :class="{ 'm-clickable': true }">
          <p>
            {{ $t('mine.centerWallet')
            }}<van-icon name="arrow" color="#c3dae9" class="m-p-icon" />
          </p>
          <h6 v-if="!balanceLoading">{{ Number(store.getUser()?.money ?? '0').toFixed(2) }}</h6>
          <h6 v-else class="m-loading-text">加载中...</h6>
        </div>
        <!-- 条件渲染：只有当配置允许时才显示返水钱包 -->
        <div class="m-col m-gap10" v-if="shouldShowFanshui">
          <p>
            {{ $t('mine.fsWallet')
            }}<van-icon name="arrow" color="#c3dae9" class="m-p-icon" />
          </p>
          <h6>{{ Number(store.getUser()?.money_rebate ?? '0').toFixed(2) }}</h6>
        </div>
        <div
          class="m-col"
          @click="dwHandler(0)"
          style="display: flex; justify-content: center; align-items: center"
        >
          <van-image fit="contain" :src="dipositImg" class="m-icon" />
          <p>{{ $t('mine.deposit') }}</p>
        </div>
        <div
          class="m-col"
          @click="dwHandler(1)"
          style="display: flex; justify-content: center; align-items: center"
        >
          <van-image fit="contain" :src="withdrawImg" class="m-icon" />
          <p>{{ $t('mine.withdraw') }}</p>
        </div>
      </div>
    </div>
    <div class="m-func">
      <h5 class="m-label">{{ $t('mine.normalFunc') }}</h5>
      <div class="m-func-contain">
        <div class="m-func-item" @click.stop="recordHandler(1)">
          <van-image
            fit="contain"
            :src="trancationImg"
            class="m-img"
          ></van-image>
          <p>{{ $t('mine.moneyLog') }}</p>
        </div>
        <div class="m-func-item" @click.stop="recordHandler(2)">
          <van-image
            fit="contain"
            :src="betRecordImg"
            class="m-img"
          ></van-image>
          <p>{{ $t('mine.gameLog') }}</p>
        </div>
        <div class="m-func-item" @click.stop="recordHandler(3)">
          <van-image fit="contain" :src="vipImg" class="m-img"></van-image>
          <p>{{ $t('mine.levelRight') }}</p>
        </div>
        <div class="m-func-item" @click.stop="recordHandler(4)">
          <van-image fit="contain" :src="agentImg" class="m-img"></van-image>
          <p>{{ $t('mine.pullMoney') }}</p>
        </div>
      </div>
    </div>

    <!-- menu -->
    <van-cell-group class="m-mine-menu">
      <van-cell
        :title="$t('mine.persionalInfo')"
        is-link
        @click.stop="menuHandler(0)"
      >
        <template #icon>
          <van-icon name="contact" class="m-cell-icon m-f17" />
        </template>
      </van-cell>
      <van-cell
        :title="$t('mine.accountSafe')"
        is-link
        :value="$t('mine.safest')"
        @click.stop="menuHandler(1)"
      >
        <template #icon>
          <van-icon name="shield-o" class="m-cell-icon m-f17" />
        </template>
      </van-cell>
      <van-cell
        :title="$t('mine.bankCard')"
        is-link
        @click.stop="menuHandler(2)"
      >
        <template #icon>
          <van-icon name="card" class="m-cell-icon m-f17" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-cell-group class="m-mine-menu m-mt10">
      <van-cell
        :title="$t('rechargeRecord')"
        is-link
        @click.stop="menuHandler(3)"
      >
        <template #icon>
          <van-icon name="records" class="m-cell-icon m-f17" />
        </template>
      </van-cell>
      <van-cell
        :title="$t('mine.moneyLog')"
        is-link
        @click.stop="menuHandler(4)"
      >
        <template #icon>
          <van-icon name="bill-o" class="m-cell-icon m-f17" />
        </template>
      </van-cell>
      <!-- 条件渲染：只有当配置允许时才显示返水记录菜单 -->
      <van-cell
        :title="$t('rebateRecord')"
        is-link
        @click.stop="menuHandler(5)"
        v-if="shouldShowFanshui"
      >
        <template #icon>
          <van-icon name="balance-o" class="m-cell-icon m-f17" />
        </template>
      </van-cell>
      <van-cell
        :title="$t('commissionRecord')"
        is-link
        @click.stop="menuHandler(6)"
      >
        <template #icon>
          <van-icon name="gift-o" class="m-cell-icon m-f17" />
        </template>
      </van-cell>
      <van-cell
        :title="$t('subordinateMembers')"
        is-link
        @click.stop="menuHandler(7)"
      >
        <template #icon>
          <van-icon name="friends-o" class="m-cell-icon m-f17" />
        </template>
      </van-cell>
      <van-cell
        :title="$t('user.logout')"
        is-link
        @click.stop="logoutHandler"
      >
        <template #icon>
          <van-icon name="logout" class="m-cell-icon m-f17" />
        </template>
      </van-cell>
    </van-cell-group>

    <van-popup
      position="right"
      v-model:show="show"
      :style="{ width: '100%', height: '100%' }"
    >
      <van-nav-bar
        left-arrow
        :title="$t('user.settings')"
        @click-left="onClickLeft"
      />
      <div class="m-pop-contain">
        <van-cell-group class="m-mt10">
          <van-cell
            :title="$t('mine.safeSetting')"
            is-link
            to="safeSettings"
          ></van-cell>
        </van-cell-group>
        <van-cell-group class="m-mt10">
          <van-cell :title="$t('user.conactUs')" is-link></van-cell>
          <van-cell :title="$t('mine.aboutUs')" is-link></van-cell>
        </van-cell-group>

        <van-button class="m-mt10 m-btn-txt" @click="logoutHandler">{{
          $t('user.logout')
        }}</van-button>
      </div>
    </van-popup>
  </div>
</template>

<script setup lang="ts">
import avatarImg from '@/assets/mobile/avatar.png'
import dipositImg from '@/assets/mobile/mine_deposit.png'
import withdrawImg from '@/assets/mobile/mine_withdraw.png'

import trancationImg from '@/assets/mobile/transactionRecords.png'
import betRecordImg from '@/assets/mobile/betRecords.png'
import vipImg from '@/assets/mobile/vip.png'
import agentImg from '@/assets/mobile/agent.png'
import api from '@/api'
import { userApi } from '@/api'
import { useAppStore } from '@/stores/app'
import { useConfigStore } from '@/stores/config'
import { onMounted, ref, computed } from 'vue'
import { showToast } from 'vant'
import type { SiteConfig } from 'typings'
import { useRouter } from 'vue-router'

defineOptions({ name: 'MineIndex' })
const router = useRouter()
const store = useAppStore()
const configStore = useConfigStore()
const siteConfig = ref<SiteConfig | null>(null)
const show = ref(false)

// 新增：余额刷新加载状态
const balanceLoading = ref(false)

// 计算属性：判断是否显示返水相关功能
const shouldShowFanshui = computed(() => {
  const fanshuiConfig = configStore.getConfigValue('default_user_fanshui', '0')

  // 兼容字符串和数字，只要是0就不显示
  const value = typeof fanshuiConfig === 'string' ? parseFloat(fanshuiConfig) : fanshuiConfig

  return value > 0
})

// 新增：刷新余额功能
async function refreshBalance() {
  // 检查用户是否登录
  if (!store.isLogin()) {
    store.$patch({ loginShow: true })
    return
  }

  // 防止重复点击
  if (balanceLoading.value) {
    return
  }

  try {
    balanceLoading.value = true

    // 调用获取用户信息API
    const response = await userApi.getUserInfo()

    if (response && response.code === 200 && response.data) {
      // 更新用户信息到store
      store.setUser(response.data)
      showToast('余额已更新')
    } else {
      showToast('刷新失败，请重试')
    }
  } catch (error) {
    console.error('刷新余额失败:', error)
    showToast('刷新失败，请重试')
  } finally {
    balanceLoading.value = false
  }
}

async function getSiteConfig() {
  store.loading()
  store.stopLoad()
}

function loginHandler() {
  store.$patch({ loginShow: true })
  // console.log('login show', store.getUser(), store.loginShow)
}

// 设置
function settingHandler() {
  if (!store.isLogin()) {
    store.$patch({ loginShow: true })
    return
  }
  show.value = true
}

// 返回
function onClickLeft() {
  show.value = false
}
// 存/取款
function dwHandler(n: number) {
  if (!store.isLogin()) {
    store.$patch({ loginShow: true })
    return
  }
  switch (n) {
    case 0:
      router.push({ path: '/deposit' })
      break
    case 1:
      router.push({ path: '/withdraw' })
      break
  }
}

//记录
function recordHandler(n: number) {
  if (!store.isLogin()) {
    store.$patch({ loginShow: true })
    return
  }
  switch (n) {
    case 1:
      router.push({ path: '/moneyLog' })
      break
    case 2:
      router.push({ path: '/gameRecord' })
      break
    case 3:
      router.push({ path: '/vip' })
      break
    case 4:
      router.push({ path: '/extension' })
      break
  }
}

//菜单
function menuHandler(n: number) {
  if (!store.isLogin()) {
    store.$patch({ loginShow: true })
    return
  }
  switch (n) {
    case 0:
      router.push({ path: '/personal' })
      break
    case 1:
      router.push({ path: '/safeSettings' })
      break
    case 2:
      router.push({ path: '/card' })
      break
    case 3:
      router.push({ path: '/topUpLog' })
      break
    case 4:
      router.push({ path: '/withdrawLog' })
      break
    case 5:
      router.push({ path: '/fanshuiRecord' })
      break
    case 6:
      router.push({ path: '/fanyongRecord' })
      break
    case 7:
      router.push({ path: '/dailiRecord' })
      break
  }
}

// 退出
async function logoutHandler() {
  store.loading()
  try {
    const resp = await api.logout()
    console.log('logout resp:', resp)
    if (resp && resp.code === 200) {
      store.logout()
      store.stopLoad()
      showToast({
        message: resp.message,
        onClose: () => {
          window.location.href = '/'
        },
      })
    }
  } catch (err) {
    console.log('logout err', err)
    showToast((err as Error).message)
    store.stopLoad()
  }
}
onMounted(async () => {
  await getSiteConfig()
})
</script>
<style lang="less" scoped>
.m-mine {
  display: flex;
  flex-direction: column;
  // height: calc(100% - 50px);
  background: var(--color-m-background);
  padding-bottom: 60px;

  .m-header {
    height: 200px;
    background: url('../../../assets/mobile/mine_header_bg.png') no-repeat;
    background-size: 100% 100%;
    color: #3c4045;
    display: flex;
    flex-direction: column;

    .m-user {
      padding: 25px;
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 100px;
      gap: 15px;

      .m-ava {
        width: 58px;
        height: 58px;
      }
      &-right {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 5px;

        .m-user-info {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          gap: 5px;

          .m-level-name {
            font-size: 18px;
            font-weight: 400;
          }
          .m-user-level {
            // width: 31px;
            height: 20px;
            background-image: url('../../../assets/mobile/level_bg.png');
            background-repeat: no-repeat;
            background-size: 100% 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 2px;
            padding: 0 5px;
            justify-content: flex-start;

            .m-img-bg {
              color: #fff;
              font-size: 14px;
            }
            .m-level-txt {
              color: #fff;
              font-size: 14px;
            }
          }
        }
        h5 {
          font-size: 18px;
          font-weight: 400;
        }
        span {
          font-size: 12px;
        }
      }
      .m-seetings {
        position: absolute;
        right: 20px;
        top: 15px;
        width: 21px;
        height: 20px;
        background: url('../../../assets/mobile/setting.png') no-repeat;
        background-size: 100%;
        z-index: 2;
      }
    }
    .m-info {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: flex-end;
      flex: 1;
      height: 100px;
      padding: 0 28px 25px 28px;
      background: url('../../../assets/mobile/mine_header_bg2.png') no-repeat;
      background-size: 100% 100%;

      .m-col {
        display: flex;
        flex-direction: column;
        gap: 5px;

        .m-p-icon {
          margin-left: 5px;
        }
        .m-icon {
          width: 26px;
          height: 22px;
        }
        p {
          font-size: 12px;
        }
        h6 {
          font-size: 18px;
          font-weight: 400;
        }
      }
      .m-gap10 {
        gap: 10px;
      }

      // 新增：点击样式
      .m-clickable {
        cursor: pointer;
        transition: opacity 0.2s ease;

        &:hover {
          opacity: 0.8;
        }

        &:active {
          opacity: 0.6;
        }
      }

      // 新增：加载中文字样式
      .m-loading-text {
        color: #999;
        font-size: 16px !important;
      }
    }
  }

  .m-func {
    display: flex;
    flex-direction: column;
    height: 130px;
    margin-bottom: 10px;
    padding: 0 15px;
    background-color: var(--van-nav-bar-background);

    .m-label {
      height: 40px;
      line-height: 40px;
      font-size: 13px;
      font-weight: 700;
      color: var(--m-mine-label-color);
      border-bottom: 1px solid #e8ebf6;
    }
    &-contain {
      height: 90px;
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: center;

      .m-func-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        flex: 1;
        color: var(--m-mine-label-color);
        gap: 5px;

        .m-img {
          width: 34px;
          height: 34px;
        }
        p {
          font-size: 12px;
        }
      }
    }
  }

  .m-mine-menu {
    .m-cell-icon {
      margin-top: 3.5px;
      margin-right: 10px;
      width: 17px;
      height: 17px;
    }
    .m-f17 {
      font-size: 17px;
    }
  }
  .m-mt10 {
    margin-top: 10px;
  }

  .m-pop-contain {
    display: flex;
    flex-direction: column;
    background: #eef3f8;
    flex: 1;
    height: calc(100% - 46px);

    .m-btn-txt {
      color: #ff4f4f;
    }
  }
}
</style>
<style lang="less">
.m-mine-menu {
  .van-cell__value {
    span {
      white-space: nowrap;
    }
  }
}
</style>
