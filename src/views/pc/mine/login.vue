<template>
  <div class="login-container">
    <div class="login-box">
      <div class="login-header">
        <h2>用户登录</h2>
      </div>

      <el-form ref="loginFormRef" :model="loginForm" :rules="rules" class="login-form">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="User"
            placeholder="请输入用户名"
            size="large"
            clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            prefix-icon="Lock"
            placeholder="请输入密码"
            size="large"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>

        <el-form-item prop="captcha" v-if="captchaUrl">
          <div class="captcha-wrapper">
            <el-input
              v-model="loginForm.captcha"
              placeholder="请输入验证码"
              size="large"
              clearable
              @keyup.enter="handleLogin"
            />
            <img
              :src="captchaUrl"
              alt="验证码"
              class="captcha-img"
              @click="getCaptcha"
              title="点击刷新"
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
            {{ loading ? '登录中...' : '登录' }}
          </el-button>
        </el-form-item>

        <div class="login-footer">
          <router-link to="/register" class="link">立即注册</router-link>
          <span class="divider">|</span>
          <a href="#" class="link" @click.prevent="handleForgotPassword">忘记密码？</a>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, FormInstance } from 'element-plus'
import api from '@/api'

const router = useRouter()
const route = useRoute()

// 表单ref
const loginFormRef = ref<FormInstance>()

// 登录表单
const loginForm = reactive({
  username: '',
  password: '',
  captcha: ''
})

// 验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' }
  ]
}

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
    try {
      const params: any = {
        username: loginForm.username,
        password: loginForm.password
      }

      // 如果有验证码
      if (captchaKey.value) {
        params.captcha = loginForm.captcha
        params.key = captchaKey.value
      }

      const res: any = await api.login(params)

      if (res?.code === 200 || res?.code === 1 || res?.code === 0) {
        // 保存token
        localStorage.setItem('access_token', res.data.token)

        // 保存用户信息
        if (res.data.user) {
          localStorage.setItem('userInfo', JSON.stringify(res.data.user))
        }

        ElMessage.success('登录成功')

        // 跳转到原本要访问的页面或首页
        const redirect = route.query.redirect as string
        router.push(redirect || '/')
      } else {
        // 登录失败，刷新验证码
        getCaptcha()
        loginForm.captcha = ''
      }
    } catch (error) {
      // 登录失败，刷新验证码
      getCaptcha()
      loginForm.captcha = ''
    } finally {
      loading.value = false
    }
  })
}

// 忘记密码
const handleForgotPassword = () => {
  ElMessage.info('请联系客服重置密码')
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
