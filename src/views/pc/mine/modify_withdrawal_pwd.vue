<template>
  <div class="pc-withdraw-password">
    <!-- PC端头部 -->
    <div class="pc-header">
      <el-button
        type="primary"
        :icon="ArrowLeft"
        @click="handleBack"
        class="back-btn"
      >
        {{ $t('common.back') }}
      </el-button>
      <h2 class="page-title">{{ pageTitle }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 安全提示 -->
      <div v-if="!isModify" class="security-notice">
        <h3 class="section-title">{{ $t('mine.withdrawPasswordImportant') }}</h3>
        <el-alert
          :title="$t('mine.withdrawPasswordImportant')"
          type="warning"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul class="security-tips">
              <li>{{ $t('mine.withdrawPwdTip1') }}</li>
              <li>{{ $t('mine.withdrawPwdTip2') }}</li>
              <li>{{ $t('mine.withdrawPwdTip3') }}</li>
            </ul>
          </template>
        </el-alert>
      </div>

      <!-- 密码设置表单 -->
      <div class="form-section">
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
                class="strength-bar"
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

          <!-- 操作按钮 -->
          <el-form-item class="form-actions">
            <el-button
              type="primary"
              size="large"
              :loading="isSubmitting"
              @click="handleSubmit"
              class="submit-btn"
            >
              {{ submitButtonText }}
            </el-button>
            <el-button
              size="large"
              @click="handleReset"
              class="reset-btn"
            >
              {{ $t('common.reset') }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 密码格式要求 -->
      <div class="requirements-section">
        <h3 class="section-title">{{ $t('mine.passwordFormat') }}</h3>
        <div class="requirement-list">
          <div class="requirement-item" :class="{ valid: requirements.length }">
            <el-icon class="requirement-icon">
              <SuccessFilled v-if="requirements.length" />
              <CircleClose v-else />
            </el-icon>
            <span>{{ $t('mine.withdrawPwdLength') }}</span>
          </div>
          <div class="requirement-item" :class="{ valid: requirements.onlyNumbers }">
            <el-icon class="requirement-icon">
              <SuccessFilled v-if="requirements.onlyNumbers" />
              <CircleClose v-else />
            </el-icon>
            <span>{{ $t('mine.withdrawPwdOnlyNumbers') }}</span>
          </div>
          <div class="requirement-item" :class="{ valid: requirements.notSameAsLogin }">
            <el-icon class="requirement-icon">
              <Warning v-if="!requirements.notSameAsLogin" />
              <SuccessFilled v-else />
            </el-icon>
            <span>{{ $t('mine.withdrawPwdNotSameAsLogin') }}</span>
          </div>
        </div>
      </div>

      <!-- 安全建议 -->
      <div class="suggestions-section">
        <h3 class="section-title">{{ $t('mine.securitySuggestions') }}</h3>
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul class="suggestions-list">
              <li>{{ $t('mine.suggestion1') }}</li>
              <li>{{ $t('mine.suggestion2') }}</li>
              <li>{{ $t('mine.suggestion3') }}</li>
            </ul>
          </template>
        </el-alert>
      </div>
    </div>
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
  Warning
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import api from '@/api'

defineOptions({ name: 'PcWithdrawPassword' })

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

      const resp:any = await api.updateWithdrawPassword(requestData)

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

<style scoped>
.pc-withdraw-password {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.pc-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.back-btn {
  margin-right: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.pc-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 3px;
  width: 3px;
  height: 14px;
  background-color: #4290ff;
  border-radius: 2px;
}

.security-notice {
  margin-bottom: 32px;
}

.security-tips {
  margin: 12px 0 0 0;
  padding-left: 20px;
  list-style: none;
}

.security-tips li {
  position: relative;
  margin-bottom: 8px;
  line-height: 1.6;
  color: #e6a23c;
  font-size: 14px;
}

.security-tips li:before {
  content: '•';
  position: absolute;
  left: -16px;
  color: #e6a23c;
}

.form-section {
  margin-bottom: 32px;
}

.password-form .el-form-item {
  margin-bottom: 24px;
}

.password-info {
  margin-top: 8px;
}

.strength-bar {
  margin-bottom: 4px;
}

.strength-text {
  font-size: 12px;
}

.form-actions :deep(.el-form-item__content) {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 20px;
}

.submit-btn,
.reset-btn {
  min-width: 120px;
  height: 48px;
  font-size: 16px;
}

.requirements-section {
  margin-bottom: 32px;
}

.requirement-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  transition: color 0.3s;
}

.requirement-item.valid {
  color: #67c23a;
}

.requirement-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.suggestions-section {
  border-top: 1px solid #ebeef5;
  padding-top: 24px;
}

.suggestions-list {
  margin: 12px 0 0 0;
  padding-left: 20px;
  list-style: none;
}

.suggestions-list li {
  position: relative;
  margin-bottom: 8px;
  line-height: 1.6;
  color: #606266;
  font-size: 14px;
}

.suggestions-list li:before {
  content: '•';
  position: absolute;
  left: -16px;
  color: #409eff;
}

/* Element Plus 样式覆盖 */
.pc-withdraw-password :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.pc-withdraw-password :deep(.el-input__wrapper) {
  border-radius: 6px;
}

.pc-withdraw-password :deep(.el-alert) {
  border-radius: 6px;
}

@media (min-width: 1600px) {
  .pc-withdraw-password {
    max-width: 1400px;
  }
}
</style>
