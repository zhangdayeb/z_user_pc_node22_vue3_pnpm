<template>
  <div class="m-login-pwd">
    <!-- 移动端导航栏 -->
    <van-nav-bar
      v-if="isMobile"
      left-arrow
      :title="
        isModify === false
          ? $t('mine.settingWithdrawalPwd')
          : $t('mine.modifyWithdrawalPwd')
      "
      @click-left="onClickLeft"
    />

    <!-- PC端标题 -->
    <div v-else class="pc-header">
      <div class="pc-header-inner">
        <button class="back-btn" @click="onClickLeft">
          <span class="back-icon"></span>
          {{ $t('common.back') }}
        </button>
        <h2 class="page-title">
          {{ isModify === false
            ? $t('mine.settingWithdrawalPwd')
            : $t('mine.modifyWithdrawalPwd')
          }}
        </h2>
      </div>
    </div>

    <van-form @submit="onSubmit" class="m-frm" :class="{ 'pc-form': !isMobile }">
      <template v-if="isModify">
        <van-field
          v-model="frm.oldPassword"
          autocomplete="current-password"
          type="password"
          :name="$t('mine.currPwd')"
          :label="$t('mine.currPwd')"
          :placeholder="$t('mine.inputCurrPwd')"
          :rules="[{ required: true, message: $t('mine.inputCurrPwd') }]"
        />
        <van-field
          v-model="frm.password"
          autocomplete="new-password"
          type="password"
          :name="$t('mine.newPwd')"
          :label="$t('mine.newPwd')"
          :placeholder="$t('mine.inputNewPwd')"
          :rules="[
            { required: true, message: $t('mine.inputNewPwd') },
            { validator: passwordValidator, message: $t('mine.passwordTooShort') }
          ]"
        />
        <van-field
          v-model="frm.rePassword"
          autocomplete="new-password"
          type="password"
          :name="$t('mine.confrmNewPwd')"
          :label="$t('mine.confrmNewPwd')"
          :placeholder="$t('mine.inputNewPwdAgain')"
          :rules="[
            { required: true, message: $t('mine.inputNewPwdAgain') },
            { validator: confirmPasswordValidator, message: $t('mine.newPwdDiff') },
          ]"
        />
      </template>
      <template v-else>
        <van-field
          v-model="frm.password"
          autocomplete="new-password"
          type="password"
          :name="$t('mine.qknewPwd')"
          :label="$t('mine.qknewPwd')"
          :placeholder="$t('mine.inputPlz')"
          :rules="[
            { required: true, message: $t('mine.inputPlz') },
            { validator: passwordValidator, message: $t('mine.passwordTooShort') }
          ]"
        />
        <van-field
          v-model="frm.rePassword"
          autocomplete="new-password"
          type="password"
          :name="$t('mine.confrmqkPwd')"
          :label="$t('mine.confrmqkPwd')"
          :placeholder="$t('mine.inputPlzAgain')"
          :rules="[
            { required: true, message: $t('mine.inputPlzAgain') },
            { validator: confirmPasswordValidator, message: $t('mine.inputTisDiff') },
          ]"
        />
      </template>
      <div class="form-actions" :class="{ 'pc-actions': !isMobile }">
        <van-button
          round
          block
          type="primary"
          native-type="submit"
          size="large"
          class="m-btn"
          :loading="isSubmitting"
        >
          {{ $t('submit') }}
        </van-button>
      </div>
    </van-form>

    <!-- PC端提示信息 -->
    <div v-if="!isMobile && !isModify" class="pc-tips">
      <div class="tip-icon">
        <span class="info-icon"></span>
      </div>
      <div class="tip-content">
        <h4>{{ $t('sweetWarning') }}</h4>
        <p>{{ $t('withdrawPwdTip1', '提现密码用于保护您的资金安全') }}</p>
        <p>{{ $t('withdrawPwdTip2', '请牢记您的提现密码，避免资金损失') }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
import api from '@/api'

defineOptions({ name: 'ModifyWithdrawalPwd' })

const router = useRouter()
const store = useAppStore()
const { t } = useI18n()
const isModify = ref(false)
const isSubmitting = ref(false)

// 响应式检测
const isMobile = computed(() => {
  return window.innerWidth < 768
})

const frm = ref({
  oldPassword: '',
  password: '',
  rePassword: '',
})

// 密码强度验证器
const passwordValidator = (val: string) => {
  if (!val || val.trim().length === 0) return false
  // 提现密码长度验证（6-20位）
  if (val.length < 6 || val.length > 20) return false
  return true
}

// 确认密码验证器
const confirmPasswordValidator = (val: string) => {
  if (!val || val.trim().length === 0) return false
  // 确认密码必须与新密码一致
  return val === frm.value.password
}

function onClickLeft() {
  router.back()
}

async function onSubmit() {
  // 防止重复提交
  if (isSubmitting.value) return

  if (isModify.value) {
    // 修改提现密码
    await updateWithdrawPassword()
  } else {
    // 设置提现密码（使用空字符串作为旧密码）
    await updateWithdrawPassword(true)
  }
}

function init() {
  const user = store.getUser()
  // 检查用户是否已设置提现密码
  if (user && user.has_qk_pwd === false) {
    isModify.value = false // 首次设置
  } else {
    isModify.value = true // 修改密码
  }
}

// 修改/设置提现密码
async function updateWithdrawPassword(isFirstSet = false) {
  try {
    isSubmitting.value = true
    store.loading()

    // 准备请求参数，匹配后端期望的字段名
    const requestData = {
      old_withdraw_pwd: isFirstSet ? '' : frm.value.oldPassword, // 首次设置时旧密码为空
      new_withdraw_pwd: frm.value.password,
      confirm_withdraw_pwd: frm.value.rePassword,
    }

    // 使用正确的API方法名
    const resp = await api.updateWithdrawPassword(requestData)

    if (resp && resp.code === 200) {
      store.stopLoad()
      showToast({
        message: resp.message || (isFirstSet ? t('mine.setSuccess') : t('mine.modifySuccess')),
        onClose: () => {
          // 如果是首次设置，更新用户状态
          if (!isModify.value) {
            const user = store.getUser()
            if (user) {
              user.has_qk_pwd = true
              store.setUser(user)
            }
          }
          router.back()
        },
      })
    } else {
      throw new Error(resp?.message || t('mine.operationFailed'))
    }
  } catch (err) {
    store.stopLoad()
    const errorMessage = (err as Error).message || t('mine.operationFailed')
    showToast({
      type: 'fail',
      message: errorMessage
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  init()
})
</script>

<style lang="less" scoped>
.m-login-pwd {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #f5f5f5;

  // PC端头部样式
  .pc-header {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    margin-bottom: 20px;

    .pc-header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 20px;

      .back-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: transparent;
        border: 1px solid #ddd;
        border-radius: 4px;
        cursor: pointer;
        color: #333;
        font-size: 14px;
        transition: all 0.3s;

        &:hover {
          background: #f5f5f5;
          border-color: #999;
        }

        .back-icon {
          display: inline-block;
          width: 0;
          height: 0;
          border-style: solid;
          border-width: 6px 8px 6px 0;
          border-color: transparent #666 transparent transparent;
        }
      }

      .page-title {
        font-size: 24px;
        font-weight: 500;
        color: #333;
        margin: 0;
      }
    }
  }

  .m-frm {
    margin-top: 10px;
    background: #fff;

    // PC端表单样式
    &.pc-form {
      max-width: 600px;
      margin: 20px auto;
      padding: 40px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      :deep(.van-cell) {
        padding: 16px 20px;

        .van-field__label {
          width: 120px;
          color: #333;
          font-weight: 500;
        }

        .van-field__control {
          font-size: 15px;
        }
      }
    }
  }

  .form-actions {
    margin: 16px;

    &.pc-actions {
      margin: 40px 0 0 0;
      display: flex;
      justify-content: center;

      .van-button {
        width: 300px;
        height: 48px;
        font-size: 16px;
      }
    }
  }

  .m-btn {
    margin-top: 40px;
  }

  // PC端提示信息
  .pc-tips {
    max-width: 600px;
    margin: 30px auto;
    padding: 24px;
    background: #f0f8ff;
    border-radius: 8px;
    border-left: 4px solid #1890ff;
    display: flex;
    gap: 16px;

    .tip-icon {
      flex-shrink: 0;

      .info-icon {
        display: inline-block;
        width: 24px;
        height: 24px;
        position: relative;

        &::before {
          content: '';
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #1890ff;
        }

        &::after {
          content: 'i';
          position: absolute;
          width: 24px;
          height: 24px;
          color: #fff;
          font-size: 16px;
          font-weight: bold;
          text-align: center;
          line-height: 24px;
          font-style: normal;
        }
      }
    }

    .tip-content {
      flex: 1;

      h4 {
        margin: 0 0 12px 0;
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }

      p {
        margin: 8px 0;
        font-size: 14px;
        color: #666;
        line-height: 1.6;
      }
    }
  }
}

// 移动端优化
@media (max-width: 768px) {
  .m-login-pwd {
    .pc-header {
      display: none;
    }

    .pc-tips {
      display: none;
    }

    .m-frm {
      &.pc-form {
        max-width: 100%;
        margin: 10px 0 0 0;
        padding: 0;
        border-radius: 0;
        box-shadow: none;
      }
    }
  }
}

// 平板端优化
@media (min-width: 768px) and (max-width: 1024px) {
  .m-login-pwd {
    .m-frm.pc-form {
      margin: 20px;
      max-width: calc(100% - 40px);
    }

    .pc-tips {
      margin: 30px 20px;
      max-width: calc(100% - 40px);
    }
  }
}
</style>
