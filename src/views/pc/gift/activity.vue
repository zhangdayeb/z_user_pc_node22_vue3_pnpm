<template>
  <div class="pc-activity-detail">
    <!-- 顶部导航栏 -->
    <div class="activity-navbar">
      <div class="navbar-container">
        <div class="navbar-left">
          <el-button
            type="text"
            @click="onClickBack"
            class="back-button"
          >
            <el-icon><ArrowLeft /></el-icon>
            <span>{{ $t('common.back') || '返回' }}</span>
          </el-button>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">
              {{ $t('main.index') || '首页' }}
            </el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/gift' }">
              {{ $t('main.gift') || '优惠活动' }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>
              {{ activityDetail.title || $t('activity_detail') || '活动详情' }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <div class="navbar-right">
          <!-- 字体大小调节 -->
          <div class="font-size-control">
            <span class="control-label">字体</span>
            <el-button-group>
              <el-button
                size="small"
                @click="adjustFontSize('small')"
                :type="fontSize === 'small' ? 'primary' : ''"
              >
                小
              </el-button>
              <el-button
                size="small"
                @click="adjustFontSize('medium')"
                :type="fontSize === 'medium' ? 'primary' : ''"
              >
                中
              </el-button>
              <el-button
                size="small"
                @click="adjustFontSize('large')"
                :type="fontSize === 'large' ? 'primary' : ''"
              >
                大
              </el-button>
            </el-button-group>
          </div>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="activity-container">
      <div class="content-wrapper">
        <!-- 左侧目录（如果有） -->
        <div class="content-sidebar" v-if="tableOfContents.length > 0">
          <div class="toc-card">
            <h3 class="toc-title">目录</h3>
            <ul class="toc-list">
              <li
                v-for="(item, index) in tableOfContents"
                :key="index"
                :class="['toc-item', `toc-level-${item.level}`, { active: activeSection === item.id }]"
                @click="scrollToSection(item.id)"
              >
                {{ item.text }}
              </li>
            </ul>
          </div>
        </div>

        <!-- 主要内容 -->
        <div class="content-main">
          <div class="content-card">
            <!-- 文章头部 -->
            <header class="article-header" v-if="activityDetail.title">
              <h1 class="article-title">{{ activityDetail.title }}</h1>
              <div class="article-meta">
                <span class="meta-item" v-if="activityDetail.author">
                  <el-icon><User /></el-icon>
                  {{ activityDetail.author }}
                </span>
                <span class="meta-item" v-if="activityDetail.created_at">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(activityDetail.created_at) }}
                </span>
                <span class="meta-item">
                  <el-icon><View /></el-icon>
                  {{ viewCount }} 次浏览
                </span>
              </div>
            </header>

            <!-- 封面图片 -->
            <div class="article-cover" v-if="activityDetail.thumb_url">
              <el-image
                :src="getImgUrl(activityDetail.thumb_url)"
                fit="cover"
                class="cover-image"
                :preview-src-list="[getImgUrl(activityDetail.thumb_url)]"
                :preview-teleported="true"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>

            <!-- 活动描述 -->
            <div class="article-description" v-if="activityDetail.description">
              <div class="description-content">
                <el-icon class="quote-icon"><InfoFilled /></el-icon>
                <p>{{ activityDetail.description }}</p>
              </div>
            </div>

            <!-- 正文内容 -->
            <div
              class="article-content"
              :class="`font-size-${fontSize}`"
              v-if="activityDetail.content"
              v-html="processedContent"
              ref="contentRef"
            ></div>

            <!-- 底部操作区 -->
            <div class="article-footer">
              <div class="footer-actions">
                <el-button
                  type="primary"
                  size="large"
                  @click="handleShare"
                >
                  <el-icon><Share /></el-icon>
                  分享活动
                </el-button>
                <el-button
                  size="large"
                  @click="handleCollect"
                  :type="isCollected ? 'success' : ''"
                >
                  <el-icon><Star /></el-icon>
                  {{ isCollected ? '已收藏' : '收藏' }}
                </el-button>
              </div>

              <div class="footer-info">
                <span class="update-time" v-if="activityDetail.updated_at">
                  最后更新：{{ formatDate(activityDetail.updated_at) }}
                </span>
              </div>
            </div>
          </div>

          <!-- 相关活动推荐 -->
          <div class="related-activities" v-if="relatedActivities.length > 0">
            <h3 class="related-title">相关活动推荐</h3>
            <div class="related-list">
              <div
                v-for="activity in relatedActivities"
                :key="activity.id"
                class="related-item"
                @click="goToActivity(activity.id)"
              >
                <el-image
                  :src="getImgUrl(activity.thumb_url)"
                  fit="cover"
                  class="related-image"
                />
                <div class="related-info">
                  <h4 class="related-name">{{ activity.title }}</h4>
                  <p class="related-desc">{{ activity.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回顶部 -->
    <el-backtop
      :right="40"
      :bottom="40"
      :visibility-height="300"
    >
      <div class="backtop-custom">
        <el-icon><Top /></el-icon>
      </div>
    </el-backtop>

    <!-- 阅读进度条 -->
    <div class="reading-progress">
      <div class="progress-bar" :style="{ width: readingProgress + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeft,
  User,
  Calendar,
  View,
  Picture,
  InfoFilled,
  Share,
  Star,
  Top
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { invokeApi, getImgUrl } from '@/utils/tools'
import { useAppStore } from '@/stores/app'

defineOptions({ name: 'PcActivityDetail' })

interface ActivityDetail {
  id: number
  type: number
  title: string
  description: string
  content: string
  thumb_url: string
  author: string
  created_at: string
  updated_at: string
}

interface TableOfContent {
  id: string
  text: string
  level: number
}

const store = useAppStore()
const route = useRoute()
const router = useRouter()

// 数据状态
const activityDetail = ref<ActivityDetail>({
  id: 0,
  type: 0,
  title: '',
  description: '',
  content: '',
  thumb_url: '',
  author: '',
  created_at: '',
  updated_at: ''
})

const relatedActivities = ref<any[]>([])
const tableOfContents = ref<TableOfContent[]>([])
const activeSection = ref('')
const fontSize = ref('medium')
const viewCount = ref(Math.floor(Math.random() * 10000) + 1000)
const isCollected = ref(false)
const readingProgress = ref(0)
const contentRef = ref<HTMLElement>()

// 处理后的内容（添加ID等）
const processedContent = computed(() => {
  if (!activityDetail.value.content) return ''

  let content = activityDetail.value.content

  // 为标题添加ID以便导航
  let headingIndex = 0
  content = content.replace(/<h([1-6])([^>]*)>(.*?)<\/h\1>/gi, (match, level, attrs, text) => {
    const id = `heading-${headingIndex++}`
    return `<h${level}${attrs} id="${id}">${text}</h${level}>`
  })

  // 为图片添加点击放大功能的类
  content = content.replace(/<img([^>]*)>/gi, '<img$1 class="zoomable-image">')

  return content
})

// 获取活动详情
async function getActivityDetail() {
  store.loading()
  try {
    const id = route.params?.id ?? '0'
    console.log('Activity ID:', id)

    if (!id || id === '0') {
      ElMessage.error('活动ID无效')
      router.back()
      return
    }

    const resp = await invokeApi('activityDetail', { id: id })

    if (resp && resp.data) {
      activityDetail.value = resp.data

      // 获取相关活动
      await getRelatedActivities()

      // 生成目录
      await nextTick()
      generateTableOfContents()

      // 监听滚动
      window.addEventListener('scroll', handleScroll)
    } else {
      ElMessage.error('获取活动详情失败')
      router.back()
    }
  } catch (err) {
    console.error('获取活动详情失败:', err)
    ElMessage.error('加载失败，请稍后重试')
    router.back()
  } finally {
    store.stopLoad()
  }
}

// 获取相关活动
async function getRelatedActivities() {
  try {
    const resp = await invokeApi('activityList', {
      type: activityDetail.value.type,
      limit: 3
    })

    if (resp && resp.data) {
      // 过滤掉当前活动
      relatedActivities.value = resp.data.filter(
        (item: any) => item.id !== activityDetail.value.id
      ).slice(0, 3)
    }
  } catch (err) {
    console.error('获取相关活动失败:', err)
  }
}

// 生成目录
function generateTableOfContents() {
  if (!contentRef.value) return

  const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
  const toc: TableOfContent[] = []

  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.substring(1))
    toc.push({
      id: heading.id,
      text: heading.textContent || '',
      level: level
    })
  })

  tableOfContents.value = toc
}

// 滚动到指定章节
function scrollToSection(id: string) {
  const element = document.getElementById(id)
  if (element) {
    const offset = element.offsetTop - 80
    window.scrollTo({
      top: offset,
      behavior: 'smooth'
    })
  }
}

// 处理滚动事件
function handleScroll() {
  // 更新阅读进度
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  readingProgress.value = Math.min(100, (scrollTop / docHeight) * 100)

  // 更新当前章节
  if (contentRef.value) {
    const headings = contentRef.value.querySelectorAll('h1, h2, h3, h4, h5, h6')
    let currentSection = ''

    headings.forEach((heading) => {
      const rect = heading.getBoundingClientRect()
      if (rect.top <= 100) {
        currentSection = heading.id
      }
    })

    activeSection.value = currentSection
  }
}

// 调整字体大小
function adjustFontSize(size: string) {
  fontSize.value = size
  localStorage.setItem('articleFontSize', size)
}

// 格式化日期
function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 返回
function onClickBack() {
  router.back()
}

// 分享
function handleShare() {
  // 复制链接到剪贴板
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 收藏
function handleCollect() {
  isCollected.value = !isCollected.value
  if (isCollected.value) {
    ElMessage.success('收藏成功')
  } else {
    ElMessage.info('已取消收藏')
  }
}

// 跳转到其他活动
function goToActivity(id: number) {
  router.push(`/activity/${id}`)
}

onMounted(async () => {
  // 恢复字体大小设置
  const savedFontSize = localStorage.getItem('articleFontSize')
  if (savedFontSize) {
    fontSize.value = savedFontSize
  }

  await getActivityDetail()
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style lang="less" scoped>
.pc-activity-detail {
  min-height: 100vh;
  background: #f5f7fa;

  // 顶部导航栏
  .activity-navbar {
    position: sticky;
    top: 0;
    z-index: 100;
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 20px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .navbar-left {
        display: flex;
        align-items: center;
        gap: 20px;

        .back-button {
          font-size: 14px;
          color: #606266;

          &:hover {
            color: #409eff;
          }
        }

        :deep(.el-breadcrumb) {
          font-size: 14px;
        }
      }

      .navbar-right {
        .font-size-control {
          display: flex;
          align-items: center;
          gap: 10px;

          .control-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }

  // 主体容器
  .activity-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 30px 20px;

    .content-wrapper {
      display: flex;
      gap: 30px;
      align-items: flex-start;

      // 左侧目录
      .content-sidebar {
        width: 260px;
        position: sticky;
        top: 90px;

        .toc-card {
          background: #fff;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

          .toc-title {
            font-size: 16px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 15px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e4e7ed;
          }

          .toc-list {
            list-style: none;
            padding: 0;
            margin: 0;

            .toc-item {
              padding: 8px 10px;
              margin-bottom: 4px;
              font-size: 14px;
              color: #606266;
              cursor: pointer;
              border-radius: 4px;
              transition: all 0.3s;

              &:hover {
                background: #f5f7fa;
                color: #409eff;
              }

              &.active {
                background: #ecf5ff;
                color: #409eff;
                font-weight: 500;
              }

              &.toc-level-2 {
                padding-left: 25px;
              }

              &.toc-level-3 {
                padding-left: 40px;
              }

              &.toc-level-4 {
                padding-left: 55px;
              }
            }
          }
        }
      }

      // 主要内容
      .content-main {
        flex: 1;
        min-width: 0;

        .content-card {
          background: #fff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
          margin-bottom: 30px;

          // 文章头部
          .article-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 1px solid #e4e7ed;

            .article-title {
              font-size: 32px;
              font-weight: 600;
              color: #303133;
              margin: 0 0 20px 0;
              line-height: 1.4;
            }

            .article-meta {
              display: flex;
              justify-content: center;
              align-items: center;
              gap: 30px;

              .meta-item {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 14px;
                color: #909399;

                .el-icon {
                  font-size: 16px;
                }
              }
            }
          }

          // 封面图片
          .article-cover {
            margin-bottom: 30px;
            border-radius: 8px;
            overflow: hidden;

            .cover-image {
              width: 100%;
              height: 400px;
              cursor: pointer;

              .image-error {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f5f7fa;
                color: #c0c4cc;
                font-size: 48px;
              }
            }
          }

          // 活动描述
          .article-description {
            margin-bottom: 30px;

            .description-content {
              position: relative;
              background: #f4f4f5;
              border-left: 4px solid #409eff;
              padding: 20px;
              border-radius: 4px;

              .quote-icon {
                position: absolute;
                top: 10px;
                left: 10px;
                font-size: 24px;
                color: #409eff;
                opacity: 0.3;
              }

              p {
                margin: 0;
                padding-left: 30px;
                font-size: 16px;
                line-height: 1.8;
                color: #606266;
              }
            }
          }

          // 正文内容
          .article-content {
            line-height: 1.8;
            color: #303133;

            &.font-size-small {
              font-size: 14px;
            }

            &.font-size-medium {
              font-size: 16px;
            }

            &.font-size-large {
              font-size: 18px;
            }

            :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
              margin: 24px 0 16px 0;
              color: #303133;
              font-weight: 600;
            }

            :deep(h1) { font-size: 28px; }
            :deep(h2) { font-size: 24px; }
            :deep(h3) { font-size: 20px; }
            :deep(h4) { font-size: 18px; }

            :deep(p) {
              margin: 16px 0;
            }

            :deep(img) {
              max-width: 100%;
              height: auto;
              border-radius: 4px;
              margin: 20px 0;
              cursor: zoom-in;
              transition: transform 0.3s;

              &:hover {
                transform: scale(1.02);
              }
            }

            :deep(ul), :deep(ol) {
              padding-left: 24px;
              margin: 16px 0;
            }

            :deep(li) {
              margin: 8px 0;
            }

            :deep(blockquote) {
              border-left: 4px solid #409eff;
              padding: 12px 20px;
              margin: 20px 0;
              background: #f4f4f5;
              border-radius: 4px;
            }

            :deep(table) {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;

              th, td {
                padding: 12px;
                border: 1px solid #e4e7ed;
              }

              th {
                background: #f5f7fa;
                font-weight: 600;
              }
            }

            :deep(code) {
              background: #f4f4f5;
              padding: 2px 6px;
              border-radius: 3px;
              font-size: 0.9em;
              color: #e6428b;
            }

            :deep(pre) {
              background: #f4f4f5;
              padding: 16px;
              border-radius: 4px;
              overflow-x: auto;
              margin: 20px 0;

              code {
                background: none;
                padding: 0;
                color: inherit;
              }
            }
          }

          // 底部操作区
          .article-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e4e7ed;
            display: flex;
            justify-content: space-between;
            align-items: center;

            .footer-actions {
              display: flex;
              gap: 15px;
            }

            .footer-info {
              .update-time {
                font-size: 14px;
                color: #909399;
              }
            }
          }
        }

        // 相关活动推荐
        .related-activities {
          background: #fff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

          .related-title {
            font-size: 20px;
            font-weight: 600;
            color: #303133;
            margin-bottom: 20px;
          }

          .related-list {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;

            .related-item {
              cursor: pointer;
              transition: transform 0.3s;

              &:hover {
                transform: translateY(-5px);

                .related-name {
                  color: #409eff;
                }
              }

              .related-image {
                width: 100%;
                height: 120px;
                border-radius: 4px;
                margin-bottom: 10px;
              }

              .related-info {
                .related-name {
                  font-size: 16px;
                  font-weight: 500;
                  color: #303133;
                  margin-bottom: 8px;
                  transition: color 0.3s;
                }

                .related-desc {
                  font-size: 14px;
                  color: #909399;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  display: -webkit-box;
                  -webkit-line-clamp: 2;
                  -webkit-box-orient: vertical;
                }
              }
            }
          }
        }
      }
    }
  }

  // 返回顶部按钮
  .backtop-custom {
    width: 40px;
    height: 40px;
    background: #409eff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    box-shadow: 0 2px 12px rgba(64, 158, 255, 0.3);
    transition: all 0.3s;

    &:hover {
      background: #66b1ff;
      transform: scale(1.1);
    }
  }

  // 阅读进度条
  .reading-progress {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: rgba(0, 0, 0, 0.05);
    z-index: 101;

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #409eff, #66b1ff);
      transition: width 0.3s;
    }
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .pc-activity-detail {
    .activity-container {
      .content-wrapper {
        .content-sidebar {
          display: none;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .pc-activity-detail {
    .activity-container {
      padding: 20px 15px;

      .content-wrapper {
        .content-main {
          .content-card {
            padding: 20px;

            .article-header {
              .article-title {
                font-size: 24px;
              }

              .article-meta {
                flex-wrap: wrap;
                gap: 15px;
              }
            }

            .article-cover {
              .cover-image {
                height: 200px;
              }
            }
          }

          .related-activities {
            .related-list {
              grid-template-columns: 1fr;
            }
          }
        }
      }
    }
  }
}
</style>
