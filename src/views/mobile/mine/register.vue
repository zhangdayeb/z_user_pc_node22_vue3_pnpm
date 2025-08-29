<template>
  <div class="m-mine-register">
    <van-nav-bar
      left-arrow
      :title="$t('user.register')"
      @click-left="onClickLeft"
    />
    <div class="m-regiter-frm">
      <van-form ref="regiFrmRefs">
        <van-cell-group inset>
          <van-field
            v-model="frm.name"
            label-align="top"
            :required="true"
            :name="$t('login.username')"
            :label="$t('login.username')"
            :placeholder="$t('login.enterUsername')"
            :rules="[{ required: true, message: $t('register.inputUsername') }]"
          />
          <van-field
            v-model="frm.password"
            :required="true"
            label-align="top"
            type="password"
            :name="$t('login.password')"
            :label="$t('login.password')"
            :placeholder="$t('login.enterPassword')"
            :rules="[{ required: true, message: $t('register.inputPassword') }]"
          />
          <van-field
            v-model="frm.password_confirmation"
            :required="true"
            label-align="top"
            type="password"
            :name="$t('register.confirmPassword')"
            :label="$t('register.confirmPassword')"
            :placeholder="$t('register.inputConfirmPassword')"
            :rules="[
              { required: true, message: $t('register.inputConfirmPassword') },
              { validator: validatePasswordConfirmation }
            ]"
          />
          <van-field
            v-if="
              (store.registerConf?.register_setting_json?.isRealNameRequred ??
                0) === '1'
            "
            v-model="frm.realname"
            :required="true"
            label-align="top"
            type="text"
            :name="$t('register.realName')"
            :label="$t('register.realName')"
            :placeholder="$t('register.inputRealname')"
            :rules="[{ required: true, message: $t('register.inputRealname') }]"
          />

          <van-field
            v-model="frm.qk_pwd"
            :required="true"
            label-align="top"
            type="password"
            :name="$t('mine.qknewPwd')"
            :label="$t('mine.qknewPwd')"
            :placeholder="$t('register.inputQkpwd')"
            :rules="[{ required: true, message: $t('register.inputQkpwd') }]"
          />

          <van-field
            v-if="
              (store.registerConf?.register_setting_json?.isPhoneRequired ??
                0) === '1'
            "
            v-model="frm.phone"
            :required="true"
            label-align="top"
            type="digit"
            :name="$t('register.phone')"
            :label="$t('register.phone')"
            :placeholder="$t('register.inputPhone')"
            :rules="[{ required: true, message: $t('register.inputPhone') }]"
          />

          <!-- 修复后的货币选择器 -->
          <van-field
            v-model="frm.currency"
            :required="true"
            :is-link="true"
            :readonly="true"
            label-align="top"
            type="text"
            :name="$t('register.currency')"
            :label="$t('register.currency')"
            :placeholder="$t('register.inputCurrency')"
            :rules="[{ required: true, message: $t('register.inputCurrency') }]"
            @click="showPopHandler"
          />
          <van-popup v-model:show="showPicker" position="bottom">
            <van-picker
              :columns="columns"
              @confirm="onConfirm"
              @cancel="cancelHandler"
              :title="$t('register.currency')"
            />
          </van-popup>

          <van-field
            v-model="frm.invite_code"
            :required="false"
            label-align="top"
            type="text"
            :name="$t('register.inviteCode')"
            :label="$t('register.inviteCode')"
            :placeholder="$t('register.inputInviterCode')"
            :rules="[
              { required: false, message: $t('register.inputInviterCode') },
            ]"
          />
          <van-field
            v-if="
              (store.registerConf?.register_setting_json?.isCaptchaRequired ??
                0) === '1'
            "
            v-model="frm.captcha"
            :required="true"
            label-align="top"
            type="digit"
            :name="$t('login.captcha')"
            :label="$t('login.captcha')"
            :placeholder="$t('login.enterCaptcha')"
            :rules="[{ required: true, message: $t('login.captchaRequired') }]"
          >
            <template #button>
              <van-image
                :src="captchaImg"
                fit="contain"
                class="m-img"
                @click.stop="refreshCaptcha"
              />
            </template>
          </van-field>
        </van-cell-group>
        <div style="margin: 16px">
          <van-button
            round
            block
            type="primary"
            native-type="button"
            :loading="isSubmitting"
            @click.stop="submitRegisterHandler"
          >
            {{ $t('submit') }}
          </van-button>
        </div>
      </van-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, type PickerConfirmEventParams } from 'vant'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import api from '@/api'

defineOptions({ name: 'RegisterVue' })

const { t } = useI18n()
const store = useAppStore()
const router = useRouter()
const route = useRoute()
const regiFrmRefs = ref()

const captchaImg = ref('')
const showPicker = ref(false)
const isSubmitting = ref(false)

// 更新货币选项 - 添加更多实用货币
const columns = ref([
  { text: '¥ CNY 【人民币】', value: 'zh_cn', code: 'CNY' },
  { text: '$ USD 【美元】', value: 'en', code: 'USD' },
  { text: 'HK$ HKD 【港币】', value: 'zh_hk', code: 'HKD' },
  { text: '€ EUR 【欧元】', value: 'en', code: 'EUR' },
  { text: '£ GBP 【英镑】', value: 'en', code: 'GBP' },
  { text: '¥ JPY 【日元】', value: 'ja', code: 'JPY' },
  { text: '₩ KRW 【韩元】', value: 'ko', code: 'KRW' },
  { text: '฿ THB 【泰铢】', value: 'th', code: 'THB' },
  { text: '₫ VND 【越南盾】', value: 'vi', code: 'VND' },
  { text: 'S$ SGD 【新加坡元】', value: 'en', code: 'SGD' },
])

const currencyIndex = ref<number>(0) // 默认选择人民币

// 获取邀请码的通用函数 - 支持多种参数名称
const getInvitationCodeFromUrl = () => {
  const queryParams = route.query || {}
  const routeParams = route.params || {}

  // 优先级顺序：invite_code > agent_code > invite
  const inviteCode = queryParams.invite_code ||
                     queryParams.agent_code ||
                     queryParams.invite ||
                     routeParams.invite_code ||
                     routeParams.agent_code ||
                     routeParams.invite ||
                     ''

  // 开发环境下打印调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('邀请码参数检测:', {
      fullUrl: window.location.href,
      query: queryParams,
      params: routeParams,
      detectedInviteCode: inviteCode,
      supportedParams: ['invite_code', 'agent_code', 'invite']
    })
  }

  return inviteCode
}

const frm = ref({
  name: '',
  password: '',
  password_confirmation: '',
  realname: '',
  qk_pwd: '',
  phone: '',
  currency: columns.value[currencyIndex.value].text,
  captcha: '',
  key: '',
  invite_code: getInvitationCodeFromUrl(), // 使用新的获取函数
  lang: columns.value[currencyIndex.value].value,
  register_site: '',
  sms_code: '',
})

// 监听路由变化，动态更新邀请码（如果用户通过不同链接访问）
watch(
  () => route.query,
  (newQuery) => {
    const newInviteCode = getInvitationCodeFromUrl()
    if (newInviteCode && newInviteCode !== frm.value.invite_code) {
      frm.value.invite_code = newInviteCode
      console.log('检测到新的邀请码:', newInviteCode)
    }
  },
  { deep: true }
)

// 密码确认验证器
function validatePasswordConfirmation(value: string) {
  if (value !== frm.value.password) {
    return t('mine.newPwdDiff')
  }
  return true
}

function showPopHandler() {
  showPicker.value = true
}

function cancelHandler() {
  showPicker.value = false
}

function onConfirm({
  selectedOptions,
  selectedIndexes,
}: PickerConfirmEventParams) {
  frm.value.currency = `${selectedOptions[0]?.text}`
  currencyIndex.value = selectedIndexes[0]
  frm.value.lang = columns.value[currencyIndex.value].value
  showPicker.value = false
}

function submitRegisterHandler() {
  regiFrmRefs.value
    ?.validate()
    .then(async () => {
      if (isSubmitting.value) return

      try {
        isSubmitting.value = true

        // 确保语言参数正确设置
        frm.value.lang = columns.value[currencyIndex.value].value

        // 修正参数名称以匹配后端API
        const registerData = {
          ...frm.value,
          invitation_code: frm.value.invite_code, // 后端期望 invitation_code
          currency: columns.value[currencyIndex.value].code, // 使用货币代码而不是显示文本
        }

        // 调用正确的API方法名称
        const resp = await api.register(registerData)

        if (resp && resp.code === 200) {
          // 如果返回了token，保存它
          if (resp.token) {
            store.setToken(resp.token)
            await store.getMeForApi()
          }

          showToast({
            message: resp.message || t('login.loginSuccess'),
            onClose: () => {
              router.replace({ name: 'main' })
            },
          })
        } else {
          showToast({
            message: resp?.message || t('login.loginFailed'),
          })
        }
      } catch (err: any) {
        console.error('注册错误:', err)
        showToast({
          message: err?.message || err?.error?.message || t('login.loginError'),
        })
      } finally {
        isSubmitting.value = false
      }
    })
    .catch(e => {
      console.log('表单验证失败:', e)
    })
}

// 刷新验证码
async function refreshCaptcha() {
  try {
    if (
      (store.registerConf?.register_setting_json?.isCaptchaRequired ?? 0) !==
      '1'
    ) {
      return
    }
    const resp = await api.authCaptcha()
    if (resp && resp.code === 200 && resp.data) {
      captchaImg.value = resp.data?.img ?? ''
      frm.value.key = resp.data?.key
    }
  } catch (err) {
    console.log('获取验证码失败:', err)
    showToast(t('login.captchaError'))
  }
}

// 返回
function onClickLeft() {
  router.go(-1)
}

// 初始化
async function init() {
  store.loading()
  await refreshCaptcha()
  store.stopLoad()
}

onMounted(async () => {
  init()
})
</script>

<style scoped lang="less">
.m-mine-register {
  display: flex;
  flex-direction: column;
  height: 100%;

  .m-regiter-frm {
    margin: 16px 0px;
    display: flex;
    flex-direction: column;
    flex: 1;

    .m-img {
      width: 100px;
      height: 25px;
      cursor: pointer;
    }
  }
}
</style>
<style lang="less">
@import url('@/views/mobile/common.less');
</style>
