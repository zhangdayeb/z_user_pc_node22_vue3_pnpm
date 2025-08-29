<template>
  <div class="pc-mine">
    <div class="pc-header">
      <div class="pc-user">
        <van-image :src="avatarImg" fit="contain" class="pc-ava"></van-image>
        <div class="pc-user-right">
          <h5 v-if="store.getUser() === null" @click.stop="loginHandler">
            {{ $t('mine.loginRegister') }}
          </h5>
          <div class="pc-user-info" v-else>
            <span class="pc-level-name">{{ store.getUser()?.name }}</span>
            <div class="pc-user-level">
              <div class="pc-img-bg">VIP</div>
              <span class="pc-level-txt">{{ store.getUser()?.level }}</span>
            </div>
          </div>
          <span>{{ $t('mine.welcomeTo') }} {{ siteConfig?.site_name ?? '' }}</span>
        </div>
        <div class="pc-seetings" @click="settingHandler"></div>
      </div>
      <div class="pc-info">
        <div class="pc-col pc-gap10" @click="refreshBalance" :class="{ 'pc-clickable': true }">
          <p>
            {{ $t('mine.centerWallet') }}
            <van-icon name="arrow" color="#c3dae9" class="pc-p-icon" />
          </p>
          <h6 v-if="!balanceLoading">{{ Number(store.getUser()?.money ?? '0').toFixed(2) }}</h6>
          <h6 v-else class="pc-loading-text">加载中...</h6>
        </div>
        <!-- 条件渲染：只有当配置允许时才显示返水钱包 -->
        <div class="pc-col pc-gap10" v-if="shouldShowFanshui">
          <p>
            {{ $t('mine.fsWallet') }}
            <van-icon name="arrow" color="#c3dae9" class="pc-p-icon" />
          </p>
          <h6>{{ Number(store.getUser()?.money_rebate ?? '0').toFixed(2) }}</h6>
        </div>
        <div
          class="pc-col pc-action-btn"
          @click="dwHandler(0)"
        >
          <van-image fit="contain" :src="dipositImg" class="pc-icon" />
          <p>{{ $t('mine.deposit') }}</p>
        </div>
        <div
          class="pc-col pc-action-btn"
          @click="dwHandler(1)"
        >
          <van-image fit="contain" :src="withdrawImg" class="pc-icon" />
          <p>{{ $t('mine.withdraw') }}</p>
        </div>
      </div>
    </div>

    <div class="pc-content">
      <div class="pc-func">
        <h5 class="pc-label">{{ $t('mine.normalFunc') }}</h5>
        <div class="pc-func-contain">
          <div class="pc-func-item" @click.stop="recordHandler(1)">
            <van-image
              fit="contain"
              :src="trancationImg"
              class="pc-img"
            ></van-image>
            <p>{{ $t('mine.moneyLog') }}</p>
          </div>
          <div class="pc-func-item" @click.stop="recordHandler(2)">
            <van-image
              fit="contain"
              :src="betRecordImg"
              class="pc-img"
            ></van-image>
            <p>{{ $t('mine.gameLog') }}</p>
          </div>
          <div class="pc-func-item" @click.stop="recordHandler(3)">
            <van-image fit="contain" :src="vipImg" class="pc-img"></van-image>
            <p>{{ $t('mine.levelRight') }}</p>
          </div>
          <div class="pc-func-item" @click.stop="recordHandler(4)">
            <van-image fit="contain" :src="agentImg" class="pc-img"></van-image>
            <p>{{ $t('mine.pullMoney') }}</p>
          </div>
        </div>
      </div>

      <!-- menu -->
      <div class="pc-menu-container">
        <div class="pc-menu-section">
          <van-cell-group class="pc-mine-menu">
            <van-cell
              :title="$t('mine.persionalInfo')"
              is-link
              @click.stop="menuHandler(0)"
            >
              <template #icon>
                <van-icon name="contact" class="pc-cell-icon pc-f17" />
              </template>
            </van-cell>
            <van-cell
              :title="$t('mine.accountSafe')"
              is-link
              :value="$t('mine.safest')"
              @click.stop="menuHandler(1)"
            >
              <template #icon>
                <van-icon name="shield-o" class="pc-cell-icon pc-f17" />
              </template>
            </van-cell>
            <van-cell
              :title="$t('mine.bankCard')"
              is-link
              @click.stop="menuHandler(2)"
            >
              <template #icon>
                <van-icon name="card" class="pc-cell-icon pc-f17" />
              </template>
            </van-cell>
          </van-cell-group>
        </div>

        <div class="pc-menu-section">
          <van-cell-group class="pc-mine-menu">
            <van-cell
              :title="$t('rechargeRecord')"
              is-link
              @click.stop="menuHandler(3)"
            >
              <template #icon>
                <van-icon name="records" class="pc-cell-icon pc-f17" />
              </template>
            </van-cell>
            <van-cell
              :title="$t('mine.moneyLog')"
              is-link
              @click.stop="menuHandler(4)"
            >
              <template #icon>
                <van-icon name="bill-o" class="pc-cell-icon pc-f17" />
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
                <van-icon name="balance-o" class="pc-cell-icon pc-f17" />
              </template>
            </van-cell>
            <van-cell
              :title="$t('commissionRecord')"
              is-link
              @click.stop="menuHandler(6)"
            >
              <template #icon>
                <van-icon name="gift-o" class="pc-cell-icon pc-f17" />
              </template>
            </van-cell>
            <van-cell
              :title="$t('subordinateMembers')"
              is-link
              @click.stop="menuHandler(7)"
            >
              <template #icon>
                <van-icon name="friends-o" class="pc-cell-icon pc-f17" />
              </template>
            </van-cell>
            <van-cell
              :title="$t('user.logout')"
              is-link
              @click.stop="logoutHandler"
            >
              <template #icon>
                <van-icon name="logout" class="pc-cell-icon pc-f17" />
              </template>
            </van-cell>
          </van-cell-group>
        </div>
      </div>
    </div>

    <!-- 设置弹窗 - PC端使用模态框 -->
    <van-dialog
      v-model:show="show"
      :title="$t('user.settings')"
      width="500px"
      :show-cancel-button="false"
      :show-confirm-button="false"
      class="pc-settings-dialog"
    >
      <div class="pc-pop-contain">
        <van-cell-group class="pc-mt10">
          <van-cell
            :title="$t('mine.safeSetting')"
            is-link
            to="safeSettings"
          ></van-cell>
        </van-cell-group>
        <van-cell-group class="pc-mt10">
          <van-cell :title="$t('user.conactUs')" is-link></van-cell>
          <van-cell :title="$t('mine.aboutUs')" is-link></van-cell>
        </van-cell-group>

        <van-button class="pc-mt10 pc-btn-txt" @click="logoutHandler">{{
          $t('user.logout')
        }}</van-button>
      </div>
    </van-dialog>
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
.pc-mine {
  display: flex;
  flex-direction: column;
  background: var(--color-m-background);
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  .pc-header {
    background: url('../../../assets/mobile/mine_header_bg.png') no-repeat;
    background-size: 100% 100%;
    color: #3c4045;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 20px;
    min-height: 280px;

    .pc-user {
      padding: 40px;
      position: relative;
      display: flex;
      flex-direction: row;
      align-items: center;
      height: 140px;
      gap: 20px;

      .pc-ava {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        overflow: hidden;
      }

      &-right {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;

        .pc-user-info {
          display: flex;
          flex-direction: row;
          justify-content: flex-start;
          align-items: center;
          gap: 10px;

          .pc-level-name {
            font-size: 24px;
            font-weight: 500;
          }

          .pc-user-level {
            height: 28px;
            background-image: url('../../../assets/mobile/level_bg.png');
            background-repeat: no-repeat;
            background-size: 100% 100%;
            display: flex;
            flex-direction: row;
            align-items: center;
            gap: 3px;
            padding: 0 8px;
            justify-content: flex-start;

            .pc-img-bg {
              color: #fff;
              font-size: 16px;
              font-weight: 500;
            }

            .pc-level-txt {
              color: #fff;
              font-size: 16px;
              font-weight: 500;
            }
          }
        }

        h5 {
          font-size: 24px;
          font-weight: 500;
          cursor: pointer;
          transition: opacity 0.2s ease;

          &:hover {
            opacity: 0.8;
          }
        }

        span {
          font-size: 14px;
          color: #666;
        }
      }

      .pc-seetings {
        position: absolute;
        right: 30px;
        top: 30px;
        width: 28px;
        height: 28px;
        background: url('../../../assets/mobile/setting.png') no-repeat;
        background-size: 100%;
        z-index: 2;
        cursor: pointer;
        transition: transform 0.2s ease;

        &:hover {
          transform: scale(1.1);
        }
      }
    }

    .pc-info {
      display: flex;
      flex-direction: row;
      justify-content: space-around;
      align-items: flex-end;
      flex: 1;
      padding: 0 40px 30px 40px;
      background: url('../../../assets/mobile/mine_header_bg2.png') no-repeat;
      background-size: 100% 100%;

      .pc-col {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
        min-width: 120px;

        .pc-p-icon {
          margin-left: 5px;
        }

        .pc-icon {
          width: 32px;
          height: 28px;
        }

        p {
          font-size: 14px;
          text-align: center;
        }

        h6 {
          font-size: 20px;
          font-weight: 500;
          text-align: center;
        }
      }

      .pc-gap10 {
        gap: 12px;
      }

      .pc-action-btn {
        cursor: pointer;
        transition: transform 0.2s ease;
        padding: 10px;
        border-radius: 8px;

        &:hover {
          transform: translateY(-2px);
          background-color: rgba(255, 255, 255, 0.1);
        }
      }

      .pc-clickable {
        cursor: pointer;
        transition: opacity 0.2s ease;
        padding: 10px;
        border-radius: 8px;

        &:hover {
          opacity: 0.8;
          background-color: rgba(255, 255, 255, 0.1);
        }

        &:active {
          opacity: 0.6;
        }
      }

      .pc-loading-text {
        color: #999;
        font-size: 18px !important;
      }
    }
  }

  .pc-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .pc-func {
    background-color: var(--van-nav-bar-background);
    border-radius: 12px;
    padding: 20px;

    .pc-label {
      font-size: 16px;
      font-weight: 700;
      color: var(--m-mine-label-color);
      margin-bottom: 20px;
      padding-bottom: 15px;
      border-bottom: 1px solid #e8ebf6;
    }

    &-contain {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;

      .pc-func-item {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        color: var(--m-mine-label-color);
        gap: 10px;
        padding: 20px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
        border: 1px solid transparent;

        &:hover {
          background-color: rgba(0, 0, 0, 0.02);
          border-color: #e8ebf6;
          transform: translateY(-2px);
        }

        .pc-img {
          width: 40px;
          height: 40px;
        }

        p {
          font-size: 14px;
          text-align: center;
        }
      }
    }
  }

  .pc-menu-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    .pc-menu-section {
      background-color: var(--van-nav-bar-background);
      border-radius: 12px;
      overflow: hidden;
    }
  }

  .pc-mine-menu {
    .pc-cell-icon {
      margin-top: 3.5px;
      margin-right: 12px;
      width: 18px;
      height: 18px;
    }

    .pc-f17 {
      font-size: 18px;
    }

    :deep(.van-cell) {
      padding: 16px;
      font-size: 15px;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(0, 0, 0, 0.02);
      }
    }
  }

  .pc-mt10 {
    margin-top: 15px;
  }

  .pc-pop-contain {
    display: flex;
    flex-direction: column;
    padding: 20px;

    .pc-btn-txt {
      color: #ff4f4f;
      margin-top: 20px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .pc-mine {
    padding: 10px;

    .pc-header {
      min-height: 200px;

      .pc-user {
        padding: 25px;
        height: 100px;
        gap: 15px;

        .pc-ava {
          width: 58px;
          height: 58px;
        }

        &-right {
          .pc-level-name {
            font-size: 18px;
          }

          h5 {
            font-size: 18px;
          }

          span {
            font-size: 12px;
          }
        }

        .pc-seetings {
          width: 21px;
          height: 20px;
          right: 20px;
          top: 15px;
        }
      }

      .pc-info {
        padding: 0 28px 25px 28px;

        .pc-col {
          min-width: auto;

          .pc-icon {
            width: 26px;
            height: 22px;
          }

          p {
            font-size: 12px;
          }

          h6 {
            font-size: 18px;
          }
        }
      }
    }

    .pc-func {
      padding: 15px;

      .pc-label {
        font-size: 13px;
        margin-bottom: 15px;
        padding-bottom: 10px;
      }

      &-contain {
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;

        .pc-func-item {
          padding: 15px 5px;

          .pc-img {
            width: 34px;
            height: 34px;
          }

          p {
            font-size: 12px;
          }
        }
      }
    }

    .pc-menu-container {
      grid-template-columns: 1fr;
      gap: 10px;
    }

    .pc-mine-menu {
      :deep(.van-cell) {
        padding: 12px 16px;
        font-size: 14px;
      }
    }
  }
}
</style>

<style lang="less">
.pc-mine-menu {
  .van-cell__value {
    span {
      white-space: nowrap;
    }
  }
}

.pc-settings-dialog {
  .van-dialog__content {
    padding: 0;
  }
}
</style>
