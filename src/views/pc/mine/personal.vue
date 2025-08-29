<template>
  <div class="pc-person">
    <el-page-header @back="onClickLeft" class="pc-header">
      <template #title>
        <span class="pc-header-title">{{ $t('mine.baseInfo') }}</span>
      </template>
    </el-page-header>

    <div class="pc-content">
      <!-- 基础信息 -->
      <el-card class="pc-info-card">
        <template #header>
          <div class="card-header">
            <el-icon><User /></el-icon>
            <span>{{ $t('mine.baseInfo') }}</span>
          </div>
        </template>
        <div class="pc-info-item">
          <span class="pc-info-label">{{ $t('login.username') }}</span>
          <span class="pc-info-value">{{ userInfo?.name ?? '' }}</span>
        </div>
      </el-card>

      <!-- 资金信息 -->
      <el-card class="pc-info-card">
        <template #header>
          <div class="card-header">
            <el-icon><Wallet /></el-icon>
            <span>{{ $t('user.wallet') }}</span>
          </div>
        </template>

        <div class="pc-money-item">
          <span class="pc-money-label">
            <el-icon color="#67C23A"><Money /></el-icon>
            {{ $t('user.balance') }}
          </span>
          <span class="pc-money-value primary">¥ {{ formatMoney(userInfo?.money) }}</span>
        </div>

        <!-- 条件渲染：只有当配置允许时才显示返水金额 -->
        <div class="pc-money-item" v-if="shouldShowFanshui">
          <span class="pc-money-label">
            <el-icon color="#409EFF"><Coin /></el-icon>
            {{ $t('rebateAmount') }}
          </span>
          <span class="pc-money-value rebate">¥ {{ formatMoney(userInfo?.money_rebate) }}</span>
        </div>

        <div class="pc-money-item">
          <span class="pc-money-label">
            <el-icon color="#E6A23C"><Present /></el-icon>
            {{ $t('commissionAmount') }}
          </span>
          <span class="pc-money-value commission">¥ {{ formatMoney(userInfo?.money_fanyong) }}</span>
        </div>

        <el-divider />

        <div class="pc-info-item">
          <span class="pc-info-label">{{ $t('currencyType') }}</span>
          <span class="pc-info-value">
            <el-tag type="info" size="large">{{ formatCurrency(userInfo?.currency) }}</el-tag>
          </span>
        </div>
      </el-card>

      <!-- 个人资料 -->
      <el-card class="pc-info-card">
        <template #header>
          <div class="card-header">
            <el-icon><UserFilled /></el-icon>
            <span>{{ $t('mine.persionalInfo') }}</span>
          </div>
        </template>

        <div class="pc-info-item">
          <span class="pc-info-label">
            <el-icon><UserFilled /></el-icon>
            {{ $t('register.realName') }}
          </span>
          <span class="pc-info-value">{{ userInfo?.realname ?? userInfo?.real_name ?? '--' }}</span>
        </div>

        <div class="pc-info-item pc-clickable" @click="editUserInfo('phone')">
          <span class="pc-info-label">
            <el-icon><Phone /></el-icon>
            {{ $t('register.phone') }}
          </span>
          <span class="pc-info-value">
            <span>{{ userInfo?.phone ?? '--' }}</span>
            <el-button type="primary" link>
              <el-icon><Edit /></el-icon>
              {{ $t('mine.edit') }}
            </el-button>
          </span>
        </div>

        <div class="pc-info-item pc-clickable" @click="editUserInfo('nick_name')">
          <span class="pc-info-label">
            <el-icon><Avatar /></el-icon>
            {{ $t('nickname') }}
          </span>
          <span class="pc-info-value">
            <span>{{ userInfo?.nick_name ?? userInfo?.nickname ?? '--' }}</span>
            <el-button type="primary" link>
              <el-icon><Edit /></el-icon>
              {{ $t('mine.edit') }}
            </el-button>
          </span>
        </div>
      </el-card>
    </div>

    <!-- 编辑基础信息弹窗 -->
    <el-dialog
      v-model="showEditBasic"
      :title="editField === 'nick_name' ? $t('nickname') : $t('register.phone')"
      width="500px"
      class="pc-edit-dialog"
    >
      <el-form :model="basicForm" label-width="100px">
        <el-form-item
          :label="$t('nickname')"
          v-if="editField === 'nick_name'"
          :rules="[{ required: true, message: $t('inputNickname'), trigger: 'blur' }]"
        >
          <el-input
            v-model="basicForm.nick_name"
            :placeholder="$t('inputNickname')"
            clearable
          >
            <template #prefix>
              <el-icon><Avatar /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item
          :label="$t('register.phone')"
          v-if="editField === 'phone'"
          :rules="[{ required: true, message: $t('register.inputPhone'), trigger: 'blur' }]"
        >
          <el-input
            v-model="basicForm.phone"
            :placeholder="$t('register.inputPhone')"
            clearable
          >
            <template #prefix>
              <el-icon><Phone /></el-icon>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditBasic = false">{{ $t('common.cancel') }}</el-button>
          <el-button type="primary" @click="updateBasicInfo">
            {{ $t('submit') }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useConfigStore } from '@/stores/config'
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { userApi } from '@/api/index'
import { ElMessage } from 'element-plus'
import {
  User,
  UserFilled,
  Wallet,
  Money,
  Coin,
  Present,
  Phone,
  Avatar,
  Edit
} from '@element-plus/icons-vue'

defineOptions({ name: 'PersonalVue' })

const { t } = useI18n()
const store = useAppStore()
const configStore = useConfigStore()
const router = useRouter()

// 响应式数据
const showEditBasic = ref(false)
const editField = ref('')

// 表单数据
const basicForm = ref({
  nick_name: '',
  phone: '',
})

// 计算属性：获取用户信息
const userInfo = computed(() => store.getUser())

// 计算属性：判断是否显示返水金额
const shouldShowFanshui = computed(() => {
  const fanshuiConfig = configStore.getConfigValue('default_user_fanshui', '0')
  const value = typeof fanshuiConfig === 'string' ? parseFloat(fanshuiConfig) : fanshuiConfig
  return value > 0
})

// 格式化金额显示
function formatMoney(amount: string | number | undefined): string {
  if (!amount) return '0.00'
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return num.toFixed(2)
}

// 格式化货币类型显示
function formatCurrency(currency: string | undefined): string {
  const currencyMap: Record<string, string> = {
    'CNY': t('currency.cny'),
    'USD': t('currency.usd'),
    'EUR': t('currency.eur'),
    'JPY': t('currency.jpy'),
    'KRW': t('currency.krw'),
    'THB': t('currency.thb'),
    'VND': t('currency.vnd'),
    'SGD': t('currency.sgd'),
    'MYR': t('currency.myr'),
    'PHP': t('currency.php'),
    'IDR': t('currency.idr'),
    'BTC': t('currency.btc'),
    'ETH': t('currency.eth'),
    'USDT': t('currency.usdt')
  }

  const currencyKey = currency || 'CNY'
  return currencyMap[currencyKey] || currencyKey
}

// 返回
function onClickLeft() {
  router.back()
}

// 编辑基础信息
function editUserInfo(field: string) {
  editField.value = field

  if (field === 'nick_name') {
    basicForm.value.nick_name = userInfo.value?.nick_name || userInfo.value?.nickname || ''
  } else if (field === 'phone') {
    basicForm.value.phone = userInfo.value?.phone || ''
  }

  showEditBasic.value = true
}

// 更新基础信息
async function updateBasicInfo() {
  try {
    let updateData: any = {}

    if (editField.value === 'nick_name') {
      if (!basicForm.value.nick_name.trim()) {
        ElMessage.warning(t('inputNickname'))
        return
      }
      updateData.nick_name = basicForm.value.nick_name.trim()
    } else if (editField.value === 'phone') {
      if (!basicForm.value.phone.trim()) {
        ElMessage.warning(t('register.inputPhone'))
        return
      }
      updateData.phone = basicForm.value.phone.trim()
    }

    const response = await userApi.updateUserInfo(updateData)

    if (response && response.code === 200) {
      ElMessage.success(t('mine.updateSuccess'))

      const currentUser = store.getUser()
      if (currentUser) {
        store.setUser({ ...currentUser, ...updateData })
      }

      showEditBasic.value = false
      await refreshUserInfo()
    } else {
      ElMessage.error(response?.message || t('mine.updateFailed'))
    }
  } catch (error: any) {
    console.error('更新基础信息失败:', error)
    ElMessage.error(error?.message || t('mine.updateFailed'))
  }
}

// 刷新用户信息
async function refreshUserInfo() {
  try {
    const response = await userApi.getUserInfo()

    if (response && response.code === 200 && response.data) {
      store.setUser(response.data)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// 组件挂载时获取最新用户信息
onMounted(() => {
  refreshUserInfo()
})
</script>

<style lang="less" scoped>
.pc-person {
  max-width: 1200px;
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

  .pc-content {
    display: grid;
    grid-template-columns: 1fr;
    gap: 20px;

    .pc-info-card {
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .card-header {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 18px;
        font-weight: 600;
        color: #303133;

        .el-icon {
          font-size: 20px;
          color: #409eff;
        }
      }

      .pc-info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid #ebeef5;
        transition: all 0.3s;

        &:last-child {
          border-bottom: none;
        }

        &.pc-clickable {
          cursor: pointer;

          &:hover {
            background-color: #f5f7fa;
            margin: 0 -20px;
            padding: 16px 20px;
          }
        }

        .pc-info-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: #606266;
          font-weight: 500;

          .el-icon {
            font-size: 18px;
            color: #909399;
          }
        }

        .pc-info-value {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 14px;
          color: #303133;
        }
      }

      .pc-money-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 0;
        border-bottom: 1px solid #ebeef5;

        &:last-of-type {
          border-bottom: none;
        }

        .pc-money-label {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 15px;
          color: #606266;
          font-weight: 500;

          .el-icon {
            font-size: 20px;
          }
        }

        .pc-money-value {
          font-size: 24px;
          font-weight: 700;

          &.primary {
            color: #67c23a;
          }

          &.rebate {
            color: #409eff;
          }

          &.commission {
            color: #e6a23c;
          }
        }
      }

      .el-divider {
        margin: 20px 0;
      }
    }
  }
}

.pc-edit-dialog {
  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}
</style>
