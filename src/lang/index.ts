import { createI18n } from 'vue-i18n'
import type { I18n, I18nOptions } from 'vue-i18n'

// Element Plus 语言包
import zhCnEle from 'element-plus/es/locale/lang/zh-cn'
import zhTwEle from 'element-plus/es/locale/lang/zh-tw'
import enEle from 'element-plus/es/locale/lang/en'
import koEle from 'element-plus/es/locale/lang/ko'
import viEle from 'element-plus/es/locale/lang/vi'
// Element Plus 暂无官方泰语包，使用英语作为后备
import thEle from 'element-plus/es/locale/lang/en'

// 自定义语言包
import enUsLocale from './en_US.json'
import zhCnLocale from './zh-CN.json'
import zhTwLocale from './zh-TW.json'
import thThLocale from './th_TH.json'
import viVnLocale from './vi_VN.json'
import koKrLocale from './ko-KR.json'

// 支持的语言类型
export type Language = 'zh-CN' | 'zh-TW' | 'en-US' | 'th-TH' | 'vi-VN' | 'ko-KR'

// 语言映射表
const LANGUAGE_MAP = {
  frontend: {
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'en-US': 'en-US',
    'th-TH': 'th-TH',
    'vi-VN': 'vi-VN',
    'ko-KR': 'ko-KR'
  },
  backend: {
    'zh-CN': 'zh_cn',
    'zh-TW': 'zh_hk',
    'en-US': 'en',
    'th-TH': 'th',
    'vi-VN': 'vi',
    'ko-KR': 'ko'
  }
} as const

// 合并语言包
const messages = {
  'zh-CN': {
    ...zhCnLocale,
    el: zhCnEle
  },
  'zh-TW': {
    ...zhTwLocale,
    el: zhTwEle
  },
  'en-US': {
    ...enUsLocale,
    el: enEle
  },
  'th-TH': {
    ...thThLocale,
    el: thEle
  },
  'vi-VN': {
    ...viVnLocale,
    el: viEle
  },
  'ko-KR': {
    ...koKrLocale,
    el: koEle
  }
}

// 默认语言
const DEFAULT_LANGUAGE: Language = 'zh-CN'

// 语言存储键名
const STORAGE_KEY = 'app-language'

/**
 * 获取当前语言设置
 * 优先级：localStorage > 浏览器语言 > 默认语言
 */
export function getLanguage(): Language {
  // 从 localStorage 获取
  const storedLang = localStorage.getItem(STORAGE_KEY) as Language
  if (storedLang && messages[storedLang]) {
    return storedLang
  }

  // 获取浏览器语言
  const browserLang = navigator.language || (navigator as any).userLanguage

  // 精确匹配
  if (messages[browserLang as Language]) {
    return browserLang as Language
  }

  // 模糊匹配（如 zh 匹配 zh-CN）
  const shortLang = browserLang.split('-')[0]
  for (const lang in messages) {
    if (lang.toLowerCase().startsWith(shortLang.toLowerCase())) {
      return lang as Language
    }
  }

  // 返回默认语言
  return DEFAULT_LANGUAGE
}

/**
 * 获取后端对应的语言代码
 */
export function getServerLanguage(): string {
  const lang = getLanguage()
  return LANGUAGE_MAP.backend[lang] || 'en'
}

/**
 * 设置语言
 * @param lang 语言代码
 */
export function setLanguage(lang: Language): void {
  if (!messages[lang]) {
    console.warn(`Language '${lang}' is not supported, falling back to ${DEFAULT_LANGUAGE}`)
    lang = DEFAULT_LANGUAGE
  }

  // 设置 i18n 语言
  i18n.global.locale.value = lang

  // 保存到 localStorage
  localStorage.setItem(STORAGE_KEY, lang)

  // 设置 HTML lang 属性
  document.documentElement.setAttribute('lang', lang)

  // 触发自定义事件，其他组件可以监听语言变化
  window.dispatchEvent(new CustomEvent('language-change', { detail: { language: lang } }))
}

/**
 * 获取所有支持的语言列表
 */
export function getSupportedLanguages(): Array<{ value: Language; label: string }> {
  return [
    { value: 'zh-CN', label: '简体中文' },
    { value: 'zh-TW', label: '繁體中文' },
    { value: 'en-US', label: 'English' },
    { value: 'th-TH', label: 'ภาษาไทย' },
    { value: 'vi-VN', label: 'Tiếng Việt' },
    { value: 'ko-KR', label: '한국어' }
  ]
}

/**
 * 获取 Element Plus 的语言配置
 * 用于 ElConfigProvider
 */
export function getElementLocale() {
  const lang = getLanguage()
  const localeMap = {
    'zh-CN': zhCnEle,
    'zh-TW': zhTwEle,
    'en-US': enEle,
    'th-TH': thEle, // 使用英语作为后备
    'vi-VN': viEle,
    'ko-KR': koEle
  }
  return localeMap[lang] || zhCnEle
}

// 创建 i18n 实例
const i18nOptions: I18nOptions = {
  legacy: false, // 使用 Composition API 模式
  globalInjection: true, // 全局注入 $t
  locale: getLanguage(),
  fallbackLocale: DEFAULT_LANGUAGE,
  messages,
  // 禁用警告（生产环境）
  silentTranslationWarn: import.meta.env.PROD,
  silentFallbackWarn: import.meta.env.PROD,
  // 数字格式化
  numberFormats: {
    'zh-CN': {
      currency: {
        style: 'currency',
        currency: 'CNY',
        notation: 'standard'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        useGrouping: false
      }
    },
    'en-US': {
      currency: {
        style: 'currency',
        currency: 'USD',
        notation: 'standard'
      },
      decimal: {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      },
      percent: {
        style: 'percent',
        useGrouping: false
      }
    }
  },
  // 日期时间格式化
  datetimeFormats: {
    'zh-CN': {
      short: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      long: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }
    },
    'en-US': {
      short: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      long: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }
    }
  }
}

const i18n: I18n = createI18n(i18nOptions)

// 初始化设置 HTML lang 属性
document.documentElement.setAttribute('lang', getLanguage())

export default i18n

// 导出 t 函数供非组件使用
export const { t } = i18n.global
