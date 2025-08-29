import api from '@/api'
import { useAppStore } from '@/stores/app'
import { showToast } from 'vant'
import type { AxiosResponse } from 'axios'

const domain = location.origin

// ==================== 设备检测功能 ====================

export function mobileFunc(): boolean {
  // return false
  const urlParams = new URLSearchParams(window.location.search)

  // 1. URL 参数强制设置（最高优先级）
  if (urlParams.get('is_mobile') === '1') {
    return true
  }

  if (urlParams.get('pc') === '1') {
    return false
  }

  // 2. Telegram Web App 检测（第二优先级）
  const tgUserData = getTelegramUserData();
  if (tgUserData?.tg_id) {
    console.log('✅ Telegram 环境检测到，使用移动端模板')
    return true
  }

  // 3. 简化的设备检测
  const userAgent = navigator.userAgent

  // 明确的移动设备检测（移除 Telegram，因为已经在上面单独处理）
  const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile/i
  const isMobileDevice = mobileRegex.test(userAgent)

  // 如果明确检测到移动设备，直接返回 true
  if (isMobileDevice) {
    return true
  }

  // 屏幕尺寸检测
  const isSmallScreen = window.innerWidth < 768

  // 检测触摸设备
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

  // PC端检测：如果不是移动设备且屏幕足够大，就是PC端
  const isLargeScreen = window.innerWidth >= 768
  if (!isMobileDevice && isLargeScreen) {
    return false
  }

  // 只有在小屏幕+触摸设备的情况下才判断为移动端
  console.log('🔍 设备检测结果:', {
    isMobileDevice,
    isSmallScreen,
    isTouchDevice,
    isLargeScreen,
  })
  return isSmallScreen && isTouchDevice
}

// ==================== 图片和域名相关 ====================

export function getImgUrl(url: string): string {
  if (url.trim().length <= 0) {
    return ''
  }
  return url
}

export function getDomain(): string {
  return domain
}


// ==================== API 调用相关 ====================

export async function invokeApi(
  method: string,
  d: object = {},
  id: string | number = '',
  isLoad: boolean = true,
): Promise<AxiosResponse<any> | null> {
  const store = useAppStore()
  if (isLoad) {
    store.loading()
  }

  try {
    let resp: AxiosResponse<any> | null = null

    if (typeof (api as any)[method] === 'function') {
      if (id !== '') {
        resp = await (api as any)[method](id, d)
      } else {
        resp = await (api as any)[method](d)
      }
    } else {
      if (isLoad) {
        store.stopLoad()
      }
      return null
    }

    if (resp && (resp.data as any)?.code === 200) {
      if (isLoad) {
        store.stopLoad()
      }
      return resp
    } else {
      if (resp) {
        if (isLoad) {
          store.stopLoad()
        }
        const msg = (resp.data as any)?.message ?? ''
        if (msg.length > 0) {
          showToast(msg)
        }
      }
      if (isLoad) {
        store.stopLoad()
      }
      return resp
    }
  } catch (err) {
    console.error('❌ invokeApi 错误:', err)
    if (isLoad) {
      store.stopLoad()
    }
    showToast('网络请求失败')
  }
  return null
}

// ==================== 语言转换功能 ====================

const FRONTEND_TO_BACKEND_LANG_MAP: Record<string, string> = {
  'zh-CN': 'zh',
  'zh-TW': 'hk',
  'en-US': 'en',
  'th-TH': 'th',
  'vi-VN': 'vi',
  'ko-KR': 'ko',
}

export function convertFrontendToBackendLang(frontendLang: string): string {
  const backendLang = FRONTEND_TO_BACKEND_LANG_MAP[frontendLang]
  if (backendLang) {
    return backendLang
  }

  const supportedBackendLangs = ['de', 'en', 'es', 'fr', 'hi', 'hk', 'id', 'it', 'ja', 'ko', 'my', 'pt', 'ru', 'th', 'tl', 'tr', 'vi', 'zh']
  if (supportedBackendLangs.includes(frontendLang)) {
    return frontendLang
  }

  return 'en'
}

// ==================== Telegram Mini App 功能 ====================

/**
 * 简化的 Telegram 用户数据获取 - 优先使用 URL fragment 方案
 */
export function getTelegramUserData() {
  try {
    console.log('🔄 获取 Telegram 用户数据...');
    console.log('🔍 当前完整URL:', window.location.href);


    // 方法1: 标准 Telegram WebApp API (官方推荐)
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const tg = (window as any).Telegram.WebApp;

      // 确保 WebApp 已初始化
      if (typeof tg.ready === 'function') {
        tg.ready();
      }

      console.log('🔍 Telegram WebApp 检测成功');

      // 方式 A: 从 initDataUnsafe 获取 (推荐)
      if (tg.initDataUnsafe?.user?.id) {
        const tg_id = tg.initDataUnsafe.user.id.toString();
        console.log('📱 从 initDataUnsafe 获取 tg_id:', tg_id);
        return { tg_id };
      }

      // 方式 B: 解析 initData 字符串
      if (tg.initData) {
        try {
          const params = new URLSearchParams(tg.initData);
          const userStr = params.get('user');
          if (userStr) {
            const user = JSON.parse(userStr);
            if (user.id) {
              const tg_id = user.id.toString();
              console.log('📱 从 initData 解析 tg_id:', tg_id);
              return { tg_id };
            }
          }
        } catch (parseError) {
          console.error('❌ 解析 initData 失败:', parseError);
        }
      }

      console.log('❌ Telegram WebApp 存在但无用户数据');
      return null;
    }

  } catch (error) {
    console.error('❌ 获取 Telegram 用户数据出错:', error);
    return null;
  }
}

/**
 * Telegram 自动登录 - 使用简化的数据获取方式
 */
export async function handleTelegramAutoLogin(): Promise<boolean> {
  try {
    console.log('🔄 开始 Telegram 自动登录...');

    const store = useAppStore();

    // 检查是否已登录
    if (store.getUser() && store.getToken()) {
      console.log('✅ 用户已登录');
      return true;
    }

    // 获取 tg_id
    const tgUserData = getTelegramUserData();
    if (!tgUserData?.tg_id) {
      console.log('❌ 无法获取 tg_id');
      return false;
    }

    console.log('📱 准备登录，tg_id:', tgUserData.tg_id);

    // 调用登录接口
    const response = await api.tglogin({ tg_id: tgUserData.tg_id });

    if (response?.code === 200) {
      const loginData = response.data;

      // 保存 token
      store.setToken(loginData.access_token);
      console.log('✅ Token 已保存');

      const user_info = loginData.user_info;
      console.log('✅ 用户信息:', user_info);

      store.setUser(user_info);
      showToast('自动登录成功');
      console.log('✅ Telegram 自动登录成功!');

      return true;
    } else {
      console.log('❌ 登录失败:', response);
      return false;
    }
  } catch (error) {
    console.error('❌ 自动登录出错:', error);
    return false;
  }
}
