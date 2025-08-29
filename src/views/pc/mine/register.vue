<template>
  <div class="pc-register">
    <div class="pc-register-container">
      <div class="pc-register-box">
        <div class="pc-register-header">
          <h1>{{ $t('user.register') }}</h1>
          <p>{{ $t('mine.welcomeTo') }}</p>
        </div>

        <el-form
          ref="regiFrmRefs"
          :model="frm"
          :rules="rules"
          label-position="top"
          class="pc-register-form"
          size="large"
        >
          <el-form-item :label="$t('mine.name')" prop="name">
            <el-input
              v-model="frm.name"
              :placeholder="$t('register.inputUsername')"
              clearable
            >
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item :label="$t('mine.loginPwd')" prop="password">
            <el-input
              v-model="frm.password"
              type="password"
              :placeholder="$t('register.inputPassword')"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item :label="$t('register.confirmPassword')" prop="password_confirmation">
            <el-input
              v-model="frm.password_confirmation"
              type="password"
              :placeholder="$t('register.inputConfirmPassword')"
              show-password
            >
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item
            v-if="(store.registerConf?.register_setting_json?.isRealNameRequred ?? 0) === '1'"
            :label="$t('register.realName')"
            prop="realname"
          >
            <el-input
              v-model="frm.realname"
              :placeholder="$t('register.inputRealname')"
              clearable
            >
              <template #prefix>
                <el-icon><UserFilled /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item :label="$t('mine.qknewPwd')" prop="qk_pwd">
            <el-input
              v-model="frm.qk_pwd"
              type="password"
              :placeholder="$t('register.inputQkpwd')"
              show-password
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item
            v-if="(store.registerConf?.register_setting_json?.isPhoneRequired ?? 0) === '1'"
            :label="$t('register.phone')"
            prop="phone"
          >
            <el-input
              v-model="frm.phone"
              :placeholder="$t('register.inputPhone')"
              clearable
            >
              <template #prefix>
                <el-icon><Phone /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 货币选择器 -->
          <el-form-item :label="$t('register.currency')" prop="currency">
            <el-select
              v-model="currencyIndex"
              :placeholder="$t('register.inputCurrency')"
              style="width: 100%"
              @change="onCurrencyChange"
            >
              <el-option
                v-for="(item, index) in columns"
                :key="index"
                :label="item.text"
                :value="index"
              >
                <span style="float: left">{{ item.text }}</span>
              </el-option>
            </el-select>
          </el-form-item>

          <el-form-item :label="$t('register.inviteCode')" prop="invite_code">
            <el-input
              v-model="frm.invite_code as string "
              :placeholder="$t('register.inputInviterCode')"
              clearable
            >
              <template #prefix>
                <el-icon><Ticket /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item
            v-if="(store.registerConf?.register_setting_json?.isCaptchaRequired ?? 0) === '1'"
            :label="$t('login.captcha')"
            prop="captcha"
          >
            <div class="pc-captcha-container">
              <el-input
                v-model="frm.captcha"
                :placeholder="$t('login.enterCaptcha')"
                clearable
                class="pc-captcha-input"
              >
                <template #prefix>
                  <el-icon><Picture /></el-icon>
                </template>
              </el-input>
              <div class="pc-captcha-img" @click="refreshCaptcha">
                <img v-if="captchaImg" :src="captchaImg" alt="captcha" />
                <div v-else class="pc-captcha-placeholder">
                  <el-icon :size="24"><Refresh /></el-icon>
                  <span>{{ $t('login.clickRefresh') }}</span>
                </div>
              </div>
            </div>
          </el-form-item>

          <el-form-item class="pc-submit-item">
            <el-button
              type="primary"
              :loading="isSubmitting"
              @click="submitRegisterHandler"
              class="pc-submit-btn"
            >
              {{ $t('submit') }}
            </el-button>
          </el-form-item>

          <div class="pc-register-footer">
            <span>{{ $t('login.hasAccount') }}</span>
            <el-link type="primary" @click="router.push('/login')">
              {{ $t('login.login') }}
            </el-link>
          </div>
        </el-form>
      </div>

      <div class="pc-register-side">
        <div class="pc-side-content">
          <h2>{{ $t('home.safeBetting') }}</h2>
          <p>{{ $t('home.enjoyExperience') }}</p>
          <div class="pc-features">
            <div class="pc-feature-item">
              <el-icon :size="32" color="#67C23A"><CircleCheck /></el-icon>
              <span>{{ $t('mine.accountSafe') }}</span>
            </div>
            <div class="pc-feature-item">
              <el-icon :size="32" color="#409EFF"><Trophy /></el-icon>
              <span>{{ $t('vip.rightDetail') }}</span>
            </div>
            <div class="pc-feature-item">
              <el-icon :size="32" color="#E6A23C"><Present /></el-icon>
              <span>{{ $t('home.newMemberOffer') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import api from '@/api'
import {
  User,
  Lock,
  UserFilled,
  Key,
  Phone,
  Ticket,
  Picture,
  Refresh,
  CircleCheck,
  Trophy,
  Present
} from '@element-plus/icons-vue'

defineOptions({ name: 'RegisterVue' })

const { t } = useI18n()
const store:any = useAppStore()
const router = useRouter()
const route = useRoute()
const regiFrmRefs = ref()

const captchaImg = ref('')
const isSubmitting = ref(false)

// 更新货币选项
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

const currencyIndex = ref<number>(0)

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
    console.log('PC端邀请码参数检测:', {
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
      console.log('PC端检测到新的邀请码:', newInviteCode)
    }
  },
  { deep: true }
)

// 表单验证规则
const rules = computed(() => ({
  name: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('login.usernameLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('login.passwordLength'), trigger: 'blur' }
  ],
  password_confirmation: [
    { required: true, message: t('register.inputConfirmPassword'), trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== frm.value.password) {
          callback(new Error(t('mine.newPwdDiff')))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ],
  realname: [
    {
      required: (store.registerConf?.register_setting_json?.isRealNameRequred ?? 0) === '1',
      message: t('register.inputRealname'),
      trigger: 'blur'
    }
  ],
  qk_pwd: [
    { required: true, message: t('register.inputQkpwd'), trigger: 'blur' },
    { min: 6, message: t('mine.passwordTooShort'), trigger: 'blur' }
  ],
  phone: [
    {
      required: (store.registerConf?.register_setting_json?.isPhoneRequired ?? 0) === '1',
      message: t('register.inputPhone'),
      trigger: 'blur'
    }
  ],
  currency: [
    { required: true, message: t('register.inputCurrency'), trigger: 'change' }
  ],
  captcha: [
    {
      required: (store.registerConf?.register_setting_json?.isCaptchaRequired ?? 0) === '1',
      message: t('login.captchaRequired'),
      trigger: 'blur'
    },
    { length: 4, message: t('login.captchaLength'), trigger: 'blur' }
  ]
}))

// 货币选择变化
function onCurrencyChange(index: number) {
  frm.value.currency = columns.value[index].text
  frm.value.lang = columns.value[index].value
}

// 提交注册
async function submitRegisterHandler() {
  try {
    const valid = await regiFrmRefs.value?.validate()
    if (!valid) return

    if (isSubmitting.value) return

    isSubmitting.value = true

    frm.value.lang = columns.value[currencyIndex.value].value

    const registerData = {
      ...frm.value,
      invitation_code: frm.value.invite_code,
      currency: columns.value[currencyIndex.value].code,
    }

    const resp:any = await api.register(registerData)

    if (resp && resp.code === 200) {
      if (resp.token) {
        store.setToken(resp.token)
        await store.getMeForApi()
      }

      ElMessage.success(resp.message || t('login.loginSuccess'))
      router.replace({ name: 'main' })
    } else {
      ElMessage.error(resp?.message || t('login.loginFailed'))
    }
  } catch (err: any) {
    console.error('注册错误:', err)
    ElMessage.error(err?.message || err?.error?.message || t('login.loginError'))
  } finally {
    isSubmitting.value = false
  }
}

// 刷新验证码
async function refreshCaptcha() {
  try {
    if ((store.registerConf?.register_setting_json?.isCaptchaRequired ?? 0) !== '1') {
      return
    }
    const resp:any = await api.authCaptcha()
    if (resp && resp.code === 200 && resp.data) {
      captchaImg.value = resp.data?.img ?? ''
      frm.value.key = resp.data?.key
    }
  } catch (err) {
    console.log('获取验证码失败:', err)
    ElMessage.error(t('login.captchaError'))
  }
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
.pc-register {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;

  .pc-register-container {
    display: flex;
    max-width: 1200px;
    width: 100%;
    background: #fff;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

    .pc-register-box {
      flex: 1;
      padding: 60px;
      max-width: 600px;

      .pc-register-header {
        text-align: center;
        margin-bottom: 40px;

        h1 {
          margin: 0 0 10px 0;
          color: #303133;
          font-size: 32px;
          font-weight: 700;
        }

        p {
          margin: 0;
          color: #909399;
          font-size: 16px;
        }
      }

      .pc-register-form {
        :deep(.el-form-item) {
          margin-bottom: 24px;

          .el-form-item__label {
            font-size: 14px;
            font-weight: 600;
            color: #606266;
            margin-bottom: 8px;
          }

          .el-form-item__error {
            font-size: 12px;
            padding-top: 2px;
          }
        }

        :deep(.el-input__wrapper) {
          height: 44px;
        }

        :deep(.el-select) {
          width: 100%;
        }

        .pc-captcha-container {
          display: flex;
          gap: 12px;

          .pc-captcha-input {
            flex: 1;
          }

          .pc-captcha-img {
            width: 140px;
            height: 44px;
            border: 1px solid #dcdfe6;
            border-radius: 4px;
            cursor: pointer;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            background: #f5f7fa;

            &:hover {
              border-color: #667eea;
              box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }

            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }

            .pc-captcha-placeholder {
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 4px;
              color: #909399;
              font-size: 12px;
              user-select: none;
            }
          }
        }

        .pc-submit-item {
          margin-top: 40px;
          margin-bottom: 20px;

          .pc-submit-btn {
            width: 100%;
            height: 50px;
            font-size: 18px;
            font-weight: 600;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            letter-spacing: 2px;
            transition: all 0.3s;

            &:hover:not(:disabled) {
              opacity: 0.9;
              transform: translateY(-1px);
              box-shadow: 0 4px 20px rgba(102, 126, 234, 0.3);
            }

            &:disabled {
              opacity: 0.6;
              cursor: not-allowed;
            }
          }
        }

        .pc-register-footer {
          text-align: center;
          color: #909399;
          font-size: 14px;

          .el-link {
            margin-left: 8px;
            font-weight: 600;
            font-size: 14px;
          }
        }
      }
    }

    .pc-register-side {
      flex: 1;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 60px;

      .pc-side-content {
        color: #fff;
        text-align: center;
        max-width: 400px;

        h2 {
          font-size: 36px;
          margin-bottom: 20px;
          font-weight: 700;
        }

        p {
          font-size: 18px;
          margin-bottom: 50px;
          opacity: 0.9;
          line-height: 1.6;
        }

        .pc-features {
          display: flex;
          flex-direction: column;
          gap: 30px;

          .pc-feature-item {
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(255, 255, 255, 0.1);
            padding: 20px 30px;
            border-radius: 12px;
            backdrop-filter: blur(10px);
            transition: all 0.3s;
            text-align: left;

            &:hover {
              background: rgba(255, 255, 255, 0.2);
              transform: translateX(10px);
            }

            span {
              font-size: 16px;
              font-weight: 500;
            }
          }
        }
      }
    }
  }
}
</style>
