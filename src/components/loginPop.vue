<template>
  <el-dialog
    v-model="dialogVisible"
    :title="$t('login.login')"
    width="420px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
    class="login-dialog"
  >
    <!-- 登录表单 -->
    <el-form
      ref="loginFormRef"
      :model="loginForm"
      :rules="loginRules"
      label-width="0"
      class="login-form"
    >
      <!-- Logo -->
      <div class="login-logo">
        <img
          v-if="store.systemConf?.site_logo"
          :src="getImgUrl(store.systemConf.site_logo)"
          alt="logo"
        />
        <h2 v-else>{{ store.systemConf?.site_name || '个人中心' }}</h2>
      </div>

      <!-- 用户名 -->
      <el-form-item prop="username">
        <el-input
          v-model="loginForm.username"
          :placeholder="$t('login.inputAccount')"
          size="large"
          clearable
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 密码 -->
      <el-form-item prop="password">
        <el-input
          v-model="loginForm.password"
          type="password"
          :placeholder="$t('login.inputPwd')"
          size="large"
          show-password
          clearable
          @keyup.enter="handleLogin"
        >
          <template #prefix>
            <el-icon><Lock /></el-icon>
          </template>
        </el-input>
      </el-form-item>

      <!-- 验证码（如果需要） -->
      <el-form-item v-if="showCaptcha" prop="captcha">
        <div class="captcha-row">
          <el-input
            v-model="loginForm.captcha"
            :placeholder="$t('login.inputCaptcha')"
            size="large"
            clearable
            @keyup.enter="handleLogin"
            class="captcha-input"
          >
            <template #prefix>
              <el-icon><Key /></el-icon>
            </template>
          </el-input>
          <div class="captcha-img" @click="getCaptcha">
            <img
              v-if="captchaUrl"
              :src="captchaUrl"
              alt="captcha"
              title="点击刷新"
            />
            <el-button v-else type="primary" link>
              获取验证码
            </el-button>
          </div>
        </div>
      </el-form-item>

      <!-- 记住我 & 忘记密码 -->
      <el-form-item>
        <div class="login-options">
          <el-checkbox v-model="loginForm.remember">
            {{ $t('rememberMe') }}
          </el-checkbox>
          <el-link type="primary" @click="handleForgetPassword">
            {{ $t('login.forgetPwd') }}
          </el-link>
        </div>
      </el-form-item>

      <!-- 登录按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          size="large"
          :loading="loading"
          @click="handleLogin"
          class="login-btn"
        >
          {{ loading ? $t('login.loggingIn') : $t('login.login') }}
        </el-button>
      </el-form-item>

      <!-- 注册链接 -->
      <el-form-item>
        <div class="register-link">
          <span>{{ $t('login.noAccount') }}</span>
          <el-link type="primary" @click="handleRegister">
            {{ $t('login.registerNow') }}
          </el-link>
        </div>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Lock, Key } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { useAppStore } from '@/stores/app'
import { getImgUrl } from '@/utils/tools'
import api from '@/api'

interface LoginForm {
  username: string
  password: string
  captcha: string
  remember: boolean
}

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

defineOptions({ name: 'LoginDialog' })

const router = useRouter()
const { t } = useI18n()
const store = useAppStore()

// 表单相关
const loginFormRef = ref<FormInstance>()
const loading = ref(false)
const showCaptcha = ref(false)
const captchaUrl = ref('')
const captchaKey = ref('')

// 对话框显示状态
const dialogVisible = computed({
  get: () => props.modelValue || store.loginShow,
  set: (val) => {
    emit('update:modelValue', val)
    store.$patch({ loginShow: val })
  }
})

// 登录表单数据
const loginForm = reactive<LoginForm>({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

// 表单验证规则
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

// 获取验证码
async function getCaptcha() {
  try {
    const resp = await api.authCaptcha()
    if (resp && resp.code === 200 && resp.data) {
      captchaKey.value = resp.data.key
      captchaUrl.value = resp.data.image
      showCaptcha.value = true
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
    ElMessage.error('获取验证码失败')
  }
}

// 处理登录
async function handleLogin() {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true

    try {
      const loginData: any = {
        name: loginForm.username,
        password: loginForm.password
      }

      // 如果需要验证码
      if (showCaptcha.value) {
        loginData.key = captchaKey.value
        loginData.captcha = loginForm.captcha
      }

      const resp = await api.login(loginData)

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
          const userForStore = {
            id: user_info.id,
            name: user_info.name,
            nick_name: user_info.nick_name,
            money: user_info.money,
            level: user_info.vip_grade || user_info.level,
            vip_grade: user_info.vip_grade
          }
          store.setUser(userForStore)
        }

        // 处理记住我
        if (loginForm.remember) {
          localStorage.setItem('rememberMe', JSON.stringify({
            username: loginForm.username,
            password: loginForm.password
          }))
        } else {
          localStorage.removeItem('rememberMe')
        }

        ElMessage.success(t('login.loginSuccess'))
        dialogVisible.value = false

        // 如果在登录页面，跳转到个人中心
        if (router.currentRoute.value.name === 'login') {
          router.push('/account')
        }
      } else {
        const errorMessage = resp?.message || '登录失败'
        ElMessage.error(errorMessage)

        // 如果是验证码错误，刷新验证码
        if (errorMessage.includes('验证码')) {
          await getCaptcha()
          loginForm.captcha = ''
        }
      }
    } catch (error: any) {
      console.error('登录错误:', error)
      ElMessage.error(error.message || '登录失败，请稍后重试')

      // 登录失败后获取验证码
      if (!showCaptcha.value) {
        await getCaptcha()
      }
    } finally {
      loading.value = false
    }
  })
}

// 处理忘记密码
function handleForgetPassword() {
  ElMessageBox.alert(
    t('login.resetpwdForCustomer'),
    t('login.forgetPwd'),
    {
      confirmButtonText: t('common.confirm'),
      type: 'info'
    }
  )
}

// 处理注册
function handleRegister() {
  dialogVisible.value = false
  router.push({ name: 'register' })
}

// 处理对话框关闭
function handleClose() {
  // 清空表单
  loginFormRef.value?.resetFields()
  loginForm.captcha = ''
  captchaUrl.value = ''
  showCaptcha.value = false
}

// 监听登录显示状态
watch(() => store.loginShow, (newVal) => {
  dialogVisible.value = newVal
})

// 组件挂载时
onMounted(() => {
  // 恢复记住的登录信息
  const rememberData = localStorage.getItem('rememberMe')
  if (rememberData) {
    try {
      const data = JSON.parse(rememberData)
      loginForm.username = data.username || ''
      loginForm.password = data.password || ''
      loginForm.remember = true
    } catch (error) {
      console.error('恢复登录信息失败:', error)
      localStorage.removeItem('rememberMe')
    }
  }

  // 根据配置决定是否需要验证码
  // 可以根据实际需求调整逻辑
  // getCaptcha()
})
</script>

<style lang="less" scoped>
.login-dialog {
  :deep(.el-dialog__body) {
    padding: 10px 30px 20px;
  }
}

.login-form {
  .login-logo {
    text-align: center;
    margin-bottom: 30px;

    img {
      height: 50px;
      max-width: 200px;
      object-fit: contain;
    }

    h2 {
      margin: 0;
      color: #303133;
      font-size: 24px;
      font-weight: 500;
    }
  }

  .captcha-row {
    display: flex;
    gap: 10px;
    width: 100%;

    .captcha-input {
      flex: 1;
    }

    .captcha-img {
      width: 120px;
      height: 40px;
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &:hover {
        border-color: #409eff;
      }
    }
  }

  .login-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .login-btn {
    width: 100%;
    font-size: 16px;
    height: 40px;
  }

  .register-link {
    text-align: center;
    width: 100%;
    color: #909399;
    font-size: 14px;

    .el-link {
      margin-left: 5px;
    }
  }
}
</style>
