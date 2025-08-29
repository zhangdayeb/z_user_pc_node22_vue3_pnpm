import { createI18n } from 'vue-i18n'
import { Locale } from 'vant'

import enUS from 'vant/es/locale/lang/en-US'
import zhCN from 'vant/es/locale/lang/zh-CN'
import zhTW from 'vant/es/locale/lang/zh-TW'
import thTH from 'vant/es/locale/lang/th-TH'
import viVN from 'vant/es/locale/lang/vi-VN'
import koKR from 'vant/es/locale/lang/ko-KR'

import enUsLocale from './en_US.json'
import zhCnLocale from './zh-CN.json'
import zhTwLocale from './zh-TW.json'
import thThLocale from './th_TH.json'
import viVnLocale from './vi_VN.json'
import koKrLocale from './ko-KR.json'

const messages = {
  'en-US': {
    ...enUS,
    ...enUsLocale,
  },
  'zh-CN': {
    ...zhCN,
    ...zhCnLocale,
  },
  'zh-TW': {
    ...zhTW,
    ...zhTwLocale,
  },
  'th-TH': {
    ...thTH,
    ...thThLocale,
  },
  'vi-VN': {
    ...viVN,
    ...viVnLocale,
  },
  'ko-KR': {
    ...koKR,
    ...koKrLocale,
  },
}

export function getLanguage() {
  const lang = localStorage.getItem('lang')
  return lang || 'zh-CN'
}

export function getServeLanguage() {
  const lang = getLanguage()
  switch (lang) {
    case 'zh-CN':
      return 'zh_cn'
    case 'zh-TW':
      return 'zh_hk'
    case 'en-US':
      return 'en'
    case 'th-TH':
      return 'th'
    case 'vi-VN':
      return 'vi'
    case 'ko-KR':
      return 'ko'
    default:
      return 'zh_cn'
  }
}
export function setLanguage(
  lang: 'en-US' | 'zh-CN' | 'zh-TW' | 'th-TH' | 'vi-VN' | 'ko-KR',
) {
  i18n.global.locale.value = lang
  Locale.use(lang, messages[lang])
  localStorage.setItem('lang', lang)
}

const i18n = createI18n({
  legacy: false,
  globalInjection: true, // 全局模式，可以直接使用 $t
  locale: getLanguage(),
  messages,
})

Locale.use(i18n.global.locale.value, messages[i18n.global.locale.value])

export default i18n
