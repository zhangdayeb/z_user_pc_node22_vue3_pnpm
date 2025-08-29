<template>
  <div class="withdraw-password-container">
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <el-button
            :icon="ArrowLeft"
            @click="handleBack"
            text
          >
            {{ $t('common.back') }}
          </el-button>
          <h2>{{ pageTitle }}</h2>
        </div>
      </template>

      <!-- 安全提示 -->
      <el-alert
        v-if="!isModify"
        :title="$t('mine.withdrawPasswordImportant')"
        type="warning"
        :closable="false"
        show-icon
        class="security-alert"
      >
        <template #default>
          <ul class="security-tips">
            <li>{{ $t('mine.withdrawPwdTip1') }}</li>
            <li>{{ $t('mine.withdrawPwdTip2') }}</li>
            <li>{{ $t('mine.withdrawPwdTip3') }}</li>
          </ul>
        </template>
      </el-alert>

      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="formRules"
        label-width="140px"
        class="password-form"
        @submit.prevent="handleSubmit"
      >
        <!-- 当前密码（仅修改时显示） -->
        <el-form-item
          v-if="isModify"
          :label="$t('mine.currWithdrawPwd')"
          prop="oldPassword"
        >
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            :placeholder="$t('mine.inputCurrWithdrawPwd')"
            show-password
            clearable
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 新密码 -->
        <el-form-item
          :label="isModify ? $t('mine.newWithdrawPwd') : $t('mine.setWithdrawPwd')"
          prop="newPassword"
        >
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            :placeholder="isModify ? $t('mine.inputNewWithdrawPwd') : $t('mine.inputWithdrawPwd')"
            show-password
            clearable
            @input="validatePasswordStrength"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>

          <!-- 密码强度提示 -->
          <div v-if="passwordForm.newPassword" class="password-info">
            <el-progress
              :percentage="passwordStrength.percent"
              :color="passwordStrength.color"
              :show-text="false"
            />
            <span class="strength-text" :style="{ color: passwordStrength.color }">
              {{ passwordStrength.text }}
            </span>
          </div>
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item
          :label="$t('mine.confirmWithdrawPwd')"
          prop="confirmPassword"
        >
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            :placeholder="$t('mine.inputWithdrawPwdAgain')"
            show-password
            clearable
            @paste.prevent
          >
            <template #prefix>
              <el-icon><CircleCheck /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密码格式要求 -->
        <el-form-item>
          <div class="password-requirements">
            <h4>{{ $t('mine.passwordFormat') }}:</h4>
            <div class="requirement-list">
              <div class="requirement-item" :class="{ valid: requirements.length }">
                <el-icon>
                  <SuccessFilled v-if="requirements.length" />
                  <CircleClose v-else />
                </el-icon>
                <span>{{ $t('mine.withdrawPwdLength') }}</span>
              </div>
              <div class="requirement-item" :class="{ valid: requirements.onlyNumbers }">
                <el-icon>
                  <SuccessFilled v-if="requirements.onlyNumbers" />
                  <CircleClose v-else />
                </el-icon>
                <span>{{ $t('mine.withdrawPwdOnlyNumbers') }}</span>
              </div>
              <div class="requirement-item" :class="{ valid: requirements.notSameAsLogin }">
                <el-icon>
                  <Warning v-if="!requirements.notSameAsLogin" />
                  <SuccessFilled v-else />
                </el-icon>
                <span>{{ $t('mine.withdrawPwdNotSameAsLogin') }}</span>
              </div>
            </div>
          </div>
        </el-form-item>

        <!-- 操作按钮 -->
        <el-form-item>
          <div class="form-actions">
            <el-button
              type="primary"
              size="large"
              :loading="isSubmitting"
              @click="handleSubmit"
            >
              {{ submitButtonText }}
            </el-button>
            <el-button
              size="large"
              @click="handleReset"
            >
              {{ $t('common.reset') }}
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <!-- 安全建议 -->
      <div class="security-suggestions">
        <el-divider content-position="left">
          <el-icon><InfoFilled /></el-icon>
          {{ $t('mine.securitySuggestions') }}
        </el-divider>
        <ul>
          <li>{{ $t('mine.suggestion1') }}</li>
          <li>{{ $t('mine.suggestion2') }}</li>
          <li>{{ $t('mine.suggestion3') }}</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ArrowLeft,
  Lock,
  Key,
  CircleCheck,
  CircleClose,
  SuccessFilled,
  Warning,
  InfoFilled
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import api from '@/api'

defineOptions({ name: 'WithdrawPassword' })

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()

// 状态
const passwordFormRef = ref<FormInstance>()
const isSubmitting = ref(false)
const isModify = ref(false)

// 表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码要求检查
const requirements = reactive({
  length: false,
  onlyNumbers: false,
  notSameAsLogin: true
})

// 页面标题
const pageTitle = computed(() =>
  isModify.value ? t('mine.modifyWithdrawPwd') : t('mine.settingWithdrawPwd')
)

// 提交按钮文字
const submitButtonText = computed(() =>
  isSubmitting.value
    ? t('common.submitting')
    : (isModify.value ? t('mine.confirmModify') : t('mine.confirmSet'))
)

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = passwordForm.newPassword
  if (!pwd) return { percent: 0, text: '', color: '#909399' }

  let strength = 0
  if (pwd.length >= 6) strength += 25
  if (pwd.length >= 8) strength += 25
  if (/^\d+$/.test(pwd)) strength += 25  // 纯数字
  if (pwd.length <= 20) strength += 25

  const levels = [
    { percent: 25, text: t('mine.passwordWeak'), color: '#F56C6C' },
    { percent: 50, text: t('mine.passwordMedium'), color: '#E6A23C' },
    { percent: 75, text: t('mine.passwordStrong'), color: '#67C23A' },
    { percent: 100, text: t('mine.passwordVeryStrong'), color: '#409EFF' }
  ]

  const index = Math.floor((strength - 1) / 25)
  return levels[Math.min(index, 3)]
})

// 验证规则
const validateOldPassword = (rule: any, value: any, callback: any) => {
  if (isModify.value && !value) {
    callback(new Error(t('mine.inputCurrWithdrawPwd')))
  } else {
    callback()
  }
}

const validateNewPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error(isModify.value ? t('mine.inputNewWithdrawPwd') : t('mine.inputWithdrawPwd')))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error(t('mine.withdrawPwdLength')))
  } else if (!/^\d+$/.test(value)) {
    callback(new Error(t('mine.withdrawPwdOnlyNumbers')))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error(t('mine.inputWithdrawPwdAgain')))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error(t('mine.passwordNotMatch')))
  } else {
    callback()
  }
}

// 表单验证规则
const formRules = reactive<FormRules>({
  oldPassword: [
    { validator: validateOldPassword, trigger: 'blur' }
  ],
  newPassword: [
    { validator: validateNewPassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// 验证密码强度和要求
function validatePasswordStrength() {
  const pwd = passwordForm.newPassword
  requirements.length = pwd.length >= 6 && pwd.length <= 20
  requirements.onlyNumbers = /^\d+$/.test(pwd)
  requirements.notSameAsLogin = true // 这里应该比对登录密码
}

// 返回
function handleBack() {
  router.back()
}

// 重置表单
function handleReset() {
  passwordFormRef.value?.resetFields()
  Object.keys(requirements).forEach(key => {
    if (key !== 'notSameAsLogin') {
      requirements[key as keyof typeof requirements] = false
    }
  })
}

// 提交表单
async function handleSubmit() {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return

    if (isSubmitting.value) return

    try {
      const confirmText = isModify.value
        ? t('mine.confirmModifyWithdrawPwd')
        : t('mine.confirmSetWithdrawPwd')

      await ElMessageBox.confirm(
        confirmText,
        t('common.confirm'),
        {
          confirmButtonText: t('common.confirm'),
          cancelButtonText: t('common.cancel'),
          type: 'warning'
        }
      )

      isSubmitting.value = true
      appStore.loading()

      const requestData = {
        old_withdraw_pwd: isModify.value ? passwordForm.oldPassword : '',
        new_withdraw_pwd: passwordForm.newPassword,
        confirm_withdraw_pwd: passwordForm.confirmPassword
      }

      const resp = await api.updateWithdrawPassword(requestData)

      if (resp && resp.code === 200) {
        const successMsg = isModify.value
          ? t('mine.withdrawPwdModifySuccess')
          : t('mine.withdrawPwdSetSuccess')

        ElMessage.success(resp.message || successMsg)

        // 更新用户状态
        if (!isModify.value) {
          const user = appStore.getUser()
          if (user) {
            user.has_qk_pwd = true
            appStore.setUser(user)
          }
        }

        setTimeout(() => {
          router.back()
        }, 1500)
      } else {
        throw new Error(resp?.message || t('mine.operationFailed'))
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || t('mine.operationFailed'))
      }
    } finally {
      isSubmitting.value = false
      appStore.stopLoad()
    }
  })
}

// 初始化
function init() {
  const user = appStore.getUser()
  isModify.value = !!(user && user.has_qk_pwd)
}

// 监听密码变化
watch(() => passwordForm.newPassword, () => {
  if (passwordForm.confirmPassword) {
    passwordFormRef.value?.validateField('confirmPassword')
  }
})

onMounted(() => {
  init()
})
</script>

<style lang="less" scoped>
.withdraw-password-container {
  min-height: calc(100vh - 60px);
  padding: 20px;
  background-color: #f5f7fa;

  .password-card {
    max-width: 800px;
    margin: 0 auto;

    .card-header {
      display: flex;
      align-items: center;
      gap: 20px;

      h2 {
        margin: 0;
        font-size: 20px;
        color: #303133;
      }
    }

    .security-alert {
      margin-bottom: 30px;

      .security-tips {
        margin: 10px 0 0 0;
        padding-left: 20px;

        li {
          line-height: 1.8;
          color: #e6a23c;
        }
      }
    }

    .password-form {
      padding: 20px 40px;

      .password-info {
        margin-top: 10px;

        .el-progress {
          margin-bottom: 5px;
        }

        .strength-text {
          font-size: 12px;
        }
      }

      .password-requirements {
        background-color: #f4f4f5;
        padding: 20px;
        border-radius: 4px;

        h4 {
          margin: 0 0 15px 0;
          color: #606266;
          font-size: 14px;
        }

        .requirement-list {
          display: flex;
          flex-direction: column;
          gap: 10px;

          .requirement-item {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #909399;
            transition: color 0.3s;

            .el-icon {
              font-size: 16px;
            }

            &.valid {
              color: #67c23a;
            }
          }
        }
      }

      .form-actions {
        display: flex;
        gap: 20px;

        .el-button {
          min-width: 120px;
        }
      }
    }

    .security-suggestions {
      padding: 0 40px 20px;

      ul {
        margin: 15px 0 0 0;
        padding-left: 20px;
        color: #909399;

        li {
          line-height: 1.8;
          font-size: 13px;
        }
      }
    }
  }
}
</style>
