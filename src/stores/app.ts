import { defineStore } from 'pinia'
import { ref } from 'vue'
import { showLoadingToast, type ToastWrapperInstance } from 'vant'
import api from '@/api'
import i18n from '@/lang'
import type { ApiUser } from 'typings'
import { mobileFunc } from '@/utils/tools'
import { ElLoading } from 'element-plus'
import type { LoadingInstance } from 'element-plus/es/components/loading/src/loading.mjs'

export const useAppStore = defineStore('app', () => {
  const tokenName = 'access_token'
  const loginShow = ref(false)
  const systemConf = ref<unknown>(null)
  const token = ref<string | null>(null)
  const toast = ref<ToastWrapperInstance | LoadingInstance | null>(null)
  const registerConf = ref({})
  const me = ref<ApiUser | null>(null)

  function isLogin() {
    console.log('user', getUser())
    return getUser() != null
  }
  function loading() {
    if (mobileFunc()) {
      toast.value = showLoadingToast({
        message: i18n.global.t('loading'),
        duration: 0,
        overlay: true,
        forbidClick: true,
        loadingType: 'spinner',
      })
    } else {
      toast.value = ElLoading.service({
        lock: false,
        fullscreen: true,
        text: i18n.global.t('loading'),
        background: 'rgba(0, 0, 0, 0.7)',
      })
    }
  }
  function stopLoad() {
    toast.value?.close()
  }
  function getToken() {
    if (!token.value) {
      token.value = localStorage.getItem(tokenName)
    }
    return token.value
  }
  function setToken(tk: string) {
    token.value = tk
    localStorage.setItem(tokenName, tk)
  }

  function getUser(): ApiUser | null {
    if (!me.value) {
      const tmp = localStorage.getItem('current_user')
      if (tmp) {
        try {
          const p = JSON.parse(tmp)
          me.value = p
        } catch (err) {
          console.log('err', err)
        }
      }
    }
    return me.value
  }
  function setUser(u: ApiUser) {
    me.value = u
    localStorage.setItem('current_user', JSON.stringify(u))
  }
  async function getMeForApi() {
    try {
      const resp = await api.me()
      if (resp && resp.code === 200 && resp.data) {
        me.value = resp.data
        localStorage.setItem('current_user', JSON.stringify(resp.data))
      }
    } catch (err) {
      console.log('get me err', err)
    }
  }

  function logout() {
    localStorage.removeItem('access_token')
    localStorage.removeItem('current_user')
    token.value = null
    me.value = null
  }
  return {
    loginShow,
    systemConf,
    registerConf,

    loading,
    stopLoad,
    isLogin,
    getToken,
    setToken,
    getMeForApi,
    getUser,
    setUser,
    logout,
  }
})
