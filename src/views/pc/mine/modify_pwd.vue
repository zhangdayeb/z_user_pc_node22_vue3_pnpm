<template>
  <div class="m-login-pwd">
    <!-- PC端导航栏 -->
    <van-nav-bar
      v-if="isMobile"
      left-arrow
      :title="$t('mine.modifyLoginPwd')"
      @click-left="onClickLeft"
    />

    <!-- PC端标题 -->
    <div v-else class="pc-header">
      <div class="pc-header-inner">
        <button class="back-btn" @click="onClickLeft">
          <span class="back-icon"></span>
          {{ $t('common.back') }}
        </button>
        <h2 class="page-title">{{ $t('mine.modifyLoginPwd') }}</h2>
      </div>
    </div>

    <van-form @submit="onSubmit" class="m-frm" :class="{ 'pc-form': !isMobile }">
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import api from '@/api'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ModifyLoginPwd' })

const { t } = useI18n()
const router = useRouter()
const store = useAppStore()
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
  // 密码长度验证（6-20位）
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
  await modifyPwdAction()
}

async function modifyPwdAction() {
  // 防止重复提交
  if (isSubmitting.value) return

  try {
    isSubmitting.value = true
    store.loading()

    // 请求参数匹配后端期望的字段名
    const requestData = {
      old_password: frm.value.oldPassword,
      new_password: frm.value.password,
      confirm_password: frm.value.rePassword,
    }

    // 使用正确的API方法名
    const resp = await api.updatePassword(requestData)

    if (resp && resp.code === 200) {
      store.stopLoad()
      showToast({
        message: resp.message || t('mine.successAndLoginAgain'),
        onClose: () => {
          // 密码修改成功后，清除用户状态并跳转到登录页
          store.logout()
          // 跳转到首页，触发登录流程
          window.location.href = '/'
        },
      })
    } else {
      throw new Error(resp?.message || t('mine.modifyFailed'))
    }
  } catch (err) {
    store.stopLoad()
    const errorMessage = (err as Error).message || t('mine.modifyFailed')
    showToast({
      type: 'fail',
      message: errorMessage
    })
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  // 组件挂载时可以做一些初始化工作
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
}

// 移动端优化
@media (max-width: 768px) {
  .m-login-pwd {
    .pc-header {
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
</style>
