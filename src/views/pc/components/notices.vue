<template>
  <el-dialog
    v-model="dialogVisible"
    :title="currentNotice?.title || $t('systemAnnouncement')"
    width="600px"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @close="handleClose"
    class="notices-dialog"
  >
    <!-- 通知轮播 -->
    <div class="notices-container" v-if="hasNotices">
      <el-carousel
        :interval="autoPlayInterval"
        :autoplay="autoPlay"
        arrow="hover"
        indicator-position="bottom"
        height="400px"
        @change="handleCarouselChange"
      >
        <el-carousel-item
          v-for="(item, index) in notices"
          :key="index"
          class="notice-item"
        >
          <!-- 图片类型通知 -->
          <div v-if="item.type === 'img'" class="notice-image">
            <el-image
              :src="getImgUrl(item.content)"
              fit="contain"
              :lazy="true"
              @click="handleNoticeClick(item)"
            >
              <template #error>
                <div class="image-error">
                  <el-icon :size="30"><Picture /></el-icon>
                  <span>{{ $t('imageLoadFailed') }}</span>
                </div>
              </template>
            </el-image>
          </div>

          <!-- 文本类型通知 -->
          <div v-else class="notice-text">
            <div
              class="notice-content"
              v-html="sanitizeHtml(item.content)"
              @click="handleNoticeClick(item)"
            ></div>
          </div>
        </el-carousel-item>
      </el-carousel>

      <!-- 通知指示器和操作 -->
      <div class="notice-footer">
        <div class="notice-indicator">
          {{ currentIndex + 1 }} / {{ notices.length }}
        </div>

        <el-checkbox
          v-model="dontShowToday"
          @change="handleDontShowChange"
        >
          {{ $t('todayDoNotShow') }}
        </el-checkbox>
      </div>
    </div>

    <!-- 无通知时的空状态 -->
    <div v-else class="empty-state">
      <el-empty :description="$t('noAnnouncements')" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import DOMPurify from 'dompurify'
import { getImgUrl } from '@/utils/tools'
import api from '@/api'

// 类型定义
interface Notice {
  id?: string | number
  title: string
  content: string
  type: 'img' | 'txt'
  url?: string
  priority?: number
  created_at?: string
}

defineOptions({ name: 'NoticesDialog' })

const { t } = useI18n()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  autoShow: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['update:modelValue'])

// 响应式数据
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const notices = ref<Notice[]>([])
const currentIndex = ref(0)
const dontShowToday = ref(false)
const autoPlay = ref(true)
const autoPlayInterval = ref(10000)

// 常量
const STORAGE_KEY = 'dontShowNotice'
const VIEWED_NOTICES_KEY = 'viewedNotices'

// 计算属性
const hasNotices = computed(() => notices.value.length > 0)
const currentNotice = computed(() => notices.value[currentIndex.value])

/**
 * 清理HTML内容，防止XSS攻击
 */
function sanitizeHtml(html: string): string {
  if (!html) return ''

  const config = {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span', 'div', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'style', 'class'],
    ALLOW_DATA_ATTR: false,
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  }

  return DOMPurify.sanitize(html, config)
}

/**
 * 处理轮播切换
 */
function handleCarouselChange(index: number) {
  currentIndex.value = index
}

/**
 * 处理今日不再显示
 */
function handleDontShowChange(checked: boolean) {
  if (checked) {
    const endOfDay = dayjs().endOf('day').valueOf()
    localStorage.setItem(STORAGE_KEY, String(endOfDay))

    // 记录已查看的通知ID
    const viewedIds = notices.value.map(n => n.id).filter(Boolean)
    localStorage.setItem(VIEWED_NOTICES_KEY, JSON.stringify(viewedIds))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

/**
 * 检查是否应该显示弹窗
 */
function shouldShowDialog(): boolean {
  try {
    const storedTime = localStorage.getItem(STORAGE_KEY)
    if (!storedTime) return true

    const endTime = Number(storedTime)
    if (isNaN(endTime)) return true

    return Date.now() > endTime
  } catch (error) {
    console.error('检查弹窗显示状态失败:', error)
    return true
  }
}

/**
 * 检查是否有新通知
 */
function hasNewNotices(): boolean {
  try {
    const viewedIds = JSON.parse(localStorage.getItem(VIEWED_NOTICES_KEY) || '[]')
    return notices.value.some(notice => notice.id && !viewedIds.includes(notice.id))
  } catch {
    return true
  }
}

/**
 * 处理通知点击
 */
function handleNoticeClick(notice: Notice) {
  if (!notice.url) return

  try {
    const url = new URL(notice.url, window.location.origin)

    // 安全检查
    if (!['http:', 'https:'].includes(url.protocol)) {
      console.warn('不安全的URL协议:', url.protocol)
      return
    }

    // 是否在新窗口打开
    const isExternal = url.origin !== window.location.origin

    if (isExternal) {
      window.open(notice.url, '_blank', 'noopener,noreferrer')
    } else {
      // 内部链接可以使用路由跳转
      window.location.href = notice.url
    }
  } catch (error) {
    console.error('无效的URL:', notice.url, error)
    ElMessage.warning(t('invalidUrl') || '链接无效')
  }
}

/**
 * 获取通知列表
 */
async function fetchNotices() {
  try {
    const response = await api.notices({
      platform: 'pc',
      lang: localStorage.getItem('app-language') || 'zh-CN'
    })

    if (!response || response.code !== 200) {
      console.warn('获取通知失败:', response?.message)
      return
    }

    const processedNotices = processNoticesData(response.data)

    if (processedNotices.length === 0) {
      console.log('暂无通知')
      return
    }

    notices.value = processedNotices

    // 检查是否应该自动显示
    if (props.autoShow && shouldShowDialog() && hasNewNotices()) {
      dialogVisible.value = true
    }
  } catch (error) {
    console.error('获取通知失败:', error)
  }
}

/**
 * 处理通知数据
 */
function processNoticesData(data: any): Notice[] {
  if (!data) return []

  const result: Notice[] = []

  // 处理数组格式
  if (Array.isArray(data)) {
    data.forEach(item => {
      if (item && (item.content || item.title)) {
        result.push({
          id: item.id,
          title: item.title || t('systemAnnouncement') || '系统公告',
          content: item.content || '',
          type: item.type || (item.image ? 'img' : 'txt'),
          url: item.url,
          priority: item.priority || 0,
          created_at: item.created_at
        })
      }
    })
  }

  // 处理对象格式（兼容旧版本API）
  else if (typeof data === 'object') {
    // 图片通知
    if (data.alert && Array.isArray(data.alert)) {
      data.alert.forEach((item: any) => {
        if (item?.content) {
          result.push({
            ...item,
            type: 'img',
            title: item.title || t('systemAnnouncement') || '系统公告'
          })
        }
      })
    }

    // 文本通知
    if (data.notices && Array.isArray(data.notices)) {
      data.notices.forEach((item: any) => {
        if (item && (item.content || item.title)) {
          result.push({
            ...item,
            type: 'txt',
            title: item.title || t('systemAnnouncement') || '系统公告'
          })
        }
      })
    }
  }

  // 按优先级排序
  return result.sort((a, b) => (b.priority || 0) - (a.priority || 0))
}

/**
 * 处理对话框关闭
 */
function handleClose() {
  currentIndex.value = 0
  autoPlay.value = true
}

// 生命周期
onMounted(() => {
  fetchNotices()
})

// 监听显示状态
watch(dialogVisible, (val) => {
  if (val) {
    autoPlay.value = true
  }
})

// 暴露方法
defineExpose({
  show: () => {
    dialogVisible.value = true
  },
  hide: () => {
    dialogVisible.value = false
  },
  refresh: fetchNotices
})
</script>

<style lang="less" scoped>
.notices-dialog {
  :deep(.el-dialog__body) {
    padding: 20px;
  }
}

.notices-container {
  .notice-item {
    cursor: pointer;

    &:hover {
      .notice-content {
        color: var(--el-color-primary);
      }
    }
  }

  .notice-image {
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;

    .el-image {
      width: 100%;
      height: 100%;
    }

    .image-error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      color: var(--el-text-color-secondary);
    }
  }

  .notice-text {
    height: 100%;
    padding: 20px;
    overflow-y: auto;

    &::-webkit-scrollbar {
      width: 8px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;

      &:hover {
        background: #a8a8a8;
      }
    }

    .notice-content {
      font-size: 14px;
      line-height: 1.8;
      color: var(--el-text-color-regular);
      transition: color 0.3s;

      :deep(a) {
        color: var(--el-color-primary);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      :deep(p) {
        margin: 10px 0;
      }

      :deep(h1, h2, h3, h4, h5, h6) {
        margin: 15px 0 10px;
        font-weight: 600;
      }
    }
  }

  .notice-footer {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid var(--el-border-color-lighter);
    display: flex;
    justify-content: space-between;
    align-items: center;

    .notice-indicator {
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }
}

.empty-state {
  padding: 40px 0;
}
</style>
