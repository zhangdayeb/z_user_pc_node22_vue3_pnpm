<template>
  <div class="pc-change-password">
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
      <h2 class="page-title">{{ $t('mine.modifyLoginPwd') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 修改密码表单 -->
      <div class="form-section">
        <el-form
          ref="passwordFormRef"
          :model="passwordForm"
          :rules="formRules"
          label-width="140px"
          class="password-form"
          @submit.prevent="handleSubmit"
        >
          <!-- 当前密码 -->
          <el-form-item
            :label="$t('mine.currPwd')"
            prop="oldPassword"
          >
            <el-input
              v-model="passwordForm.oldPassword"
              type="password"
              :placeholder="$t('mine.inputCurrPwd')"
              show-password
              autocomplete="current-password"
              clearable
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 新密码 -->
          <el-form-item
            :label="$t('mine.newPwd')"
            prop="newPassword"
          >
            <el-input
              v-model="passwordForm.newPassword"
              type="password"
              :placeholder="$t('mine.inputNewPwd')"
              show-password
              autocomplete="new-password"
              clearable
              @input="checkPasswordStrength"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>

            <!-- 密码强度指示器 -->
            <div v-if="passwordForm.newPassword" class="password-strength">
              <el-progress
                :percentage="getStrengthPercentage()"
                :color="passwordStrength.color"
                :show-text="false"
                class="strength-bar"
              />
              <span class="strength-text" :style="{ color: passwordStrength.color }">
                {{ passwordStrength.text }}
              </span>
            </div>
          </el-form-item>

          <!-- 确认新密码 -->
          <el-form-item
            :label="$t('mine.confrmNewPwd')"
            prop="confirmPassword"
          >
            <el-input
              v-model="passwordForm.confirmPassword"
              type="password"
              :placeholder="$t('mine.inputNewPwdAgain')"
              show-password
              autocomplete="new-password"
              clearable
              @paste.prevent
            >
              <template #prefix>
                <el-icon><CircleCheck /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 提交按钮 -->
          <el-form-item class="form-actions">
            <el-button
              type="primary"
              size="large"
              :loading="isSubmitting"
              @click="handleSubmit"
              class="submit-btn"
            >
              {{ isSubmitting ? $t('common.submitting') : $t('submit') }}
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

      <!-- 密码要求提示 -->
      <div class="requirements-section">
        <h3 class="section-title">{{ $t('mine.passwordRequirements') }}</h3>
        <div class="requirement-list">
          <div class="requirement-item" :class="{ valid: passwordChecks.length }">
            <el-icon class="requirement-icon">
              <CircleCheck v-if="passwordChecks.length" />
              <CircleClose v-else />
            </el-icon>
            <span>{{ $t('mine.passwordLength') }}</span>
          </div>
          <div class="requirement-item" :class="{ valid: passwordChecks.hasNumber }">
            <el-icon class="requirement-icon">
              <CircleCheck v-if="passwordChecks.hasNumber" />
              <CircleClose v-else />
            </el-icon>
            <span>{{ $t('mine.passwordNumber') }}</span>
          </div>
          <div class="requirement-item" :class="{ valid: passwordChecks.hasLetter }">
            <el-icon class="requirement-icon">
              <CircleCheck v-if="passwordChecks.hasLetter" />
              <CircleClose v-else />
            </el-icon>
            <span>{{ $t('mine.passwordLetter') }}</span>
          </div>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="security-section">
        <h3 class="section-title">安全提示</h3>
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul class="security-tips">
              <li>密码修改成功后，需要重新登录</li>
              <li>请使用包含字母和数字的强密码</li>
              <li>不要使用简单或常见的密码组合</li>
              <li>定期更换密码以保证账户安全</li>
            </ul>
          </template>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  ArrowLeft,
  Lock,
  Key,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import api from '@/api'

defineOptions({ name: 'PcChangePassword' })

const { t } = useI18n()
const router = useRouter()
const appStore = useAppStore()

// 表单引用
const passwordFormRef = ref<FormInstance>()
const isSubmitting = ref(false)

// 表单数据
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 密码强度检查
const passwordChecks = reactive({
  length: false,
  hasNumber: false,
  hasLetter: false,
  hasSpecial: false
})

// 密码强度计算
const passwordStrength = computed(() => {
  const pwd = passwordForm.newPassword
  if (!pwd) return { text: '', color: '#909399' }

  let strength = 0
  if (pwd.length >= 6) strength++
  if (pwd.length >= 10) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[a-zA-Z]/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++

  const levels = [
    { text: t('mine.passwordWeak'), color: '#F56C6C' },
    { text: t('mine.passwordWeak'), color: '#F56C6C' },
    { text: t('mine.passwordMedium'), color: '#E6A23C' },
    { text: t('mine.passwordStrong'), color: '#67C23A' },
    { text: t('mine.passwordVeryStrong'), color: '#409EFF' }
  ]

  return levels[Math.min(strength - 1, 4)] || levels[0]
})

// 获取强度百分比
function getStrengthPercentage(): number {
  const pwd = passwordForm.newPassword
  if (!pwd) return 0

  let strength = 0
  if (pwd.length >= 6) strength++
  if (pwd.length >= 10) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[a-zA-Z]/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++

  return Math.min(strength * 20, 100)
}

// 自定义验证规则
const validatePassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error(t('mine.inputNewPwd')))
  } else if (value.length < 6 || value.length > 20) {
    callback(new Error(t('mine.passwordTooShort')))
  } else if (value === passwordForm.oldPassword) {
    callback(new Error(t('mine.newPasswordSameAsOld')))
  } else {
    callback()
  }
}

const validateConfirmPassword = (rule: any, value: any, callback: any) => {
  if (!value) {
    callback(new Error(t('mine.inputNewPwdAgain')))
  } else if (value !== passwordForm.newPassword) {
    callback(new Error(t('mine.newPwdDiff')))
  } else {
    callback()
  }
}

// 表单验证规则
const formRules = reactive<FormRules>({
  oldPassword: [
    { required: true, message: t('mine.inputCurrPwd'), trigger: 'blur' },
    { min: 6, max: 20, message: t('mine.passwordLength'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
})

// 检查密码强度
function checkPasswordStrength() {
  const pwd = passwordForm.newPassword
  passwordChecks.length = pwd.length >= 6 && pwd.length <= 20
  passwordChecks.hasNumber = /[0-9]/.test(pwd)
  passwordChecks.hasLetter = /[a-zA-Z]/.test(pwd)
  passwordChecks.hasSpecial = /[^a-zA-Z0-9]/.test(pwd)
}

// 返回
function handleBack() {
  router.back()
}

// 重置表单
function handleReset() {
  passwordFormRef.value?.resetFields()
  Object.keys(passwordChecks).forEach(key => {
    passwordChecks[key as keyof typeof passwordChecks] = false
  })
}

// 提交表单
async function handleSubmit() {
  if (!passwordFormRef.value) return

  await passwordFormRef.value.validate(async (valid) => {
    if (!valid) return

    if (isSubmitting.value) return

    try {
      await ElMessageBox.confirm(
        t('mine.confirmPasswordChange'),
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
        old_password: passwordForm.oldPassword,
        new_password: passwordForm.newPassword,
        confirm_password: passwordForm.confirmPassword
      }

      const resp = await api.updatePassword(requestData)

      if (resp && resp.code === 200) {
        ElMessage.success(resp.message || t('mine.successAndLoginAgain'))

        // 密码修改成功，退出登录
        setTimeout(() => {
          appStore.logout()
          router.push('/login')
        }, 1500)
      } else {
        throw new Error(resp?.message || t('mine.modifyFailed'))
      }
    } catch (error: any) {
      if (error !== 'cancel') {
        ElMessage.error(error.message || t('mine.modifyFailed'))
      }
    } finally {
      isSubmitting.value = false
      appStore.stopLoad()
    }
  })
}

// 监听新密码变化，实时验证确认密码
watch(() => passwordForm.newPassword, () => {
  if (passwordForm.confirmPassword) {
    passwordFormRef.value?.validateField('confirmPassword')
  }
})
</script>

<style scoped>
.pc-change-password {
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

.form-section {
  margin-bottom: 32px;
}

.password-form .el-form-item {
  margin-bottom: 24px;
}

.password-strength {
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

.security-section {
  border-top: 1px solid #ebeef5;
  padding-top: 24px;
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
  color: #606266;
  font-size: 14px;
}

.security-tips li:before {
  content: '•';
  position: absolute;
  left: -16px;
  color: #409eff;
}

/* Element Plus 样式覆盖 */
.pc-change-password :deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

.pc-change-password :deep(.el-input__wrapper) {
  border-radius: 6px;
}

.pc-change-password :deep(.el-alert) {
  border-radius: 6px;
}

@media (min-width: 1600px) {
  .pc-change-password {
    max-width: 1400px;
  }
}
</style>
