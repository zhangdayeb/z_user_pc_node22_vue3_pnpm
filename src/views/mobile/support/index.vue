<template>
  <div class="m-support">
    <div class="m-header">
      <van-image
        src="/src/assets/mobile/avatar.png"
        fit="contain"
        class="m-avatar"
      ></van-image>
      <div class="m-header-right">
        <h5 class="m-title">Hi,</h5>
        <span class="m-sub-title">{{ $t('support.welcome') }}</span>
      </div>
    </div>

    <div class="m-kf">
      <!-- 动态配置项列表 -->
      <div v-if="configList.length > 0" class="m-config-list">
        <van-cell
          v-for="(config, index) in configList"
          :key="index"
          :is-link="true"
          class="m-cell"
          @click="openConfigUrl(config)"
        >
          <template #title>
            <div class="m-col">
              <div class="m-title">{{ getConfigName(config) }}</div>
              <div class="m-subtitle">{{ config.value }}</div>
              <div class="m-label">
                <span>{{ $t('clickToOpen') }}</span>
              </div>
            </div>
          </template>
        </van-cell>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="m-loading">
        <van-loading type="spinner" size="24px" />
        <p class="loading-text">{{ $t('loading') }}</p>
      </div>

      <!-- 无配置项 -->
      <div v-else class="m-empty">
        <van-empty :description="$t('support.noServiceConfig')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { showToast } from 'vant'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import api from '@/api'

defineOptions({ name: 'SupportIndex' })

// 配置项类型定义
interface ConfigItem {
  name: string
  value: string
  remark?: string
  name_i18n?: { [key: string]: string } // 多语言名称
}

// 游戏配置响应类型
interface GameConfigResponse {
  configs?: {
    [key: string]: string
  }
  raw_configs?: Array<{
    id: number
    group_prefix: string
    name: string
    value: string
    remark: string
    name_i18n?: string // JSON格式的多语言名称
  }>
}

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()

// 响应式数据
const configList = ref<ConfigItem[]>([])
const loading = ref(false)

// 获取配置项的多语言名称
function getConfigName(config: ConfigItem): string {
  const currentLang = locale.value

  // 1. 优先使用配置项自带的多语言名称
  if (config.name_i18n && config.name_i18n[currentLang]) {
    return config.name_i18n[currentLang]
  }

  // 2. 尝试使用i18n翻译
  // 根据配置名称查找对应的翻译key
  const i18nKeyMap: { [key: string]: string } = {
    '客服地址': 'customerService',
    '财务地址': 'financeAddress',
    '热线电话': 'hotline',
    '在线客服': 'support.onlineService',
    'VIP客服': 'support.vipService',
    '代理合作': 'support.agentCooperation',
    '投诉建议': 'support.complaints',
    'Telegram': 'support.telegram',
    'WhatsApp': 'support.whatsapp',
    '主线客服': 'support.mainCustom',
    '客户服务代表': 'support.agentCoustom'
  }

  const i18nKey = i18nKeyMap[config.name]
  if (i18nKey) {
    const translated = t(i18nKey)
    // 如果翻译成功（不等于key本身），返回翻译
    if (translated !== i18nKey) {
      return translated
    }
  }

  // 3. 返回原始名称
  return config.name
}

// 打开配置链接
function openConfigUrl(config: ConfigItem) {
  if (!config.value || config.value.length === 0) {
    showToast(t('support.linkNotConfigured', { name: getConfigName(config) }))
    return
  }

  console.log('打开配置链接:', config.name, '->', config.value)

  try {
    // 统一使用 window.open 在新窗口打开
    window.open(config.value, '_blank')
  } catch (error) {
    console.error('打开链接失败:', error)
    showToast(t('support.openLinkFailed', { name: getConfigName(config) }))
  }
}

// 获取配置数据
async function getConfigList() {
  loading.value = true

  try {
    console.log('开始获取配置数据...')

    // 获取语言参数（已经在拦截器中处理）
    const resp = await api.gameConfig()

    console.log('配置响应:', resp)

    if (resp && resp.code === 200 && resp.data) {
      const configData = resp.data as GameConfigResponse
      const tempList: ConfigItem[] = []

      // 方式1：从 configs 对象中获取（推荐，格式化后的数据）
      if (configData.configs) {
        Object.entries(configData.configs).forEach(([name, value]) => {
          if (value && value.trim().length > 0) {
            // 解析多语言名称（如果存在）
            let nameI18n = undefined
            try {
              // 尝试从raw_configs中找到对应的多语言信息
              const rawConfig = configData.raw_configs?.find(item => item.name === name)
              if (rawConfig?.name_i18n) {
                nameI18n = JSON.parse(rawConfig.name_i18n)
              }
            } catch (e) {
              // 忽略解析错误
            }

            tempList.push({
              name: name,
              value: value.trim(),
              name_i18n: nameI18n
            })
          }
        })
        console.log('从 configs 获取到配置项:', tempList.length)
      }

      // 方式2：如果 configs 为空，从 raw_configs 获取
      if (tempList.length === 0 && configData.raw_configs) {
        configData.raw_configs.forEach(item => {
          if (item.value && item.value.trim().length > 0) {
            let nameI18n = undefined
            try {
              if (item.name_i18n) {
                nameI18n = JSON.parse(item.name_i18n)
              }
            } catch (e) {
              // 忽略解析错误
            }

            tempList.push({
              name: item.name,
              value: item.value.trim(),
              remark: item.remark,
              name_i18n: nameI18n
            })
          }
        })
        console.log('从 raw_configs 获取到配置项:', tempList.length)
      }

      // 更新配置列表
      configList.value = tempList

      if (tempList.length === 0) {
        console.warn('没有找到有效的配置项')
      } else {
        console.log('配置加载成功，共', tempList.length, '项:', tempList)
      }

    } else {
      throw new Error(resp?.message || '获取配置失败')
    }
  } catch (error) {
    console.error('获取配置出错:', error)
    showToast(t('support.configLoadFailed'))
  } finally {
    loading.value = false
  }
}

// 监听语言变化，重新加载配置
watch(locale, () => {
  // 语言变化时不需要重新加载配置，因为名称会自动更新
  // 如果需要重新加载，可以取消注释下面的代码
  // getConfigList()
})

// 组件挂载时获取配置
onMounted(async () => {
  await getConfigList()
})
</script>

<style lang="less" scoped>
.m-support {
  display: flex;
  flex-direction: column;
  height: calc(100% - 50px);

  .m-header {
    padding: 40px 34px 86px 34px;
    background-image: url('../../../assets/mobile/support_user_bg.png');
    background-repeat: no-repeat;
    background-size: 100% 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    gap: 15px;

    .m-avatar {
      width: 50px;
      height: 50px;
    }

    .m-header-right {
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      gap: 10px;

      .m-title {
        margin: 0px;
        color: #333;
        font-weight: 700;
        font-size: 16px;
        line-height: 22px;
      }

      .m-sub-title {
        color: #95a2b4;
        font-size: 12px;
        line-height: 17px;
      }
    }
  }

  .m-kf {
    /* 使用CSS Grid布局 - 方案3的实现 */
    display: grid;
    grid-template-rows: 1fr auto;
    gap: 10px;
    height: 70vh;

    /* 基础样式保持不变 */
    margin: -59px 16px 20px 16px;
    padding: 20px 20px 30px 20px;
    background-image: url('../../../assets/mobile/kf_bg.png');
    background-repeat: no-repeat;
    background-size: 120% 100%;
    background-position: center;

    /* 关键修改：确保内容不会超出背景 */
    max-height: calc(100vh - 300px); /* 限制最大高度，防止超出视口 */
    overflow: hidden; /* 防止内容溢出 */

    .m-config-list {
      /* Grid第一行：配置列表区域 */
      grid-row: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;

      /* 关键：当内容过多时启用滚动 */
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;

      /* 确保滚动条样式 */
      &::-webkit-scrollbar {
        width: 4px;
      }
      &::-webkit-scrollbar-track {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }
      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.3);
        border-radius: 2px;
      }
    }

    .m-cell {
      padding: 0px;
      margin-bottom: 6px;
      /* 确保单元格不会变形 */
      flex-shrink: 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .m-col {
      display: grid;
      grid-template-rows: auto auto auto;
      gap: 4px;
      min-height: 50px;
      padding: 8px 0;

      /* 确保文本不会溢出 */
      overflow: hidden;
      align-content: start;

      .m-title {
        /* Grid第一行：标题 */
        grid-row: 1;
        font-size: 16px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #fff;
      }

      .m-subtitle {
        /* Grid第二行：副标题 */
        grid-row: 2;
        font-size: 11px;
        opacity: 0.7;
        word-break: break-all;
        /* 限制副标题行数 */
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
        color: #fff;
      }

      .m-label {
        /* Grid第三行：标签 */
        grid-row: 3;
        font-size: 11px;
        opacity: 0.8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        color: #fff;
      }
    }

    /* 加载状态样式 */
    .m-loading {
      /* Grid占满所有行 */
      grid-row: 1 / -1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #fff;

      .loading-text {
        margin-top: 12px;
        font-size: 14px;
        opacity: 0.8;
      }
    }

    /* 空状态样式 */
    .m-empty {
      /* Grid占满所有行 */
      grid-row: 1 / -1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 20px;
      color: #fff;
    }
  }
}

/* 响应式调整 */
@media screen and (max-height: 600px) {
  .m-support .m-kf {
    max-height: calc(100vh - 250px);
    min-height: 200px;
  }
}

@media screen and (min-height: 800px) {
  .m-support .m-kf {
    max-height: calc(100vh - 350px);
    min-height: 400px;
  }
}
</style>

<style lang="less">
.m-support {
  .van-cell {
    background-color: transparent;
    color: #fff;
    align-items: flex-start; /* 改为顶部对齐，确保内容布局正确 */

    .van-cell__title {
      /* 确保标题区域正确填充 */
      flex: 1;
      overflow: hidden;
    }

    .van-cell__right-icon {
      color: #fff;
      font-size: 22px;
      /* 确保箭头图标不会影响布局 */
      flex-shrink: 0;
      margin-left: 10px;
    }
  }

  .van-empty {
    .van-empty__description {
      color: #fff;
      opacity: 0.8;
    }
  }

  .van-loading {
    .van-loading__spinner {
      color: #fff;
    }
  }
}
</style>
