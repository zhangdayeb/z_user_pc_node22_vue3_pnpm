<template>
  <div class="m-login-pwd">
    <van-nav-bar
      left-arrow
      :title="$t('mine.modifyLoginPwd')"
      @click-left="onClickLeft"
    />
    <van-form @submit="onSubmit" class="m-frm">
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
import api from '@/api'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ModifyLoginPwd' })

const { t } = useI18n()
const router = useRouter()
const store = useAppStore()
const isSubmitting = ref(false)

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

    console.log('修改登录密码请求参数:', requestData)

    // 使用正确的API方法名
    const resp = await api.updatePassword(requestData)

    console.log('修改登录密码响应:', resp)

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
    console.error('修改密码失败:', err)
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
  console.log('密码修改组件已挂载')
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
