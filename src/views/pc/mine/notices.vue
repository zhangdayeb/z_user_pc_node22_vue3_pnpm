<template>
  <div class="pc-notices">
    <!-- PC端头部 -->
    <div class="pc-header">
      <el-button
        type="primary"
        :icon="ArrowLeft"
        @click="handleBack"
        class="back-btn"
      >
        {{ $t('common.back') }}
      </el-button>
      <h2 class="page-title">{{ $t('mine.myNotices') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container" v-loading="loading">
        <span>{{ $t('common.loading') }}</span>
      </div>

      <!-- 通知列表 -->
      <div v-else-if="noticeList.length > 0" class="notices-list">
        <div
          v-for="(item, idx) in noticeList"
          :key="idx"
          class="notice-item"
          @click="handleNoticeClick(item)"
        >
          <div class="notice-content">
            <h3 class="notice-title">{{ item.title }}</h3>
            <div class="notice-text" v-html="item.content"></div>
            <p class="notice-time">{{ formatTime(item.created_at) }}</p>
          </div>
          <div class="notice-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 空数据状态 -->
      <div v-else class="empty-container">
        <el-empty :description="$t('common.noData')" />
      </div>

      <!-- 分页器 -->
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'
import api from '@/api'

defineOptions({ name: 'PcNotices' })

interface NoticeItem {
  id: number
  title: string
  content: string
  created_at: string
}

const { t } = useI18n()
const router = useRouter()

// 响应式数据
const noticeList = ref<NoticeItem[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

function handleBack() {
  router.back()
}

// 格式化时间
function formatTime(timeStr: string): string {
  if (!timeStr) return ''

  try {
    const date = new Date(timeStr)
    if (isNaN(date.getTime())) {
      return timeStr
    }

    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    console.error('时间格式化错误:', error)
    return timeStr
  }
}

// 获取通知列表
async function getNotices(page = 1, limit = 20) {
  loading.value = true

  try {
    const params = {
      page: page,
      limit: limit
    }

    console.log('请求通知列表:', params)
    const resp:any = await api.notices(params)
    console.log('通知列表响应:', resp)

    if (resp && resp.code === 200) {
      // 处理数据 - 适配后端返回格式
      if (Array.isArray(resp.data)) {
        // 如果 data 直接是数组
        noticeList.value = resp.data
        total.value = resp.total || resp.data.length
      } else if (resp.data && Array.isArray(resp.data.list)) {
        // 如果有分页结构
        noticeList.value = resp.data.list
        const pagination = resp.data.pagination
        if (pagination) {
          total.value = pagination.total || 0
          currentPage.value = pagination.current_page || page
          pageSize.value = pagination.per_page || limit
        } else {
          total.value = resp.data.total || resp.total || noticeList.value.length
        }
      } else {
        // 兜底处理
        noticeList.value = []
        total.value = 0
      }

      console.log('通知数据处理结果:', {
        count: noticeList.value.length,
        total: total.value,
        currentPage: currentPage.value
      })
    } else {
      throw new Error(resp?.message || '获取通知失败')
    }
  } catch (error) {
    console.error('获取通知列表失败:', error)
    ElMessage.error('获取通知失败，请稍后重试')
    noticeList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 点击通知项
function handleNoticeClick(item: NoticeItem) {
  console.log('点击通知:', item)
  // 这里可以添加点击通知的处理逻辑
  // 比如跳转到详情页或展开显示完整内容
}

// 分页大小改变
async function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  currentPage.value = 1
  await getNotices(1, newSize)
}

// 当前页改变
async function handleCurrentChange(newPage: number) {
  currentPage.value = newPage
  await getNotices(newPage, pageSize.value)
}

onMounted(async () => {
  await getNotices()
})
</script>

<style lang="less" scoped>
.pc-notices {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.pc-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 24px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  .back-btn {
    margin-right: 16px;
  }

  .page-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin: 0;
  }
}

.pc-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  min-height: 600px;

  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 80px 0;
    color: #666;
    gap: 16px;
  }

  .notices-list {
    margin-bottom: 40px;

    .notice-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
      margin-bottom: 16px;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        border-color: #409eff;
        background: #fff;
      }

      &:last-child {
        margin-bottom: 0;
      }

      .notice-content {
        flex: 1;
        min-width: 0;

        .notice-title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }

        .notice-text {
          font-size: 14px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 12px;
          max-height: 60px;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;

          :deep(p) {
            margin: 0;
          }

          :deep(img) {
            max-width: 100%;
            height: auto;
          }
        }

        .notice-time {
          font-size: 13px;
          color: #999;
          margin: 0;
        }
      }

      .notice-arrow {
        flex-shrink: 0;
        color: #c0c4cc;
        font-size: 18px;
        transition: all 0.3s ease;
      }

      &:hover .notice-arrow {
        color: #409eff;
        transform: translateX(4px);
      }
    }
  }

  .empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 80px 0;

    :deep(.el-empty) {
      .el-empty__description {
        font-size: 16px;
        color: #909399;
      }
    }
  }

  .pagination-container {
    display: flex;
    justify-content: center;
    margin-top: 30px;

    :deep(.el-pagination) {
      .el-pagination__total,
      .el-pagination__sizes,
      .el-pagination__jump {
        color: #606266;
      }
    }
  }
}

@media (min-width: 1600px) {
  .pc-notices {
    max-width: 1600px;
  }
}
</style>
