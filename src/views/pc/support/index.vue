<template>
  <div class="pc-support">
    <div class="pc-header">
      <el-image
        src="/src/assets/mobile/avatar.png"
        fit="contain"
        class="pc-avatar"
      />
      <div class="pc-header-right">
        <h2 class="pc-title">Hi,</h2>
        <span class="pc-sub-title">{{ $t('support.welcome') }}</span>
      </div>
    </div>

    <div class="pc-content">
      <!-- 动态配置项列表 -->
      <div v-if="configList.length > 0" class="pc-config-list">
        <div
          v-for="(config, index) in configList"
          :key="index"
          class="pc-config-item"
          @click="openConfigUrl(config)"
        >
          <div class="pc-item-content">
            <div class="pc-item-title">{{ getConfigName(config) }}</div>
            <div class="pc-item-subtitle">{{ config.value }}</div>
            <div class="pc-item-label">
              <span>{{ $t('clickToOpen') }}</span>
              <el-icon class="pc-arrow-icon"><ArrowRight /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else-if="loading" class="pc-loading">
        <el-icon class="is-loading" :size="40">
          <Loading />
        </el-icon>
        <p class="loading-text">{{ $t('loading') }}</p>
      </div>

      <!-- 无配置项 -->
      <div v-else class="pc-empty">
        <el-empty :description="$t('support.noServiceConfig')" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowRight, Loading } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { invokeApi } from '@/utils/tools'

defineOptions({ name: 'PcSupport' })

// 配置项类型定义
interface ConfigItem {
  name: string
  value: string
  remark?: string
  name_i18n?: { [key: string]: string }
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
    name_i18n?: string
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
    ElMessage.warning(t('support.linkNotConfigured', { name: getConfigName(config) }))
    return
  }

  console.log('打开配置链接:', config.name, '->', config.value)

  try {
    window.open(config.value, '_blank')
  } catch (error) {
    console.error('打开链接失败:', error)
    ElMessage.error(t('support.openLinkFailed', { name: getConfigName(config) }))
  }
}

// 获取配置数据
async function getConfigList() {
  loading.value = true

  try {
    console.log('开始获取配置数据...')

    const resp = await invokeApi('gameConfig')

    console.log('配置响应:', resp)

    if (resp && resp.code === 200 && resp.data) {
      const configData = resp.data as GameConfigResponse
      const tempList: ConfigItem[] = []

      // 方式1：从 configs 对象中获取
      if (configData.configs) {
        Object.entries(configData.configs).forEach(([name, value]) => {
          if (value && value.trim().length > 0) {
            let nameI18n = undefined
            try {
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
    ElMessage.error(t('support.configLoadFailed'))
  } finally {
    loading.value = false
  }
}

// 监听语言变化
watch(locale, () => {
  // 语言变化时不需要重新加载配置，因为名称会自动更新
})

// 组件挂载时获取配置
onMounted(async () => {
  await getConfigList()
})
</script>

<style lang="less" scoped>
.pc-support {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;

  .pc-header {
    max-width: 1200px;
    margin: 0 auto 40px;
    display: flex;
    align-items: center;
    gap: 30px;
    padding: 40px;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

    .pc-avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      overflow: hidden;
    }

    .pc-header-right {
      flex: 1;

      .pc-title {
        margin: 0 0 10px 0;
        color: #333;
        font-weight: 700;
        font-size: 32px;
      }

      .pc-sub-title {
        color: #666;
        font-size: 18px;
      }
    }
  }

  .pc-content {
    max-width: 1200px;
    margin: 0 auto;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 16px;
    padding: 40px;
    min-height: 400px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);

    .pc-config-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 20px;

      .pc-config-item {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 24px;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.2);

        &:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .pc-item-content {
          color: #fff;

          .pc-item-title {
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 10px;
          }

          .pc-item-subtitle {
            font-size: 14px;
            opacity: 0.9;
            margin-bottom: 15px;
            word-break: break-all;
            line-height: 1.5;
          }

          .pc-item-label {
            font-size: 14px;
            opacity: 0.85;
            display: flex;
            align-items: center;
            gap: 5px;

            .pc-arrow-icon {
              font-size: 16px;
            }
          }
        }
      }
    }

    .pc-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
      color: #666;

      .loading-text {
        margin-top: 20px;
        font-size: 16px;
      }
    }

    .pc-empty {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 80px 20px;
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .pc-support {
    padding: 20px 15px;

    .pc-header {
      flex-direction: column;
      text-align: center;
      padding: 30px 20px;

      .pc-header-right {
        text-align: center;

        .pc-title {
          font-size: 24px;
        }

        .pc-sub-title {
          font-size: 16px;
        }
      }
    }

    .pc-content {
      padding: 20px;

      .pc-config-list {
        grid-template-columns: 1fr;
        gap: 15px;

        .pc-config-item {
          padding: 20px;

          .pc-item-content {
            .pc-item-title {
              font-size: 18px;
            }
          }
        }
      }
    }
  }
}
</style>
