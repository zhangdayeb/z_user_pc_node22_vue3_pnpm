<template>
  <div class="change-password-container">
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
          <h2>{{ $t('mine.modifyLoginPwd') }}</h2>
        </div>
      </template>

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
            <div class="strength-bar">
              <div
                class="strength-level"
                :class="passwordStrength.class"
                :style="{ width: passwordStrength.percent }"
              ></div>
            </div>
            <span class="strength-text" :class="passwordStrength.class">
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
              <el-icon><Check /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 密码要求提示 -->
        <el-form-item>
          <div class="password-tips">
            <p class="tips-title">{{ $t('mine.passwordRequirements') }}:</p>
            <ul>
              <li :class="{ valid: passwordChecks.length }">
                <el-icon><CircleCheck v-if="passwordChecks.length" /><CircleClose v-else /></el-icon>
                {{ $t('mine.passwordLength') }}
              </li>
              <li :class="{ valid: passwordChecks.hasNumber }">
                <el-icon><CircleCheck v-if="passwordChecks.hasNumber" /><CircleClose v-else /></el-icon>
                {{ $t('mine.passwordNumber') }}
              </li>
              <li :class="{ valid: passwordChecks.hasLetter }">
                <el-icon><CircleCheck v-if="passwordChecks.hasLetter" /><CircleClose v-else /></el-icon>
                {{ $t('mine.passwordLetter') }}
              </li>
            </ul>
          </div>
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <div class="form-actions">
            <el-button
              type="primary"
              size="large"
              :loading="isSubmitting"
              @click="handleSubmit"
            >
              {{ isSubmitting ? $t('common.submitting') : $t('submit') }}
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
    </el-card>
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
  Check,
  CircleCheck,
  CircleClose
} from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import api from '@/api'

defineOptions({ name: 'ChangePassword' })

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
  if (!pwd) return { percent: '0%', text: '', class: '' }

  let strength = 0
  if (pwd.length >= 6) strength++
  if (pwd.length >= 10) strength++
  if (/[0-9]/.test(pwd)) strength++
  if (/[a-zA-Z]/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++

  const levels = [
    { percent: '20%', text: t('mine.passwordWeak'), class: 'weak' },
    { percent: '40%', text: t('mine.passwordWeak'), class: 'weak' },
    { percent: '60%', text: t('mine.passwordMedium'), class: 'medium' },
    { percent: '80%', text: t('mine.passwordStrong'), class: 'strong' },
    { percent: '100%', text: t('mine.passwordVeryStrong'), class: 'very-strong' }
  ]

  return levels[Math.min(strength - 1, 4)] || levels[0]
})

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

<style lang="less" scoped>
.change-password-container {
  min-height: calc(100vh - 60px);
  padding: 20px;
  background-color: #f5f7fa;

  .password-card {
    max-width: 700px;
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

    .password-form {
      padding: 20px 40px;

      .password-strength {
        margin-top: 10px;

        .strength-bar {
          height: 6px;
          background-color: #ebeef5;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 5px;

          .strength-level {
            height: 100%;
            border-radius: 3px;
            transition: all 0.3s;

            &.weak {
              background-color: #f56c6c;
            }

            &.medium {
              background-color: #e6a23c;
            }

            &.strong {
              background-color: #67c23a;
            }

            &.very-strong {
              background: linear-gradient(90deg, #67c23a, #409eff);
            }
          }
        }

        .strength-text {
          font-size: 12px;

          &.weak {
            color: #f56c6c;
          }

          &.medium {
            color: #e6a23c;
          }

          &.strong {
            color: #67c23a;
          }

          &.very-strong {
            color: #409eff;
          }
        }
      }

      .password-tips {
        background-color: #f4f4f5;
        padding: 15px;
        border-radius: 4px;

        .tips-title {
          margin: 0 0 10px 0;
          font-weight: 500;
          color: #606266;
        }

        ul {
          margin: 0;
          padding-left: 0;
          list-style: none;

          li {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 0;
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
        margin-left: 0;

        .el-button {
          min-width: 120px;
        }
      }
    }
  }
}

// 响应式适配
@media (max-width: 768px) {
  .change-password-container {
    padding: 10px;

    .password-card {
      .password-form {
        padding: 20px;

        :deep(.el-form-item__label) {
          width: 100px !important;
        }
      }
    }
  }
}
</style>
