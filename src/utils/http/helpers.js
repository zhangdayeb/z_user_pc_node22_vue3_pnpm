import { ElMessage, ElMessageBox } from 'element-plus'
import { useAppStore } from '@/stores/app'
import router from '@/router'

// 错误代码映射
const ERROR_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '请求被拒绝，权限不足',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时'
}

// 特殊错误代码
const SPECIAL_ERROR_CODES = {
  TOKEN_EXPIRED: 401,
  SESSION_EXPIRED: 11007,
  ACCOUNT_ELSEWHERE: 11008,
  USER_NOT_FOUND: 10001,
  PERMISSION_DENIED: 403
}

// 防止重复处理标志
let isProcessing = false

/**
 * 登出处理
 */
function handleLogout(showMessage: boolean = true): void {
  const store = useAppStore()
  store.logout(showMessage)

  // 跳转到首页或登录页
  if (router.currentRoute.value.name !== 'login') {
    router.push('/')
  }
}

/**
 * 显示错误消息
 */
function showErrorMessage(message: string, duration: number = 3000): void {
  ElMessage.error({
    message,
    duration,
    showClose: true,
    grouping: true
  })
}

/**
 * 显示成功消息
 */
function showSuccessMessage(message: string): void {
  ElMessage.success({
    message,
    duration: 2000
  })
}

/**
 * 处理会话过期
 */
async function handleSessionExpired(message: string): Promise<void> {
  if (isProcessing) return

  isProcessing = true

  try {
    await ElMessageBox.confirm(
      `${message}，是否重新登录？`,
      '会话已过期',
      {
        confirmButtonText: '重新登录',
        cancelButtonText: '取消',
        type: 'warning',
        closeOnClickModal: false,
        closeOnPressEscape: false
      }
    )

    handleLogout()
    showSuccessMessage('已退出登录，请重新登录')

  } catch {
    // 用户点击取消，不做处理
  } finally {
    isProcessing = false
  }
}

/**
 * 处理特殊错误
 */
async function handleSpecialError(code: number, message: string): Promise<boolean> {
  switch (code) {
    // 401: Token过期或无效
    case SPECIAL_ERROR_CODES.TOKEN_EXPIRED:
      handleLogout(false)
      showErrorMessage('登录已过期，请重新登录')

      // 延迟跳转，让用户看到提示
      setTimeout(() => {
        router.push('/login')
      }, 1500)
      return true

    // 11007, 11008: 账号在其他地方登录
    case SPECIAL_ERROR_CODES.SESSION_EXPIRED:
    case SPECIAL_ERROR_CODES.ACCOUNT_ELSEWHERE:
      await handleSessionExpired(message || '您的账号在其他地方登录')
      return true

    // 用户不存在
    case SPECIAL_ERROR_CODES.USER_NOT_FOUND:
      localStorage.clear()
      showErrorMessage('用户信息不存在，请重新登录')
      handleLogout(false)
      return true

    default:
      return false
  }
}

/**
 * 解析响应错误
 * @param code 错误代码
 * @param message 错误消息
 * @param showMessage 是否显示错误消息
 * @returns 处理后的错误消息或false
 */
export async function resolveResError(
  code: number,
  message?: string,
  showMessage: boolean = true
): Promise<string | false> {

  // 处理特殊错误
  const isSpecialHandled = await handleSpecialError(code, message || '')
  if (isSpecialHandled) {
    return false
  }

  // 获取错误消息
  let errorMessage = message || ERROR_MESSAGES[code] || `未知错误 [${code}]`

  // 特殊处理某些错误
  switch (code) {
    case 500:
      // 服务器错误特殊处理
      if (message?.includes('用户不存在')) {
        localStorage.clear()
        handleLogout(false)
        errorMessage = '用户信息异常，请重新登录'
      }
      break

    case 403:
      // 权限不足可能需要特殊处理
      errorMessage = '您没有权限执行此操作'
      break

    case 404:
      // 资源不存在
      errorMessage = '请求的内容不存在'
      break
  }

  // 显示错误消息
  if (showMessage && errorMessage) {
    showErrorMessage(errorMessage)
  }

  return errorMessage
}

/**
 * 处理网络错误
 */
export function handleNetworkError(error: any): void {
  console.error('网络错误:', error)

  if (!navigator.onLine) {
    showErrorMessage('网络连接已断开，请检查网络设置')
    return
  }

  if (error.message?.includes('timeout')) {
    showErrorMessage('请求超时，请稍后重试')
    return
  }

  if (error.message?.includes('Network')) {
    showErrorMessage('网络异常，请检查网络连接')
    return
  }

  showErrorMessage('网络请求失败，请稍后重试')
}

/**
 * 处理业务错误
 */
export function handleBusinessError(code: number, message: string): void {
  // 业务错误通常直接显示后端返回的消息
  showErrorMessage(message || '操作失败')
}

/**
 * 统一错误处理器
 */
export async function handleError(error: any): Promise<void> {
  console.error('统一错误处理:', error)

  // 如果是响应错误
  if (error.response) {
    const { status, data } = error.response
    const message = data?.message || data?.msg || ''

    await resolveResError(status, message)
    return
  }

  // 如果是网络错误
  if (error.request) {
    handleNetworkError(error)
    return
  }

  // 其他错误
  showErrorMessage(error.message || '未知错误')
}

/**
 * 错误边界处理
 */
export function setupErrorHandler(): void {
  // 全局错误处理
  window.addEventListener('unhandledrejection', (event) => {
    console.error('未处理的Promise错误:', event.reason)

    // 防止默认的错误处理
    event.preventDefault()

    // 处理错误
    handleError(event.reason)
  })

  // Vue错误处理（在main.ts中配置）
  // app.config.errorHandler = (err, instance, info) => {
  //   console.error('Vue错误:', err, info)
  //   handleError(err)
  // }
}

/**
 * 重置错误处理状态
 */
export function resetErrorHandler(): void {
  isProcessing = false
}
