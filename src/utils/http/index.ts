import axios from 'axios'
import { ElMessage } from 'element-plus'

// 获取服务端语言代码
function getServerLanguage(): string {
  const lang = localStorage.getItem('lang') || 'zh-CN'
  const langMap: Record<string, string> = {
    'zh-CN': 'zh',
    'zh-TW': 'hk',
    'en-US': 'en',
    'th-TH': 'th',
    'vi-VN': 'vi',
    'ko-KR': 'ko',
  }
  return langMap[lang] || 'zh'
}

// 创建 axios 实例
const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 15000,
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 1. 添加语言参数
    config.params = {
      ...config.params,
      lang: getServerLanguage()
    }

    // 2. 添加 JWT Token（保持原有逻辑）
    const jwtToken = localStorage.getItem('access_token')
    if (jwtToken && config.headers) {
      config.headers.Authorization = `Bearer ${jwtToken}`
    }

    // 3. 新增：添加 Simple Token
    const simpleToken = localStorage.getItem('X-Token')
    if (simpleToken && config.headers) {
      config.headers['X-Token'] = simpleToken
    }

    // 4. 添加 group-prefix（保持原有逻辑）
    const groupPrefix = localStorage.getItem('group_prefix')
    if (groupPrefix && config.headers) {
      config.headers['group-prefix'] = groupPrefix
    }

    // 开发环境调试信息
    if (import.meta.env.DEV) {
      console.log('📤 请求头信息:', {
        hasJwtToken: !!jwtToken,
        hasSimpleToken: !!simpleToken,
        hasGroupPrefix: !!groupPrefix,
        jwtTokenPreview: jwtToken ? jwtToken.substring(0, 20) + '...' : null,
        simpleTokenPreview: simpleToken ? simpleToken.substring(0, 8) + '...' : null,
        groupPrefix: groupPrefix
      })
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 检查是否有JWT Token续期（保持原有逻辑）
    const newJwtToken = response.headers['authorization']
    if (newJwtToken && newJwtToken.startsWith('Bearer ')) {
      const token = newJwtToken.replace('Bearer ', '')
      localStorage.setItem('access_token', token)
      console.log('🔄 JWT Token已自动续期')
    }

    // 新增：检查是否有Simple Token续期
    const newSimpleToken = response.headers['x-token']
    if (newSimpleToken) {
      localStorage.setItem('X-Token', newSimpleToken)
      console.log('🔄 Simple Token已自动续期')
    }

    // 检查JWT Token续期标识
    const tokenExtended = response.headers['x-token-extended']
    if (tokenExtended === '1') {
      console.log('✅ JWT Token续期成功')
    }

    const { data } = response

    // 成功：code 为 200 或 1 或 0
    if (data.code === 200 || data.code === 1 || data.code === 0) {
      return data
    }

    // 失败：统一提示
    ElMessage.error(data.message || '服务器错误，请稍后重试')
    return Promise.reject(data)
  },
  (error) => {
    // 处理401未授权错误
    if (error.response?.status === 401) {
      // 清除过期的token
      localStorage.removeItem('access_token')
      localStorage.removeItem('X-Token')

      console.warn('🔐 Token已过期，已清除本地存储')
      ElMessage.error('登录已过期，请重新登录')

      // 可以在这里添加跳转到登录页的逻辑
      // router.push('/login')

      return Promise.reject(error)
    }

    // 网络错误或其他错误
    ElMessage.error('服务器错误，请稍后重试')
    return Promise.reject(error)
  }
)

export default request
