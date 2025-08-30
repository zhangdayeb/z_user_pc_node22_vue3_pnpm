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
            <span>{{ t('common.back') }}</span>
          </el-button>

          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">
              {{ t('main.index') }}
            </el-breadcrumb-item>
            <el-breadcrumb-item :to="{ path: '/gift' }">
              {{ t('main.gift') }}
            </el-breadcrumb-item>
            <el-breadcrumb-item>
              {{ activityDetail.title || t('activity.detail') }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="activity-container">
      <div class="content-wrapper">
        <!-- 主要内容 -->
        <div class="content-main">
          <div class="content-card">
            <!-- 文章头部 -->
            <header class="article-header" v-if="activityDetail.title">
              <h1 class="article-title">{{ activityDetail.title }}</h1>
              <div class="article-meta">
                <span class="meta-item" v-if="activityDetail.created_at">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(activityDetail.created_at) }}
                </span>
                <span class="meta-item">
                  <el-icon><View /></el-icon>
                  {{ viewCount }} {{ t('activity.views') }}
                </span>
              </div>
            </header>

            <!-- 封面图片 -->
            <div class="article-cover" v-if="activityDetail.thumb_url">
              <el-image
                :src="activityDetail.thumb_url"
                fit="cover"
                class="cover-image"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>

            <!-- 正文内容 -->
            <div
              class="article-content"
              v-if="activityDetail.content"
              v-html="activityDetail.content"
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
                  {{ t('activity.share') }}
                </el-button>
                <el-button
                  size="large"
                  @click="handleCollect"
                  :type="isCollected ? 'success' : ''"
                >
                  <el-icon><Star /></el-icon>
                  {{ isCollected ? t('activity.collected') : t('activity.collect') }}
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 返回顶部 -->
    <el-backtop :right="40" :bottom="40" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
  ArrowLeft,
  Calendar,
  View,
  Picture,
  Share,
  Star
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
import { useAppStore } from '@/stores/app'

defineOptions({ name: 'PcActivityDetail' })

interface ActivityDetail {
  id: number
  type: number
  title: string
  description: string
  content: string
  thumb_url: string
  created_at: string
  updated_at: string
}

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

// 数据状态
const activityDetail = ref<ActivityDetail>({
  id: 0,
  type: 0,
  title: '',
  description: '',
  content: '',
  thumb_url: '',
  created_at: '',
  updated_at: ''
})

const viewCount = ref(Math.floor(Math.random() * 10000) + 1000)
const isCollected = ref(false)

// 获取活动详情
async function getActivityDetail() {
  store.loading()
  try {
    const id = route.params?.id
    if (!id) {
      ElMessage.error(t('activity.invalidId'))
      router.back()
      return
    }

    const resp: any = await api.activityDetail({ id })
    if (resp?.code === 200 || resp?.code === 1 || resp?.code === 0) {
      activityDetail.value = resp.data
    } else {
      ElMessage.error(t('activity.getDetailFailed'))
      router.back()
    }
  } catch (err) {
    console.error('获取活动详情失败:', err)
    ElMessage.error(t('common.loadFailed'))
    router.back()
  } finally {
    store.stopLoad()
  }
}

// 格式化日期
function formatDate(dateStr: string) {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(t('locale'), {
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
  const url = window.location.href
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success(t('activity.shareSuccess'))
  }).catch(() => {
    ElMessage.error(t('activity.shareFailed'))
  })
}

// 收藏
function handleCollect() {
  isCollected.value = !isCollected.value
  if (isCollected.value) {
    ElMessage.success(t('activity.favoriteSuccess'))
  } else {
    ElMessage.info(t('activity.unfavoriteSuccess'))
  }
}

onMounted(() => {
  getActivityDetail()
})
</script>

<style lang="less" scoped>
.pc-activity-detail {
  min-height: 100vh;
  background: #f5f7fa;

  // 顶部导航栏
  .activity-navbar {
    background: #fff;
    border-bottom: 1px solid #e4e7ed;
    position: sticky;
    top: 0;
    z-index: 100;

    .navbar-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      height: 60px;
      display: flex;
      align-items: center;

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
      }
    }
  }

  // 主体容器
  .activity-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 30px 20px;

    .content-wrapper {
      .content-main {
        .content-card {
          background: #fff;
          border-radius: 8px;
          padding: 40px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

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
            }

            .article-meta {
              display: flex;
              justify-content: center;
              gap: 30px;

              .meta-item {
                display: flex;
                align-items: center;
                gap: 5px;
                font-size: 14px;
                color: #909399;
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

          // 正文内容
          .article-content {
            line-height: 1.8;
            color: #303133;
            font-size: 16px;

            :deep(h1), :deep(h2), :deep(h3) {
              margin: 24px 0 16px 0;
              color: #303133;
              font-weight: 600;
            }

            :deep(p) {
              margin: 16px 0;
            }

            :deep(img) {
              max-width: 100%;
              height: auto;
              border-radius: 4px;
              margin: 20px 0;
            }

            :deep(ul), :deep(ol) {
              padding-left: 24px;
              margin: 16px 0;
            }
          }

          // 底部操作区
          .article-footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e4e7ed;
            display: flex;
            justify-content: center;

            .footer-actions {
              display: flex;
              gap: 15px;
            }
          }
        }
      }
    }
  }
}

// 响应式设计
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
                flex-direction: column;
                gap: 10px;
              }
            }

            .article-cover {
              .cover-image {
                height: 200px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
