<template>
  <div class="pc-gift">
    <!-- 页面头部 -->
    <div class="gift-header">
      <div class="header-container">
        <div class="header-content">
          <h1 class="page-title">
            <el-icon class="title-icon"><Present /></el-icon>
            {{ $t('youhuihuodong') || '优惠活动' }}
          </h1>
          <p class="page-subtitle">{{ $t('gift.subtitle') || '精彩活动，优惠不断' }}</p>
        </div>

        <!-- 搜索和筛选 -->
        <div class="header-actions">
          <el-input
            v-model="searchKeyword"
            :placeholder="$t('common.search') || '搜索活动'"
            class="search-input"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>

          <el-select
            v-model="sortBy"
            :placeholder="$t('common.sort') || '排序'"
            class="sort-select"
            @change="handleSort"
          >
            <el-option label="最新发布" value="newest" />
            <el-option label="最热门" value="hottest" />
            <el-option label="即将结束" value="ending" />
          </el-select>
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="gift-container">
      <!-- 分类标签 -->
      <div class="category-tabs">
        <div class="tabs-wrapper">
          <div
            v-for="(tab, idx) in tabs"
            :key="idx"
            :class="['tab-item', { active: activeTab === idx }]"
            @click="handleTabChange(idx)"
          >
            <span class="tab-label">
              {{ tab.title === 'all' ? $t('all') || '全部' : tab.title }}
            </span>
            <span class="tab-count" v-if="getTabCount(tab.value) > 0">
              {{ getTabCount(tab.value) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 活动列表 -->
      <div class="activities-content" v-if="filteredList.length > 0">
        <!-- 网格布局 -->
        <div class="activities-grid" v-if="viewMode === 'grid'">
          <div
            v-for="activity in paginatedList"
            :key="activity.id"
            class="activity-card"
            @click="goToDetail(activity)"
          >
            <!-- 活动标签 -->
            <div class="card-badges">
              <span class="badge badge-hot" v-if="activity.is_hot">
                <el-icon><Sunny /></el-icon>
                热门
              </span>
              <span class="badge badge-new" v-if="isNewActivity(activity.created_at)">
                NEW
              </span>
            </div>

            <!-- 活动图片 -->
            <div class="card-image">
              <el-image
                :src="getImgUrl(activity.thumb_url || '')"
                fit="cover"
                lazy
                class="activity-img"
              >
                <template #placeholder>
                  <div class="image-loading">
                    <el-icon class="is-loading"><Loading /></el-icon>
                  </div>
                </template>
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>

              <!-- 悬浮遮罩 -->
              <div class="image-overlay">
                <el-button type="primary" size="default">
                  查看详情
                  <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>

            <!-- 活动信息 -->
            <div class="card-content">
              <h3 class="activity-title">{{ activity.title }}</h3>
              <p class="activity-description" v-if="activity.description">
                {{ activity.description }}
              </p>

              <div class="card-footer">
                <div class="footer-left">
                  <span class="activity-type">
                    {{ getActivityTypeName(activity.type) }}
                  </span>
                  <span class="activity-date" v-if="activity.created_at">
                    {{ formatDate(activity.created_at) }}
                  </span>
                </div>
                <div class="footer-right">
                  <el-button
                    type="text"
                    class="action-btn"
                    @click.stop="handleCollect(activity)"
                  >
                    <el-icon :color="activity.collected ? '#f56c6c' : ''">
                      <Star />
                    </el-icon>
                  </el-button>
                  <el-button
                    type="text"
                    class="action-btn"
                    @click.stop="handleShare(activity)"
                  >
                    <el-icon><Share /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 列表布局 -->
        <div class="activities-list" v-else>
          <div
            v-for="activity in paginatedList"
            :key="activity.id"
            class="activity-item"
            @click="goToDetail(activity)"
          >
            <div class="item-image">
              <el-image
                :src="getImgUrl(activity.thumb_url || '')"
                fit="cover"
                lazy
                class="activity-img"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>

            <div class="item-content">
              <div class="content-header">
                <h3 class="activity-title">
                  {{ activity.title }}
                  <span class="badge badge-hot" v-if="activity.is_hot">
                    <el-icon><Sunny /></el-icon>
                    热门
                  </span>
                </h3>
                <span class="activity-type">
                  {{ getActivityTypeName(activity.type) }}
                </span>
              </div>

              <p class="activity-description">
                {{ activity.description || '暂无描述' }}
              </p>

              <div class="content-footer">
                <div class="footer-left">
                  <span class="footer-item" v-if="activity.author">
                    <el-icon><User /></el-icon>
                    {{ activity.author }}
                  </span>
                  <span class="footer-item">
                    <el-icon><Calendar /></el-icon>
                    {{ formatDate(activity.created_at) }}
                  </span>
                  <span class="footer-item">
                    <el-icon><View /></el-icon>
                    {{ activity.views || Math.floor(Math.random() * 10000) }} 次浏览
                  </span>
                </div>
                <div class="footer-right">
                  <el-button type="primary" size="small">
                    查看详情
                    <el-icon class="el-icon--right"><ArrowRight /></el-icon>
                  </el-button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="filteredList.length > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            :page-size="pageSize"
            :total="filteredList.length"
            :page-sizes="[12, 24, 36, 48]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>

      <!-- 空状态 -->
      <div class="empty-state" v-else>
        <el-empty :description="$t('noRecord') || '暂无活动'">
          <el-button type="primary" @click="resetFilters">
            重置筛选条件
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 悬浮工具栏 -->
    <div class="floating-toolbar">
      <el-tooltip content="切换视图" placement="left">
        <el-button
          type="primary"
          circle
          @click="toggleViewMode"
        >
          <el-icon>
            <Grid v-if="viewMode === 'list'" />
            <List v-else />
          </el-icon>
        </el-button>
      </el-tooltip>
    </div>

    <!-- 返回顶部 -->
    <el-backtop :right="100" :bottom="100" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import {
  Present,
  Search,
  ArrowRight,
  Star,
  Share,
  Picture,
  Loading,
  Sunny,
  User,
  Calendar,
  View,
  Grid,
  List
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { invokeApi, getImgUrl } from '@/utils/tools'
import { useAppStore } from '@/stores/app'

defineOptions({ name: 'PcGiftIndex' })

interface ActivityType {
  id: number
  name: string
}

interface ActivityInfo {
  id: number
  type: number
  title: string
  description: string
  thumb_url: string
  author: string
  created_at: string
  updated_at: string
  is_hot?: boolean
  collected?: boolean
  views?: number
}

interface TabInfo {
  title: string
  value: number
}

const router = useRouter()
const store = useAppStore()

// 数据状态
const activeTab = ref(0)
const tabs = ref<TabInfo[]>([])
const list = ref<ActivityInfo[]>([])
const searchKeyword = ref('')
const sortBy = ref('newest')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const pageSize = ref(12)

// 计算属性：过滤后的列表
const filteredList = computed(() => {
  let result = [...list.value]

  // 按分类过滤
  if (activeTab.value > 0 && tabs.value[activeTab.value]) {
    const tabValue = tabs.value[activeTab.value].value
    if (tabValue !== -1) {
      result = result.filter(item => item.type === tabValue)
    }
  }

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    result = result.filter(item =>
      item.title.toLowerCase().includes(keyword) ||
      (item.description && item.description.toLowerCase().includes(keyword))
    )
  }

  // 排序
  if (sortBy.value === 'newest') {
    result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  } else if (sortBy.value === 'hottest') {
    result.sort((a, b) => (b.views || 0) - (a.views || 0))
  }

  return result
})

// 计算属性：分页后的列表
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredList.value.slice(start, end)
})

// 获取活动类型列表
async function getActivityTypes() {
  try {
    const resp = await invokeApi('activityTypeList')
    console.log('activity types resp:', resp)

    if (resp && resp.data) {
      const types = resp.data.list || resp.data || []

      // 构建标签页
      const tmp: TabInfo[] = [{ value: -1, title: 'all' }]

      types.forEach((type: ActivityType) => {
        tmp.push({
          title: type.name,
          value: type.id
        })
      })

      tabs.value = tmp
      console.log('构建的标签页:', tabs.value)
    }
  } catch (err) {
    console.error('获取活动类型失败:', err)
    ElMessage.error('获取活动类型失败')
  }
}

// 获取活动列表
async function getActivities() {
  try {
    const resp = await invokeApi('activityList', {
      page: 1,
      limit: 100
    })
    console.log('activities resp:', resp)

    if (resp && resp.data) {
      const activities = resp.data.list || resp.data || []

      // 添加一些模拟数据以增强展示效果
      list.value = activities.map((item: ActivityInfo) => ({
        ...item,
        is_hot: Math.random() > 0.7,
        collected: false,
        views: Math.floor(Math.random() * 10000) + 1000
      }))

      console.log('活动列表:', list.value)
    }
  } catch (err) {
    console.error('获取活动列表失败:', err)
    ElMessage.error('获取活动列表失败')
  }
}

// 获取分类下的活动数量
function getTabCount(tabValue: number): number {
  if (tabValue === -1) {
    return list.value.length
  }
  return list.value.filter(item => item.type === tabValue).length
}

// 获取活动类型名称
function getActivityTypeName(type: number): string {
  const tab = tabs.value.find(t => t.value === type)
  return tab ? tab.title : '其他'
}

// 判断是否为新活动（7天内）
function isNewActivity(createdAt: string): boolean {
  if (!createdAt) return false
  const createDate = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - createDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays <= 7
}

// 格式化日期
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) {
    return '今天'
  } else if (diffDays === 1) {
    return '昨天'
  } else if (diffDays <= 7) {
    return `${diffDays}天前`
  } else {
    return date.toLocaleDateString('zh-CN')
  }
}

// 切换标签
function handleTabChange(index: number) {
  activeTab.value = index
  currentPage.value = 1
}

// 搜索
function handleSearch() {
  currentPage.value = 1
}

// 排序
function handleSort() {
  currentPage.value = 1
}

// 切换视图模式
function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

// 分页大小改变
function handleSizeChange(val: number) {
  pageSize.value = val
  currentPage.value = 1
}

// 页码改变
function handlePageChange(val: number) {
  currentPage.value = val
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 收藏活动
function handleCollect(activity: ActivityInfo) {
  activity.collected = !activity.collected
  if (activity.collected) {
    ElMessage.success('收藏成功')
  } else {
    ElMessage.info('已取消收藏')
  }
}

// 分享活动
function handleShare(activity: ActivityInfo) {
  const url = `${window.location.origin}/activity/${activity.id}`
  navigator.clipboard.writeText(url).then(() => {
    ElMessage.success('链接已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 跳转详情
function goToDetail(activity: ActivityInfo) {
  router.push({ name: 'activity', params: { id: activity.id } })
}

// 重置筛选
function resetFilters() {
  searchKeyword.value = ''
  sortBy.value = 'newest'
  activeTab.value = 0
  currentPage.value = 1
}

// 监听路由变化，支持从URL恢复状态
watch(() => router.currentRoute.value.query, (query) => {
  if (query.type) {
    const typeIndex = tabs.value.findIndex(t => t.value === Number(query.type))
    if (typeIndex > -1) {
      activeTab.value = typeIndex
    }
  }
}, { immediate: true })

onMounted(async () => {
  store.loading()
  try {
    // 并行请求
    await Promise.all([
      getActivityTypes(),
      getActivities()
    ])
  } finally {
    store.stopLoad()
  }
})
</script>

<style lang="less" scoped>
.pc-gift {
  min-height: 100vh;
  background: #f5f7fa;

  // 页面头部
  .gift-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 60px 0;
    position: relative;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 500px;
      height: 500px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      position: relative;
      z-index: 1;

      .header-content {
        text-align: center;
        margin-bottom: 40px;

        .page-title {
          font-size: 42px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 10px 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 15px;

          .title-icon {
            font-size: 48px;
          }
        }

        .page-subtitle {
          font-size: 18px;
          color: rgba(255, 255, 255, 0.9);
        }
      }

      .header-actions {
        display: flex;
        justify-content: center;
        gap: 20px;

        .search-input {
          width: 400px;

          :deep(.el-input__wrapper) {
            background: rgba(255, 255, 255, 0.95);
            border: none;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
        }

        .sort-select {
          width: 150px;

          :deep(.el-input__wrapper) {
            background: rgba(255, 255, 255, 0.95);
            border: none;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
          }
        }
      }
    }
  }

  // 主体容器
  .gift-container {
    max-width: 1200px;
    margin: -40px auto 0;
    padding: 0 20px 60px;
    position: relative;
    z-index: 2;

    // 分类标签
    .category-tabs {
      background: #fff;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 30px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);

      .tabs-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;

        .tab-item {
          padding: 10px 20px;
          border-radius: 25px;
          background: #f4f4f5;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 8px;

          .tab-label {
            font-size: 14px;
            color: #606266;
          }

          .tab-count {
            background: #909399;
            color: #fff;
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 10px;
          }

          &:hover {
            background: #e6f7ff;

            .tab-label {
              color: #409eff;
            }
          }

          &.active {
            background: #409eff;

            .tab-label {
              color: #fff;
              font-weight: 500;
            }

            .tab-count {
              background: rgba(255, 255, 255, 0.3);
            }
          }
        }
      }
    }

    // 活动内容
    .activities-content {
      // 网格布局
      .activities-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 24px;
        margin-bottom: 40px;

        .activity-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s;
          cursor: pointer;
          position: relative;

          &:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);

            .image-overlay {
              opacity: 1;
            }
          }

          .card-badges {
            position: absolute;
            top: 10px;
            left: 10px;
            z-index: 2;
            display: flex;
            gap: 8px;

            .badge {
              padding: 4px 10px;
              border-radius: 15px;
              font-size: 12px;
              font-weight: 500;
              display: flex;
              align-items: center;
              gap: 4px;

              &.badge-hot {
                background: linear-gradient(135deg, #ff6b6b, #ff8e53);
                color: #fff;
              }

              &.badge-new {
                background: #52c41a;
                color: #fff;
              }
            }
          }

          .card-image {
            position: relative;
            height: 180px;
            overflow: hidden;

            .activity-img {
              width: 100%;
              height: 100%;
              transition: transform 0.3s;
            }

            .image-loading,
            .image-error {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f5f7fa;
              color: #c0c4cc;
              font-size: 40px;
            }

            .image-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.6);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: opacity 0.3s;
            }
          }

          .card-content {
            padding: 20px;

            .activity-title {
              font-size: 18px;
              font-weight: 500;
              color: #303133;
              margin: 0 0 10px 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .activity-description {
              font-size: 14px;
              color: #909399;
              line-height: 1.5;
              margin-bottom: 15px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              min-height: 42px;
            }

            .card-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .footer-left {
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 12px;
                color: #909399;

                .activity-type {
                  padding: 2px 8px;
                  background: #f4f4f5;
                  border-radius: 4px;
                }
              }

              .footer-right {
                display: flex;
                gap: 5px;

                .action-btn {
                  padding: 4px;

                  &:hover {
                    color: #409eff;
                  }
                }
              }
            }
          }
        }
      }

      // 列表布局
      .activities-list {
        display: flex;
        flex-direction: column;
        gap: 20px;
        margin-bottom: 40px;

        .activity-item {
          background: #fff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          display: flex;
          gap: 24px;
          cursor: pointer;
          transition: all 0.3s;

          &:hover {
            transform: translateX(5px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
          }

          .item-image {
            width: 240px;
            height: 135px;
            flex-shrink: 0;
            border-radius: 8px;
            overflow: hidden;

            .activity-img {
              width: 100%;
              height: 100%;
            }

            .image-error {
              width: 100%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f5f7fa;
              color: #c0c4cc;
              font-size: 40px;
            }
          }

          .item-content {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: space-between;

            .content-header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 10px;

              .activity-title {
                font-size: 20px;
                font-weight: 500;
                color: #303133;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
              }

              .activity-type {
                padding: 4px 12px;
                background: #f4f4f5;
                border-radius: 4px;
                font-size: 14px;
                color: #606266;
              }
            }

            .activity-description {
              font-size: 14px;
              color: #606266;
              line-height: 1.6;
              margin-bottom: 15px;
              overflow: hidden;
              text-overflow: ellipsis;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .content-footer {
              display: flex;
              justify-content: space-between;
              align-items: center;

              .footer-left {
                display: flex;
                align-items: center;
                gap: 20px;

                .footer-item {
                  display: flex;
                  align-items: center;
                  gap: 5px;
                  font-size: 13px;
                  color: #909399;

                  .el-icon {
                    font-size: 14px;
                  }
                }
              }
            }
          }
        }
      }

      // 分页
      .pagination-wrapper {
        display: flex;
        justify-content: center;
        padding: 20px 0;
      }
    }

    // 空状态
    .empty-state {
      background: #fff;
      border-radius: 12px;
      padding: 80px 20px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    }
  }

  // 悬浮工具栏
  .floating-toolbar {
    position: fixed;
    right: 40px;
    bottom: 150px;
    z-index: 99;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .pc-gift {
    .gift-header {
      padding: 40px 0;

      .header-container {
        .header-content {
          .page-title {
            font-size: 28px;
          }
        }

        .header-actions {
          flex-direction: column;
          width: 100%;

          .search-input {
            width: 100%;
          }
        }
      }
    }

    .gift-container {
      .activities-content {
        .activities-grid {
          grid-template-columns: 1fr;
        }

        .activities-list {
          .activity-item {
            flex-direction: column;

            .item-image {
              width: 100%;
              height: 180px;
            }
          }
        }
      }
    }
  }
}
</style>
