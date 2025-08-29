<template>
  <div class="p-header">
    <div class="p-header-wrapper">
      <div class="p-header-bar">
        <div class="p-bar-wrapper">
          <!-- 语言切换下拉菜单 -->
          <el-dropdown
            trigger="click"
            @visible-change="visibleChange"
            @command="selectLanguage"
          >
            <template #default>
              <div class="p-dropdown-default">
                <div :class="'p-lang p-' + currLang.lang"></div>
                <span class="p-lang-label">{{ currLang.label }}</span>
                <el-icon
                  class="el-icon--right"
                  :class="{ arrow: langIsVisible }"
                >
                  <CaretBottom />
                </el-icon>
              </div>
            </template>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="(item, idx) in langList"
                  :key="idx"
                  :command="item"
                >
                  <template #default>
                    <div class="p-dd-item">
                      <el-image
                        :src="item.icon"
                        fit="fill"
                        class="p-lang-icon"
                      />
                      <span class="p-lang-txt">{{ item.label }}</span>
                    </div>
                  </template>
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <!-- 右侧按钮区域 -->
          <div class="p-header-right">
            <!-- 未登录状态 -->
            <template v-if="!store.isLogin()">
              <el-button type="primary" class="p-btn-login" @click="showLoginDialog">
                {{ $t('login.login') }}
              </el-button>
              <el-button type="success" class="p-btn-register" @click="goToRegister">
                {{ $t('user.register') }}
              </el-button>
            </template>

            <!-- 已登录状态 -->
            <template v-else>
              <div class="p-user-logged">
                <span class="p-username" @click="goToPersonalCenter">
                  <el-icon style="margin-right: 5px;"><User /></el-icon>
                  {{ store.getUser()?.nick_name || store.getUser()?.name || '' }}
                </span>
                <span class="p-balance">
                  <el-icon style="margin-right: 5px;"><Wallet /></el-icon>
                  ¥{{ Number(store.getUser()?.money || 0).toFixed(2) }}
                </span>
                <el-button type="danger" size="small" class="p-btn-logout" @click="handleLogout">
                  <el-icon style="margin-right: 5px;"><SwitchButton /></el-icon>
                  {{ $t('user.logout') }}
                </el-button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 登录弹窗 -->
    <el-dialog
      v-model="loginDialogVisible"
      :title="$t('login.loginTitle')"
      width="420px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
      class="login-dialog"
      @close="handleLoginDialogClose"
    >
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-position="top"
        class="login-form"
      >
        <el-form-item :label="$t('login.username')" prop="username">
          <el-input
            v-model="loginForm.username"
            :placeholder="$t('login.enterUsername')"
            size="large"
            clearable
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><User /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item :label="$t('login.password')" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="$t('login.enterPassword')"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          >
            <template #prefix>
              <el-icon><Lock /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 验证码（如果需要） -->
        <el-form-item
          v-if="showCaptcha"
          :label="$t('login.captcha')"
          prop="captcha"
        >
          <div class="captcha-wrapper">
            <el-input
              v-model="loginForm.captcha"
              :placeholder="$t('login.enterCaptcha')"
              size="large"
              clearable
              @keyup.enter="handleLogin"
            >
              <template #prefix>
                <el-icon><Key /></el-icon>
              </template>
            </el-input>
            <el-image
              :src="captchaUrl"
              class="captcha-img"
              @click="refreshCaptcha"
              fit="fill"
            >
              <template #error>
                <div class="captcha-error">
                  {{ $t('login.clickRefresh') }}
                </div>
              </template>
            </el-image>
          </div>
        </el-form-item>

        <el-form-item>
          <div class="login-options">
            <el-checkbox v-model="loginForm.remember">
              {{ $t('login.rememberMe') }}
            </el-checkbox>
            <el-link type="primary" :underline="false" @click="goToForgotPassword">
              {{ $t('login.forgetPwd') }}
            </el-link>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loginLoading"
            @click="handleLogin"
            class="login-btn"
          >
            {{ loginLoading ? $t('login.loggingIn') : $t('login.login') }}
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <span>{{ $t('login.noAccount') }}</span>
          <el-link type="primary" @click="goToRegisterFromLogin">
            {{ $t('login.registerNow') }}
          </el-link>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import {
  CaretBottom,
  User,
  Lock,
  Key,
  Wallet,
  SwitchButton
} from '@element-plus/icons-vue'
import { getLanguage, setLanguage } from '@/lang'
import zhCnImg from '@/assets/mobile/lang/zh_cn.png'
import zhTwImg from '@/assets/mobile/lang/zh_tw.png'
import enUsImg from '@/assets/mobile/lang/en_us.png'
import thThImg from '@/assets/mobile/lang/th_th.png'
import viVnImg from '@/assets/mobile/lang/vi_vn.png'
import koKrImg from '@/assets/mobile/lang/ko_kr.png'
import { getDomain, invokeApi } from '@/utils/tools'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

defineOptions({ name: 'PcCommonHeader' })

const router = useRouter()
const store = useAppStore()
const { t } = useI18n()
const langIsVisible = ref(false)
const currLang = ref()

// 登录相关
const loginDialogVisible = ref(false)
const loginFormRef = ref<FormInstance>()
const loginLoading = ref(false)
const showCaptcha = ref(false)
const captchaUrl = ref('')
const captchaData = ref<{ key: string } | null>(null)

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

// 登录表单验证规则
const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('login.usernameLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('login.passwordLength'), trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: t('login.captchaRequired'), trigger: 'blur' },
    { len: 4, message: t('login.captchaLength'), trigger: 'blur' }
  ]
})

// 语言列表
const langList = ref<
  {
    icon: string
    lang: 'en-US' | 'zh-CN' | 'zh-TW' | 'th-TH' | 'vi-VN' | 'ko-KR'
    label: string
  }[]
>([
  { icon: zhCnImg, lang: 'zh-CN', label: '中文' },
  { icon: zhTwImg, lang: 'zh-TW', label: '繁體中文' },
  { icon: enUsImg, lang: 'en-US', label: 'English' },
  { icon: thThImg, lang: 'th-TH', label: 'ภาษาไทย' },
  { icon: viVnImg, lang: 'vi-VN', label: 'ViệtName' },
  { icon: koKrImg, lang: 'ko-KR', label: '한국어' }
])

// 语言切换可见性
function visibleChange(b: boolean) {
  langIsVisible.value = b
}

// 选择语言
function selectLanguage(lang: {
  icon: string
  lang: 'en-US' | 'zh-CN' | 'zh-TW' | 'th-TH' | 'vi-VN' | 'ko-KR'
  label: string
}) {
  setLanguage(lang.lang)
  currLang.value = lang
  location.reload()
}

// 显示登录弹窗
function showLoginDialog() {
  loginDialogVisible.value = true
  resetLoginForm()

  // 恢复记住的登录信息
  const rememberData = localStorage.getItem('rememberMe')
  if (rememberData) {
    try {
      const userData = JSON.parse(rememberData)
      loginForm.username = userData?.name || ''
      loginForm.password = userData?.password || ''
      loginForm.remember = true
    } catch (error) {
      console.error('恢复登录信息失败:', error)
      localStorage.removeItem('rememberMe')
    }
  }

  // 获取验证码
  getCaptcha()
}

// 重置登录表单
function resetLoginForm() {
  loginForm.username = ''
  loginForm.password = ''
  loginForm.captcha = ''
  loginForm.remember = false
  captchaData.value = null
  showCaptcha.value = false
  loginFormRef.value?.resetFields()
}

// 处理登录
async function handleLogin() {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loginLoading.value = true
      store.loading()

      try {
        // 调用登录API
        const resp = await invokeApi('login', {
          name: loginForm.username,
          password: loginForm.password,
          key: captchaData.value?.key ?? '',
          captcha: showCaptcha.value ? loginForm.captcha : ''
        })

        if (resp && resp.code === 200) {
          const { access_token, user_info } = resp.data || {}

          if (!access_token) {
            ElMessage.error('登录失败：未获取到访问令牌')
            return
          }

          // 设置 token
          store.setToken(access_token)

          // 设置用户信息
          if (user_info) {
            store.setUser(user_info)
          }

          // 保存记住我选项
          if (loginForm.remember) {
            localStorage.setItem(
              'rememberMe',
              JSON.stringify({
                name: loginForm.username,
                password: loginForm.password
              })
            )
          } else {
            localStorage.removeItem('rememberMe')
          }

          // 显示登录成功消息
          ElMessage.success(t('login.loginSuccess'))

          // 关闭登录弹窗
          loginDialogVisible.value = false

        } else {
          // 登录失败
          const errorMessage = resp?.data || resp?.message || t('login.loginFailed')
          ElMessage.error(errorMessage)

          // 如果是验证码错误，刷新验证码
          if (errorMessage.includes('验证码')) {
            await getCaptcha()
          }
        }
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error(t('login.loginError'))
      } finally {
        store.stopLoad()
        loginLoading.value = false
      }
    }
  })
}

// 获取验证码
async function getCaptcha() {
  try {
    const resp = await invokeApi('authCaptcha')
    if (resp && resp.code === 200 && resp.data) {
      captchaData.value = { key: resp.data }
      captchaUrl.value = `/api/captcha/image?key=${resp.data}&t=${Date.now()}`
    }
  } catch (error) {
    console.error('Get captcha error:', error)
  }
}

// 刷新验证码
function refreshCaptcha() {
  getCaptcha()
}

// 关闭登录弹窗
function handleLoginDialogClose() {
  resetLoginForm()
}

// 跳转到注册页面
function goToRegister() {
  router.push('/register')
}

// 从登录弹窗跳转到注册
function goToRegisterFromLogin() {
  loginDialogVisible.value = false
  router.push('/register')
}

// 跳转到忘记密码
function goToForgotPassword() {
  loginDialogVisible.value = false
  router.push('/forgot-password')
}

// 处理退出登录
async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      t('login.confirmLogout'),
      t('common.tip'),
      {
        confirmButtonText: t('common.confirm'),
        cancelButtonText: t('common.cancel'),
        type: 'warning'
      }
    )

    store.loading()

    // 调用退出登录API
    try {
      const resp = await invokeApi('logout')

      if (resp && resp.code === 200) {
        store.logout()
        store.stopLoad()
        ElMessage.success(resp.message || t('login.logoutSuccess'))

        // 跳转到首页
        setTimeout(() => {
          window.location.href = '/'
        }, 500)
      }
    } catch (error) {
      console.error('Logout API error:', error)
      // 即使API失败也清除本地数据
      store.logout()
      store.stopLoad()
      ElMessage.success(t('login.logoutSuccess'))
      setTimeout(() => {
        window.location.href = '/'
      }, 500)
    }
  } catch (error) {
    // 用户取消退出
    store.stopLoad()
  }
}

// 跳转到个人中心
function goToPersonalCenter() {
  if (!store.isLogin()) {
    ElMessage.warning('请先登录')
    showLoginDialog()
    return
  }
  router.push('/mine')
}

// 获取系统配置
async function getSysConfig() {
  if (store.systemConf) {
    return
  }
  const resp = await invokeApi('sysConfig', {
    group: 'system',
    url: getDomain(),
  })
  if (resp) {
    store.$patch({ systemConf: resp.data })
  }
}

// 初始化语言
const initLang = () => {
  let curr: {
    icon: string
    lang: 'en-US' | 'zh-CN' | 'zh-TW' | 'th-TH' | 'vi-VN' | 'ko-KR'
    label: string
  } | null = null
  const lang = getLanguage()

  langList.value.forEach(item => {
    if (lang === item.lang) {
      curr = item
    }
  })

  if (!curr) {
    curr = langList.value[0]
  }
  return curr
}

currLang.value = initLang()

onMounted(async () => {
  await getSysConfig()

  // 如果已登录，获取最新用户信息
  if (store.isLogin()) {
    await store.getMeForApi()
  }
})
</script>

<style lang="less" scoped>
.p-dd-item {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 10px;

  .p-lang-icon {
    width: 26px;
    height: 26px;
  }
  .p-lang-txt {
    flex: 1;
  }
}

.p-header {
  display: flex;
  flex-direction: column;
  height: 60px; // 大幅减少高度

  &-wrapper {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 10;
    justify-content: center;
    align-items: center;
    height: 60px; // 对应减少高度
    position: relative;

    .p-lang-label {
      text-align: left;
      color: var(--el-color-white);
      font-weight: 700;
    }
  }

  &-bar {
    height: 60px; // 增加高度以适应精简布局
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    background: var(--herder-top);
    z-index: 100;

    .p-bar-wrapper {
      max-width: var(--web-max-width);
      min-width: var(--web-min-width);
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0 20px; // 增加左右间距

      .p-dropdown-default {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        background: rgba(2, 40, 108, 0.08);
        border-radius: 20px;
        padding-right: 10px;

        .el-icon--right {
          color: var(--el-color-white);
          transition: transform 500ms ease-in-out;
        }
        .arrow {
          transform: rotate(180deg);
        }
      }

      .p-header-right {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-end;
        gap: 20px;

        // 已登录用户信息样式
        .p-user-logged {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 8px 20px; // 增加内边距
          background: rgba(255, 255, 255, 0.1);
          border-radius: 25px; // 增加圆角

          .p-username {
            color: #fff;
            font-weight: 500;
            font-size: 14px;
            display: flex;
            align-items: center;
            cursor: pointer;
            transition: opacity 0.3s;

            &:hover {
              opacity: 0.8;
            }
          }

          .p-balance {
            color: #ffd700;
            font-weight: bold;
            font-size: 14px;
            display: flex;
            align-items: center;
          }

          .p-btn-logout {
            height: 32px; // 增加按钮高度
            padding: 0 16px;
            border-radius: 16px;
            display: flex;
            align-items: center;
          }
        }

        .p-btn-login,
        .p-btn-register {
          padding: 0 20px; // 增加按钮宽度
          min-width: 90px;
          height: 36px; // 增加按钮高度
          cursor: pointer;
          border-radius: 18px;
          color: #fff;
          line-height: 36px;
          text-align: center;
          font-size: 14px;
          box-sizing: border-box;
          box-shadow: 0 2px 4px rgba(6, 39, 121, 0.2);
          border-width: 0px;
          font-weight: 500;
        }

        .p-btn-login {
          background: var(--home-top-btn);
        }

        .p-btn-register {
          background: #67c23a;
        }
      }
    }
  }

  // 语言图标样式
  .p-lang {
    width: 26px;
    height: 26px;
    background: url('@/assets/web/icon-lang.png') no-repeat;
    background-size: 26px 182px;
    margin-right: 6px;
  }
  .p-en-US {
    background-position: 0 -26px;
  }
  .p-zh-CN {
    background-position: 0 0;
  }
  .p-zh-TW {
    background-position: 0 0;
    background: url('@/assets/mobile/lang/zh_tw.png') no-repeat;
    background-size: 100% 100%;
  }
  .p-th-TH {
    background-position: 0 -52px;
  }
  .p-vi-VN {
    background-position: 0 -78px;
  }
  .p-ko-KR {
    background-position: 0 -156px;
  }
}

// 登录弹窗样式
.login-dialog {
  :deep(.el-dialog__header) {
    text-align: center;
    padding: 20px 20px 10px;
    border-bottom: 1px solid #e4e7ed;
  }

  :deep(.el-dialog__body) {
    padding: 20px;
  }

  .login-form {
    .captcha-wrapper {
      display: flex;
      gap: 10px;

      .el-input {
        flex: 1;
      }

      .captcha-img {
        width: 120px;
        height: 40px;
        cursor: pointer;
        border: 1px solid #dcdfe6;
        border-radius: 4px;

        &:hover {
          border-color: #409eff;
        }
      }

      .captcha-error {
        width: 120px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f7fa;
        color: #909399;
        font-size: 12px;
        cursor: pointer;
      }
    }

    .login-options {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .login-btn {
      width: 100%;
    }

    .login-footer {
      text-align: center;
      color: #909399;
      font-size: 14px;

      .el-link {
        margin-left: 5px;
      }
    }
  }
}
</style>
