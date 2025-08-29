import { createI18n } from 'vue-i18n'
import zhCN from 'element-plus/es/locale/lang/zh-cn'
import zhTW from 'element-plus/es/locale/lang/zh-tw'
import enUS from 'element-plus/es/locale/lang/en'
import thTH from 'element-plus/es/locale/lang/th'
import viVN from 'element-plus/es/locale/lang/vi'
import koKR from 'element-plus/es/locale/lang/ko'

// 导入语言包文件
import zhCNLocale from './zh-CN.json'
import zhTWLocale from './zh-TW.json'
import enUSLocale from './en-US.json'
import thTHLocale from './th-TH.json'
import viVNLocale from './vi-VN.json'
import koKRLocale from './ko-KR.json'

// 语言类型
export type Language = 'zh-CN' | 'zh-TW' | 'en-US' | 'th-TH' | 'vi-VN' | 'ko-KR'

// 默认语言
const DEFAULT_LANG: Language = 'zh-CN'

// Element Plus 语言映射
const elementLocaleMap = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  'en-US': enUS,
  'th-TH': thTH,
  'vi-VN': viVN,
  'ko-KR': koKR,
}

// 消息映射
const messages = {
  'zh-CN': zhCNLocale,
  'zh-TW': zhTWLocale,
  'en-US': enUSLocale,
  'th-TH': thTHLocale,
  'vi-VN': viVNLocale,
  'ko-KR': koKRLocale,
}

// 获取语言
export function getLanguage(): Language {
  const saved = localStorage.getItem('lang') as Language
  if (saved && messages[saved]) {
    return saved
  }
  return DEFAULT_LANG
}

// 设置语言
export function setLanguage(lang: Language) {
  localStorage.setItem('lang', lang)
  i18n.global.locale.value = lang
  window.dispatchEvent(new CustomEvent('language-change', { detail: lang }))
}

// 获取 Element Plus 语言配置
export function getElementLocale() {
  const lang = getLanguage()
  return elementLocaleMap[lang] || zhCN
}

// 获取服务端语言代码
export function getServerLanguage(): string {
  const lang = getLanguage()
  const serverLangMap: Record<Language, string> = {
    'zh-CN': 'zh',
    'zh-TW': 'hk',
    'en-US': 'en',
    'th-TH': 'th',
    'vi-VN': 'vi',
    'ko-KR': 'ko',
  }
  return serverLangMap[lang] || 'zh'
}

// 创建 i18n 实例
const i18n = createI18n({
  legacy: false,
  locale: getLanguage(),
  fallbackLocale: DEFAULT_LANG,
  messages,
})

// 翻译函数快捷方式
export const t = i18n.global.t

export default i18n
