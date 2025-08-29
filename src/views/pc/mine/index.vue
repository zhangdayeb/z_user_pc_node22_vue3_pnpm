<template>
  <div class="account-center">
    <!-- 用户信息头部 -->
    <div class="account-header">
      <div class="header-content">
        <div class="user-info">
          <el-avatar :size="80" :src="avatarUrl" class="user-avatar">
            <el-icon :size="40"><User /></el-icon>
          </el-avatar>

          <div class="user-details">
            <div v-if="!isLoggedIn" class="login-prompt">
              <el-button type="primary" @click="showLogin">
                {{ $t('mine.loginRegister') }}
              </el-button>
            </div>

            <div v-else class="user-meta">
              <div class="user-name">
                <span class="name">{{ userInfo?.name }}</span>
                <el-tag type="warning" size="small" class="vip-tag">
                  VIP {{ userInfo?.level || 0 }}
                </el-tag>
              </div>
              <p class="welcome-text">
                {{ $t('mine.welcomeTo') }} {{ configStore.siteName }}
              </p>
            </div>
          </div>
        </div>

        <div class="wallet-info">
          <div class="wallet-item" @click="refreshBalance">
            <div class="wallet-label">
              {{ $t('mine.centerWallet') }}
              <el-icon v-if="!balanceLoading" class="refresh-icon">
                <Refresh />
              </el-icon>
              <el-icon v-else class="loading-icon">
                <Loading />
              </el-icon>
            </div>
            <div class="wallet-amount">
              ¥{{ formatMoney(userInfo?.money || 0) }}
            </div>
          </div>

          <div v-if="shouldShowRebate" class="wallet-item">
            <div class="wallet-label">{{ $t('mine.fsWallet') }}</div>
            <div class="wallet-amount">
              ¥{{ formatMoney(userInfo?.money_rebate || 0) }}
            </div>
          </div>

          <div class="wallet-actions">
            <el-button type="primary" @click="handleDeposit">
              <el-icon><Wallet /></el-icon>
              {{ $t('mine.deposit') }}
            </el-button>
            <el-button type="success" @click="handleWithdraw">
              <el-icon><Money /></el-icon>
              {{ $t('mine.withdraw') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能区域 -->
    <div class="account-content">
      <!-- 快捷功能 -->
      <el-card class="function-card">
        <template #header>
          <div class="card-header">
            <span>{{ $t('mine.normalFunc') }}</span>
          </div>
        </template>

        <div class="function-grid">
          <div class="function-item" @click="goToPage('moneyLog')">
            <el-icon :size="32" color="#409EFF"><Tickets /></el-icon>
            <span>{{ $t('mine.moneyLog') }}</span>
          </div>
          <div class="function-item" @click="goToPage('gameRecord')">
            <el-icon :size="32" color="#67C23A"><Trophy /></el-icon>
            <span>{{ $t('mine.gameLog') }}</span>
          </div>
          <div class="function-item" @click="goToPage('vip')">
            <el-icon :size="32" color="#E6A23C"><Medal /></el-icon>
            <span>{{ $t('mine.levelRight') }}</span>
          </div>
          <div class="function-item" @click="goToPage('extension')">
            <el-icon :size="32" color="#F56C6C"><Share /></el-icon>
            <span>{{ $t('mine.pullMoney') }}</span>
          </div>
        </div>
      </el-card>

      <!-- 账户管理 -->
      <el-card class="menu-card">
        <template #header>
          <div class="card-header">
            <span>{{ $t('mine.accountManage') }}</span>
          </div>
        </template>

        <el-menu :default-active="activeMenu" @select="handleMenuSelect">
          <el-menu-item index="personal">
            <el-icon><User /></el-icon>
            <span>{{ $t('mine.persionalInfo') }}</span>
          </el-menu-item>
          <el-menu-item index="security">
            <el-icon><Lock /></el-icon>
            <span>{{ $t('mine.accountSafe') }}</span>
          </el-menu-item>
          <el-menu-item index="cards">
            <el-icon><CreditCard /></el-icon>
            <span>{{ $t('mine.bankCard') }}</span>
          </el-menu-item>
        </el-menu>
      </el-card>

      <!-- 记录查询 -->
      <el-card class="menu-card">
        <template #header>
          <div class="card-header">
            <span>{{ $t('mine.recordQuery') }}</span>
          </div>
        </template>

        <el-menu :default-active="activeMenu" @select="handleMenuSelect">
          <el-menu-item index="depositLog">
            <el-icon><Document /></el-icon>
            <span>{{ $t('rechargeRecord') }}</span>
          </el-menu-item>
          <el-menu-item index="withdrawLog">
            <el-icon><DocumentCopy /></el-icon>
            <span>{{ $t('withdrawRecord') }}</span>
          </el-menu-item>
          <el-menu-item index="moneyLog">
            <el-icon><List /></el-icon>
            <span>{{ $t('mine.moneyLog') }}</span>
          </el-menu-item>
          <el-menu-item v-if="shouldShowRebate" index="rebateLog">
            <el-icon><PriceTag /></el-icon>
            <span>{{ $t('rebateRecord') }}</span>
          </el-menu-item>
          <el-menu-item index="commissionLog">
            <el-icon><Present /></el-icon>
            <span>{{ $t('commissionRecord') }}</span>
          </el-menu-item>
        </el-menu>
      </el-card>

      <!-- 推广代理 -->
      <el-card class="menu-card">
        <template #header>
          <div class="card-header">
            <span>{{ $t('mine.agencyPromotion') }}</span>
          </div>
        </template>

        <el-menu :default-active="activeMenu" @select="handleMenuSelect">
          <el-menu-item index="team">
            <el-icon><UserFilled /></el-icon>
            <span>{{ $t('subordinateMembers') }}</span>
          </el-menu-item>
          <el-menu-item index="extension">
            <el-icon><Share /></el-icon>
            <span>{{ $t('mine.promotionCenter') }}</span>
          </el-menu-item>
        </el-menu>
      </el-card>
    </div>

    <!-- 底部操作 -->
    <div class="account-footer">
      <el-button @click="showSettings">
        <el-icon><Setting /></el-icon>
        {{ $t('user.settings') }}
      </el-button>
      <el-button type="danger" @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        {{ $t('user.logout') }}
      </el-button>
    </div>

    <!-- 设置对话框 -->
    <el-dialog
      v-model="settingsVisible"
      :title="$t('user.settings')"
      width="500px"
    >
      <div class="settings-content">
        <el-button text @click="goToPage('safeSettings')">
          {{ $t('mine.safeSetting') }}
        </el-button>
        <el-divider />
        <el-button text @click="handleContactUs">
          {{ $t('user.conactUs') }}
        </el-button>
        <el-divider />
        <el-button text @click="handleAboutUs">
          {{ $t('mine.aboutUs') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  User,
  Lock,
  Wallet,
  Money,
  Setting,
  SwitchButton,
  Refresh,
  Loading,
  CreditCard,
  Document,
  DocumentCopy,
  List,
  PriceTag,
  Present,
  UserFilled,
  Share,
  Tickets,
  Trophy,
  Medal
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useConfigStore } from '@/stores/config'
import { userApi } from '@/api'
import api from '@/api'

defineOptions({ name: 'AccountCenter' })

const router = useRouter()
const appStore = useAppStore()
const configStore = useConfigStore()

// 响应式数据
const balanceLoading = ref(false)
const settingsVisible = ref(false)
const activeMenu = ref('')

// 计算属性
const isLoggedIn = computed(() => appStore.isLogin())
const userInfo = computed(() => appStore.getUser())
const avatarUrl = computed(() => userInfo.value?.avatar || '')
const shouldShowRebate = computed(() => {
  const value = configStore.getConfigValue('default_user_fanshui', 0)
  return Number(value) > 0
})

// 格式化金额
function formatMoney(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return isNaN(num) ? '0.00' : num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 显示登录
function showLogin() {
  appStore.loginShow = true
}

// 刷新余额
async function refreshBalance() {
  if (!isLoggedIn.value) {
    showLogin()
    return
  }

  if (balanceLoading.value) return

  try {
    balanceLoading.value = true
    const response = await userApi.getUserInfo()

    if (response?.code === 200 && response.data) {
      appStore.setUser(response.data)
      ElMessage.success('余额已更新')
    } else {
      ElMessage.error('刷新失败，请重试')
    }
  } catch (error) {
    ElMessage.error('刷新失败，请重试')
  } finally {
    balanceLoading.value = false
  }
}

// 充值
function handleDeposit() {
  if (!isLoggedIn.value) {
    showLogin()
    return
  }
  router.push('/deposit')
}

// 提现
function handleWithdraw() {
  if (!isLoggedIn.value) {
    showLogin()
    return
  }
  router.push('/withdraw')
}

// 页面跳转
function goToPage(name: string) {
  if (!isLoggedIn.value) {
    showLogin()
    return
  }

  const routeMap: Record<string, string> = {
    personal: '/personal',
    security: '/safeSettings',
    cards: '/card',
    depositLog: '/topUpLog',
    withdrawLog: '/withdrawLog',
    moneyLog: '/moneyLog',
    gameRecord: '/gameRecord',
    rebateLog: '/fanshuiRecord',
    commissionLog: '/fanyongRecord',
    team: '/dailiRecord',
    extension: '/extension',
    vip: '/vip',
    safeSettings: '/safeSettings'
  }

  router.push(routeMap[name] || '/')
}

// 菜单选择
function handleMenuSelect(index: string) {
  goToPage(index)
}

// 显示设置
function showSettings() {
  if (!isLoggedIn.value) {
    showLogin()
    return
  }
  settingsVisible.value = true
}

// 联系我们
function handleContactUs() {
  ElMessage.info('客服功能开发中')
  settingsVisible.value = false
}

// 关于我们
function handleAboutUs() {
  ElMessage.info('关于我们页面开发中')
  settingsVisible.value = false
}

// 退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      '确定要退出登录吗？',
      '退出确认',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    appStore.loading()
    const resp = await api.logout()

    if (resp?.code === 200) {
      appStore.logout()
      ElMessage.success('已退出登录')
      router.push('/')
    }
  } catch (error) {
    // 用户取消
  } finally {
    appStore.stopLoad()
  }
}

onMounted(() => {
  if (isLoggedIn.value) {
    appStore.getMeForApi()
  }
})
</script>

<style lang="less" scoped>
.account-center {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;

  .account-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 12px;
    padding: 30px;
    margin-bottom: 30px;
    color: white;

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .user-info {
        display: flex;
        align-items: center;
        gap: 20px;

        .user-avatar {
          border: 3px solid rgba(255, 255, 255, 0.3);
        }

        .user-details {
          .login-prompt {
            .el-button {
              background: rgba(255, 255, 255, 0.2);
              border-color: white;

              &:hover {
                background: rgba(255, 255, 255, 0.3);
              }
            }
          }

          .user-meta {
            .user-name {
              display: flex;
              align-items: center;
              gap: 10px;
              margin-bottom: 8px;

              .name {
                font-size: 24px;
                font-weight: bold;
              }

              .vip-tag {
                background: linear-gradient(45deg, #ffd700, #ffed4e);
                border: none;
                color: #333;
                font-weight: bold;
              }
            }

            .welcome-text {
              opacity: 0.9;
              margin: 0;
            }
          }
        }
      }

      .wallet-info {
        display: flex;
        gap: 30px;
        align-items: center;

        .wallet-item {
          cursor: pointer;
          padding: 10px;
          border-radius: 8px;
          transition: background 0.3s;

          &:hover {
            background: rgba(255, 255, 255, 0.1);
          }

          .wallet-label {
            display: flex;
            align-items: center;
            gap: 5px;
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 5px;

            .refresh-icon, .loading-icon {
              cursor: pointer;

              &:hover {
                opacity: 0.8;
              }
            }

            .loading-icon {
              animation: spin 1s linear infinite;
            }
          }

          .wallet-amount {
            font-size: 24px;
            font-weight: bold;
          }
        }

        .wallet-actions {
          display: flex;
          gap: 10px;
        }
      }
    }
  }

  .account-content {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 20px;

    .function-card {
      .function-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;

        .function-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          padding: 20px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            background: #f5f7fa;
            transform: translateY(-2px);
          }

          span {
            font-size: 14px;
            color: #606266;
          }
        }
      }
    }

    .menu-card {
      .el-menu {
        border: none;

        .el-menu-item {
          height: 48px;
          line-height: 48px;

          &:hover {
            background: #f5f7fa;
          }
        }
      }
    }
  }

  .account-footer {
    display: flex;
    justify-content: center;
    gap: 20px;
    padding: 20px;
    border-top: 1px solid #ebeef5;
  }

  .settings-content {
    padding: 20px;

    .el-button {
      width: 100%;
      justify-content: flex-start;
      padding: 15px;
      font-size: 15px;
    }
  }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.card-header {
  font-size: 16px;
  font-weight: 600;
}
</style>
