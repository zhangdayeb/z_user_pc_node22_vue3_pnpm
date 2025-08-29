<template>
  <div class="m-login-pwd">
    <van-nav-bar
      left-arrow
      :title="
        isModify === false
          ? $t('mine.settingWithdrawalPwd')
          : $t('mine.modifyWithdrawalPwd')
      "
      @click-left="onClickLeft"
    />

    <van-form @submit="onSubmit" class="m-frm">
      <template v-if="isModify">
        <van-field
          v-model="frm.oldPassword"
          autocomplete="current-password"
          type="password"
          :name="$t('mine.currPwd')"
          :label="$t('mine.currPwd')"
          :placeholder="$t('mine.currPwd')"
          :rules="[{ required: true, message: $t('mine.inputCurrPwd') }]"
        />
        <van-field
          v-model="frm.password"
          autocomplete="new-password"
          type="password"
          :name="$t('mine.newPwd')"
          :label="$t('mine.newPwd')"
          :placeholder="$t('mine.newPwd')"
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
          :placeholder="$t('mine.confrmNewPwd')"
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
          :placeholder="$t('mine.qknewPwd')"
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
          :placeholder="$t('mine.confrmqkPwd')"
          :rules="[
            { required: true, message: $t('mine.inputPlzAgain') },
            { validator: confirmPasswordValidator, message: $t('mine.inputTisDiff') },
          ]"
        />
      </template>
      <div style="margin: 16px">
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
import { ref, onMounted } from 'vue'
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

    console.log('修改提现密码请求参数:', requestData)

    // 使用正确的API方法名
    const resp = await api.updateWithdrawPassword(requestData)

    console.log('修改提现密码响应:', resp)

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
    console.error('修改提现密码失败:', err)
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
  console.log('提现密码组件已挂载, isModify:', isModify.value)
})
</script>

<style lang="less" scoped>
.m-login-pwd {
  display: flex;
  flex-direction: column;
  height: 100%;

  .m-frm {
    margin-top: 10px;
  }

  .m-btn {
    margin-top: 40px;
  }
}
</style>
