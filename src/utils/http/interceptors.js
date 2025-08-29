import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { ElMessage, ElNotification } from 'element-plus'
import { getServerLanguage } from '@/lang/index'
import { resolveResError } from './errorHandler'
import { useConfigStore } from '@/stores/config'

// 成功状态码
const SUCCESS_CODES = [0, 200]

// 扩展 AxiosRequestConfig 类型
interface CustomAxiosConfig extends AxiosRequestConfig {
  noNeedTip?: boolean      // 不需要错误提示
  noNeedToken?: boolean    // 不需要token
  showLoading?: boolean    // 显示loading
  retryCount?: number      // 重试次数
  retryDelay?: number      // 重试延迟
}

// API响应类型
interface ApiResponse<T = any> {
  code: number
  data: T
  message?: string
  timestamp?: number
}

/**
 * 设置 Axios 拦截器
 */
export function setupInterceptors(axiosInstance: AxiosInstance): void {
  // ==================== 请求拦截器 ====================

  /**
   * 请求成功拦截
   */
  function requestResolve(config: CustomAxiosConfig): CustomAxiosConfig {
    // 1. 添加语言参数
    const lang = getServerLanguage()
    config.params = {
      ...config.params,
      lang
    }

    // 2. 添加 Token (除非明确指定不需要)
    if (!config.noNeedToken) {
      const accessToken = localStorage.getItem('access_token')
      if (accessToken) {
        config.headers = config.headers || {}
        config.headers.Authorization = `Bearer ${accessToken}`
      }
    }

    // 3. 添加 group-prefix
    try {
      const configStore = useConfigStore()
      const groupPrefix = configStore.groupPrefix

      if (groupPrefix) {
        config.headers = config.headers || {}
        config.headers['group-prefix'] = groupPrefix
      }
    } catch (error) {
      // Store 未初始化时跳过
      console.debug('ConfigStore not initialized, skipping group-prefix')
    }

    // 4. 添加请求时间戳（用于计算请求耗时）
    config.metadata = { startTime: Date.now() }

    // 5. 打印请求日志（开发环境）
    if (import.meta.env.DEV) {
      console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
        params: config.params,
        data: config.data
      })
    }

    return config
  }

  /**
   * 请求失败拦截
   */
  function requestReject(error: AxiosError): Promise<AxiosError> {
    console.error('请求拦截器错误:', error)
    ElMessage.error('请求配置错误')
    return Promise.reject(error)
  }

  // ==================== 响应拦截器 ====================

  /**
   * 响应成功拦截
   */
  function responseResolve(response: AxiosResponse<ApiResponse>): Promise<ApiResponse | AxiosResponse> {
    const { data, status, config, headers } = response
    const customConfig = config as CustomAxiosConfig

    // 计算请求耗时（开发环境）
    if (import.meta.env.DEV && config.metadata?.startTime) {
      const duration = Date.now() - config.metadata.startTime
      console.log(`✅ [${config.method?.toUpperCase()}] ${config.url} (${duration}ms)`, data)
    }

    // 处理文件下载等非JSON响应
    if (!headers['content-type']?.includes('json')) {
      return Promise.resolve(response)
    }

    // 处理JSON响应
    if (SUCCESS_CODES.includes(data?.code)) {
      return Promise.resolve(data)
    }

    // 处理业务错误
    const code = data?.code ?? status
    const message = resolveResError(code, data?.message)

    // 显示错误提示（除非明确指定不需要）
    if (!customConfig.noNeedTip && message) {
      showErrorNotification(message, code)
    }

    return Promise.reject({
      code,
      message,
      data: data ?? response
    })
  }

  /**
   * 响应失败拦截
   */
  async function responseReject(error: AxiosError<ApiResponse>): Promise<any> {
    const { response, config, message } = error
    const customConfig = config as CustomAxiosConfig

    // 计算请求耗时（开发环境）
    if (import.meta.env.DEV && config?.metadata?.startTime) {
      const duration = Date.now() - config.metadata.startTime
      console.error(`❌ [${config.method?.toUpperCase()}] ${config.url} (${duration}ms)`, error)
    }

    // 处理没有响应的情况（网络错误等）
    if (!response) {
      const errorMessage = handleNoResponse(error)

      // 尝试重试
      if (customConfig && shouldRetry(customConfig)) {
        return retryRequest(axiosInstance, customConfig)
      }

      if (!customConfig?.noNeedTip) {
        showErrorNotification(errorMessage, 'NETWORK_ERROR')
      }

      return Promise.reject({
        code: 'NETWORK_ERROR',
        message: errorMessage,
        error
      })
    }

    // 处理有响应的错误
    const { data, status } = response
    const code = data?.code ?? status
    const errorMessage = await resolveResError(code, data?.message ?? message)

    // 显示错误提示
    if (!customConfig?.noNeedTip && errorMessage) {
      showErrorNotification(errorMessage as string, code)
    }

    return Promise.reject({
      code,
      message: errorMessage,
      data: data || response
    })
  }

  // 注册拦截器
  axiosInstance.interceptors.request.use(requestResolve, requestReject)
  axiosInstance.interceptors.response.use(responseResolve, responseReject)
}

// ==================== 辅助函数 ====================

/**
 * 处理无响应的错误
 */
function handleNoResponse(error: AxiosError): string {
  if (!navigator.onLine) {
    return '网络连接已断开，请检查网络设置'
  }

  if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
    return '请求超时，请稍后重试'
  }

  if (error.message?.includes('Network')) {
    return '网络异常，请检查网络连接'
  }

  return '网络请求失败，请稍后重试'
}

/**
 * 显示错误通知
 */
function showErrorNotification(message: string, code?: string | number): void {
  // 对于401等特殊错误，使用消息提示
  if (code === 401 || code === 11007 || code === 11008) {
    ElMessage.error({
      message,
      duration: 3000,
      showClose: true
    })
    return
  }

  // 其他错误使用通知
  ElNotification({
    title: '请求错误',
    message,
    type: 'error',
    duration: 4000,
    position: 'top-right'
  })
}

/**
 * 判断是否应该重试
 */
function shouldRetry(config: CustomAxiosConfig): boolean {
  const retryCount = config.retryCount ?? 0

  // 只对GET请求和幂等的请求重试
  const isRetryableMethod = ['GET', 'HEAD', 'OPTIONS'].includes(config.method?.toUpperCase() || '')

  return retryCount < 3 && isRetryableMethod
}

/**
 * 重试请求
 */
async function retryRequest(
  axiosInstance: AxiosInstance,
  config: CustomAxiosConfig
): Promise<any> {
  const retryCount = config.retryCount ?? 0
  const retryDelay = config.retryDelay ?? 1000

  config.retryCount = retryCount + 1

  // 延迟重试
  await new Promise(resolve => setTimeout(resolve, retryDelay * (retryCount + 1)))

  console.log(`🔄 重试请求 [${config.retryCount}/3]: ${config.url}`)

  return axiosInstance(config)
}

/**
 * 创建带拦截器的 Axios 实例
 */
export function createAxiosInstance(baseURL?: string): AxiosInstance {
  const instance = axios.create({
    baseURL: baseURL || import.meta.env.VITE_API_BASE_URL,
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  setupInterceptors(instance)

  return instance
}
