import api from '@/api'
import { useAppStore } from '@/stores/app'
import { ElMessage } from 'element-plus'
import type { AxiosResponse } from 'axios'

const domain = location.origin

// ==================== 图片和域名相关 ====================

/**
 * 获取图片完整URL
 */
export function getImgUrl(url: string): string {
  if (!url || url.trim().length <= 0) {
    return ''
  }

  // 如果已经是完整URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('//')) {
    return url
  }

  // 如果是相对路径，拼接域名
  return `${domain}${url.startsWith('/') ? '' : '/'}${url}`
}

/**
 * 获取当前域名
 */
export function getDomain(): string {
  return domain
}

// ==================== API 调用相关 ====================

/**
 * 统一的API调用方法
 * @param method API方法名
 * @param data 请求数据
 * @param id 可选的ID参数
 * @param isLoad 是否显示加载状态
 */
export async function invokeApi(
  method: string,
  data: object = {},
  id: string | number = '',
  isLoad: boolean = true,
): Promise<AxiosResponse<any> | null> {
  const store = useAppStore()

  if (isLoad) {
    store.loading()
  }

  try {
    let resp: AxiosResponse<any> | null = null

    // 检查方法是否存在
    if (typeof (api as any)[method] === 'function') {
      // 根据是否有ID参数调用不同的方法签名
      if (id !== '') {
        resp = await (api as any)[method](id, data)
      } else {
        resp = await (api as any)[method](data)
      }
    } else {
      console.error(`API方法 ${method} 不存在`)
      if (isLoad) {
        store.stopLoad()
      }
      ElMessage.error('系统错误：接口不存在')
      return null
    }

    // 处理响应
    if (resp && resp.data?.code === 200) {
      if (isLoad) {
        store.stopLoad()
      }
      return resp
    } else {
      if (isLoad) {
        store.stopLoad()
      }

      // 显示错误消息
      const msg = resp?.data?.message || '操作失败'
      ElMessage.error(msg)
      return resp
    }
  } catch (err) {
    console.error('API调用错误:', err)
    if (isLoad) {
      store.stopLoad()
    }

    // 根据错误类型显示不同的消息
    if (err instanceof Error) {
      if (err.message.includes('Network')) {
        ElMessage.error('网络连接失败，请检查网络设置')
      } else if (err.message.includes('timeout')) {
        ElMessage.error('请求超时，请稍后重试')
      } else {
        ElMessage.error('系统错误，请稍后重试')
      }
    } else {
      ElMessage.error('未知错误')
    }

    return null
  }
}

// ==================== 语言转换功能 ====================

/**
 * 前端语言代码到后端语言代码的映射
 */
const FRONTEND_TO_BACKEND_LANG_MAP: Record<string, string> = {
  'zh-CN': 'zh',
  'zh-TW': 'hk',
  'en-US': 'en',
  'th-TH': 'th',
  'vi-VN': 'vi',
  'ko-KR': 'ko',
}

/**
 * 后端语言代码到前端语言代码的映射
 */
const BACKEND_TO_FRONTEND_LANG_MAP: Record<string, string> = {
  'zh': 'zh-CN',
  'hk': 'zh-TW',
  'en': 'en-US',
  'th': 'th-TH',
  'vi': 'vi-VN',
  'ko': 'ko-KR',
}

/**
 * 转换前端语言代码为后端语言代码
 */
export function convertFrontendToBackendLang(frontendLang: string): string {
  const backendLang = FRONTEND_TO_BACKEND_LANG_MAP[frontendLang]
  if (backendLang) {
    return backendLang
  }

  // 支持的后端语言代码列表
  const supportedBackendLangs = [
    'de', 'en', 'es', 'fr', 'hi', 'hk', 'id',
    'it', 'ja', 'ko', 'my', 'pt', 'ru', 'th',
    'tl', 'tr', 'vi', 'zh'
  ]

  if (supportedBackendLangs.includes(frontendLang)) {
    return frontendLang
  }

  // 默认返回英文
  return 'en'
}

/**
 * 转换后端语言代码为前端语言代码
 */
export function convertBackendToFrontendLang(backendLang: string): string {
  const frontendLang = BACKEND_TO_FRONTEND_LANG_MAP[backendLang]
  if (frontendLang) {
    return frontendLang
  }

  // 默认返回英文
  return 'en-US'
}

// ==================== 实用工具函数 ====================

/**
 * 格式化金额显示
 * @param amount 金额
 * @param currency 货币符号
 * @param decimals 小数位数
 */
export function formatMoney(
  amount: number | string,
  currency: string = '¥',
  decimals: number = 2
): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return `${currency}0.00`

  return `${currency}${num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

/**
 * 格式化日期时间
 * @param date 日期
 * @param format 格式
 */
export function formatDateTime(
  date: Date | string | number,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 防抖函数
 * @param func 要防抖的函数
 * @param wait 等待时间
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      func.apply(context, args)
    }, wait)
  }
}

/**
 * 节流函数
 * @param func 要节流的函数
 * @param limit 时间限制
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function (this: any, ...args: Parameters<T>) {
    const context = this

    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  if (obj instanceof Array) {
    const clonedArr: any[] = []
    for (const item of obj) {
      clonedArr.push(deepClone(item))
    }
    return clonedArr as any
  }

  if (obj instanceof Object) {
    const clonedObj: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key])
      }
    }
    return clonedObj
  }

  return obj
}

/**
 * 获取URL参数
 * @param name 参数名
 */
export function getUrlParam(name: string): string | null {
  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(name)
}

/**
 * 设置页面标题
 * @param title 标题
 */
export function setPageTitle(title: string): void {
  document.title = title ? `${title} - 个人中心` : '个人中心'
}

/**
 * 校验邮箱格式
 * @param email 邮箱地址
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 校验手机号格式（中国大陆）
 * @param phone 手机号
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

/**
 * 生成随机字符串
 * @param length 长度
 */
export function generateRandomString(length: number = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
