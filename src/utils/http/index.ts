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

    // 2. 添加 Token
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // 3. 添加 group-prefix
    const groupPrefix = localStorage.getItem('group_prefix')
    if (groupPrefix && config.headers) {
      config.headers['group-prefix'] = groupPrefix
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
    // 网络错误或其他错误
    ElMessage.error('服务器错误，请稍后重试')
    return Promise.reject(error)
  }
)

export default request
