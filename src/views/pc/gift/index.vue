<template>
  <div class="pc-gift">
    <!-- 页面头部 -->
    <div class="gift-header">
      <div class="header-container">
        <div class="header-content">
          <h1 class="page-title">
            <el-icon class="title-icon"><Present /></el-icon>
            {{ $t('youhuihuodong') }}
          </h1>
          <p class="page-subtitle">{{ $t('gift.subtitle') }}</p>
        </div>

        <!-- 搜索和筛选 -->
        <div class="header-actions">
          <el-input
            v-model="searchKeyword"
            :placeholder="$t('common.search')"
            class="search-input"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
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
              {{ tab.title === 'all' ? $t('all') : tab.title }}
            </span>
            <span class="tab-count" v-if="getTabCount(tab.value) > 0">
              {{ getTabCount(tab.value) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 活动列表 -->
      <div class="activities-content" v-if="filteredList.length > 0">
        <div class="activities-grid">
          <div
            v-for="activity in paginatedList"
            :key="activity.id"
            class="activity-card"
            @click="goToDetail(activity)"
          >
            <!-- 活动图片 -->
            <div class="card-image">
              <el-image
                :src="activity.thumb_url || ''"
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
                  {{ $t('common.viewDetails') }}
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
        <el-empty :description="$t('noRecord')">
          <el-button type="primary" @click="resetFilters">
            {{ $t('common.reset') }}
          </el-button>
        </el-empty>
      </div>
    </div>

    <!-- 返回顶部 -->
    <el-backtop :right="100" :bottom="100" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  Present,
  Search,
  ArrowRight,
  Picture,
  Loading
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '@/api'
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
  created_at: string
  updated_at: string
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
    const resp: any = await api.activityTypeList()
    if (resp?.code === 200 || resp?.code === 1 || resp?.code === 0) {
      const types = resp.data?.list || resp.data || []

      // 构建标签页
      const tmp: TabInfo[] = [{ value: -1, title: 'all' }]
      types.forEach((type: ActivityType) => {
        tmp.push({
          title: type.name,
          value: type.id
        })
      })

      tabs.value = tmp
    }
  } catch (err) {
    console.error('获取活动类型失败:', err)
  }
}

// 获取活动列表
async function getActivities() {
  try {
    const resp: any = await api.activityList({
      page: 1,
      limit: 100
    })

    if (resp?.code === 200 || resp?.code === 1 || resp?.code === 0) {
      const activities = resp.data?.list || resp.data || []
      list.value = activities
    }
  } catch (err) {
    console.error('获取活动列表失败:', err)
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
  return tab ? tab.title : ''
}

// 格式化日期
function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN')
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

// 跳转详情
function goToDetail(activity: ActivityInfo) {
  router.push({ name: 'activity', params: { id: activity.id } })
}

// 重置筛选
function resetFilters() {
  searchKeyword.value = ''
  activeTab.value = 0
  currentPage.value = 1
}

onMounted(async () => {
  store.loading()
  try {
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

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;

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

        .search-input {
          width: 400px;

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

          .card-image {
            position: relative;
            height: 180px;
            overflow: hidden;

            .activity-img {
              width: 100%;
              height: 100%;
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
      }
    }
  }
}
</style>
