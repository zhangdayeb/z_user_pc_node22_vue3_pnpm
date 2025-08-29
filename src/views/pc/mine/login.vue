<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>{{ $t('user.login') }}</h2>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="User"
            :placeholder="$t('user.enterUsername')"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            prefix-icon="Lock"
            :placeholder="$t('user.enterPassword')"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="captcha" v-if="captchaUrl">
          <div class="captcha-wrapper">
            <el-input
              v-model="loginForm.captcha"
              :placeholder="$t('user.enterCaptcha')"
              size="large"
              clearable
              @keyup.enter="handleLogin"
            />
            <img
              :src="captchaUrl"
              :alt="$t('user.captcha')"
              class="captcha-img"
              @click="getCaptcha"
              :title="$t('user.clickToRefresh')"
            />
          </div>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            class="login-btn"
          >
            {{ loading ? $t('user.loggingIn') : $t('user.login') }}
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <router-link to="/register" class="link">{{ $t('user.registerNow') }}</router-link>
          <span class="divider">|</span>
          <a href="#" class="link" @click.prevent="handleForgotPassword">{{ $t('user.forgotPassword') }}</a>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, FormInstance } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/stores/app'
import api from '@/api'

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const appStore = useAppStore()

// 表单ref
const loginFormRef = ref<FormInstance>()

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

// 验证规则 - 使用computed来实现响应式多语言
const rules = computed(() => ({
  username: [
    { required: true, message: t('user.usernameRequired'), trigger: 'blur' },
    { min: 3, max: 20, message: t('user.usernameLength'), trigger: 'blur' }
  ],
  password: [
    { required: true, message: t('user.passwordRequired'), trigger: 'blur' },
    { min: 6, max: 20, message: t('user.passwordLength'), trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: t('user.captchaRequired'), trigger: 'blur' }
  ]
}))

// 状态
const loading = ref(false)
const captchaUrl = ref('')
const captchaKey = ref('')

// 获取验证码
const getCaptcha = async () => {
  try {
    const res: any = await api.authCaptcha()
    if (res?.code === 200 || res?.code === 1 || res?.code === 0) {
      captchaUrl.value = res.data.img
      captchaKey.value = res.data.key
    }
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

// 登录
const handleLogin = async () => {
  if (!loginFormRef.value) return

  await loginFormRef.value.validate(async (valid: any) => {
    if (!valid) return

    loading.value = true
    appStore.loading(t('user.loggingIn'))

    try {
      // 使用移动端验证过的参数格式
      const params: any = {
        name: loginForm.username,    // 注意：使用 'name' 而不是 'username'
        password: loginForm.password
      }

      // 如果有验证码
      if (captchaKey.value) {
        params.captcha = loginForm.captcha
        params.key = captchaKey.value
      }

      const res: any = await api.login(params)

      if (res?.code === 200 || res?.code === 1 || res?.code === 0) {
        // 使用移动端验证过的数据结构处理
        const { access_token, user_info } = res.data || {}

        if (!access_token) {
          ElMessage.error('登录失败：未获取到访问令牌')
          return
        }

        // 使用 Store 方法设置 token - 关键修改点
        appStore.setToken(access_token)
        console.log('Token 设置成功:', access_token)

        // 使用 Store 方法设置用户信息 - 关键修改点
        if (user_info) {
          // 转换用户信息格式以匹配 store 期望的格式
          const userForStore: any = {
            id: user_info.id,
            name: user_info.name,
            nick_name: user_info.nick_name,
            money: user_info.money,
            money_rebate: user_info.money_rebate || 0,
            level: user_info.vip_grade, // 将 vip_grade 映射为 level
            vip_grade: user_info.vip_grade || 0,
            status: user_info.status || 1,
            created_at: user_info.created_at || '',
            updated_at: user_info.updated_at || ''
          }

          appStore.setUser(userForStore)
          console.log('用户信息设置成功:', userForStore)
        }

        ElMessage.success(t('user.loginSuccess'))

        // 跳转到原本要访问的页面或首页
        const redirect = route.query.redirect as string
        router.push(redirect || '/')
      } else {
        // 登录失败，刷新验证码
        ElMessage.error(res?.message || '登录失败')
        if (captchaUrl.value) {
          getCaptcha()
          loginForm.captcha = ''
        }
      }
    } catch (error: any) {
      console.error('登录过程中发生错误:', error)
      ElMessage.error(error?.message || '登录过程中发生错误')

      // 登录失败，刷新验证码
      if (captchaUrl.value) {
        getCaptcha()
        loginForm.captcha = ''
      }
    } finally {
      loading.value = false
      appStore.stopLoad()
    }
  })
}

// 忘记密码
const handleForgotPassword = () => {
  ElMessage.info(t('user.contactSupport'))
}

// 初始化
onMounted(() => {
  // 获取验证码（根据需要可以注释掉）
  // getCaptcha()
})
</script>

<style scoped lang="less">
.login-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

  .login-box {
    width: 400px;
    padding: 40px;
    background: #fff;
    border-radius: 10px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

    .login-header {
      text-align: center;
      margin-bottom: 30px;

      h2 {
        font-size: 24px;
        color: #333;
        margin: 0;
      }
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
        }
      }

      .login-btn {
        width: 100%;
      }

      .login-footer {
        text-align: center;
        margin-top: 20px;

        .link {
          color: #409eff;
          text-decoration: none;
          font-size: 14px;

          &:hover {
            color: #66b1ff;
          }
        }

        .divider {
          margin: 0 10px;
          color: #999;
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .login-container {
    .login-box {
      width: 90%;
      padding: 30px 20px;
    }
  }
}
</style>
