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
      <!-- 筛选标签 -->
      <div class="filter-section">
        <el-radio-group v-model="activeTab" @change="handleTabChange">
          <el-radio-button :value="0">{{ $t('unread') }}</el-radio-button>
          <el-radio-button :value="1">{{ $t('readed') }}</el-radio-button>
        </el-radio-group>
      </div>

      <!-- 通知列表 -->
      <div class="notices-list">
        <!-- 未读通知 -->
        <div v-if="activeTab === 0">
          <div v-if="unread.data.length === 0 && !unread.loading" class="empty-state">
            <el-empty :description="$t('noRecord')" />
          </div>
          <div v-else>
            <div
              v-for="(item, idx) in unread.data"
              :key="`unread-${idx}`"
              class="notice-item unread"
              @click="handleNoticeClick(item)"
            >
              <div class="notice-content">
                <h3 class="notice-title">{{ item.title }}</h3>
                <p class="notice-time">{{ item.created_at }}</p>
              </div>
              <div class="notice-status">
                <el-tag type="success" size="small">{{ $t('unread') }}</el-tag>
              </div>
              <div class="notice-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 已读通知 -->
        <div v-if="activeTab === 1">
          <div v-if="read.data.length === 0 && !read.loading" class="empty-state">
            <el-empty :description="$t('noRecord')" />
          </div>
          <div v-else>
            <div
              v-for="(item, idx) in read.data"
              :key="`read-${idx}`"
              class="notice-item read"
              @click="handleNoticeClick(item)"
            >
              <div class="notice-content">
                <h3 class="notice-title">{{ item.title }}</h3>
                <p class="notice-time">{{ item.created_at }}</p>
              </div>
              <div class="notice-status">
                <el-tag type="info" size="small">{{ $t('readed') }}</el-tag>
              </div>
              <div class="notice-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 分页组件 -->
      <el-pagination
        v-if="getCurrentList().length > 0"
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        :background="true"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        class="pagination"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { invokeApi } from '@/utils/tools'
import type { ApiRead } from 'typings'
import { onMounted, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

defineOptions({ name: 'PcNotices' })

interface ListData {
  data: ApiRead[]
  loading: boolean
  finished: boolean
  total: number
  page: number
}

const router = useRouter()
const activeTab = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const total = ref(0)

const read = ref<ListData>({
  data: [],
  loading: false,
  finished: false,
  total: 0,
  page: 0,
})

const unread = ref<ListData>({
  data: [],
  loading: false,
  finished: false,
  total: 0,
  page: 0,
})

// 获取当前标签对应的列表
const getCurrentList = computed(() => {
  return activeTab.value === 0 ? unread.value.data : read.value.data
})

function handleBack() {
  router.back()
}

// 标签切换
function handleTabChange(value: number) {
  activeTab.value = value
  currentPage.value = 1
  loadMessages()
}

// 分页变化
function handlePageChange(page: number) {
  currentPage.value = page
  loadMessages()
}

// 分页大小变化
function handleSizeChange(val: number) {
  pageSize.value = val
  currentPage.value = 1
  loadMessages()
}

// 点击通知项
function handleNoticeClick(item: ApiRead) {
  // 处理通知点击事件，可以跳转到详情页或标记为已读
  console.log('点击通知:', item)

  // 如果是未读通知，可以标记为已读
  if (item.is_read === 0) {
    markAsRead(item)
  }
}

// 标记为已读
async function markAsRead(item: ApiRead) {
  try {
    // 调用标记已读的API
    const resp:any = await invokeApi('markMessageRead', { id: item.id })

    if (resp && resp.code === 200) {
      // 从未读列表移除，添加到已读列表
      const index = unread.value.data.findIndex(notice => notice.id === item.id)
      if (index !== -1) {
        const readItem = { ...item, is_read: 1 }
        unread.value.data.splice(index, 1)
        read.value.data.unshift(readItem)
      }
    }
  } catch (error) {
    console.error('标记已读失败:', error)
  }
}

// 加载消息数据
async function loadMessages() {
  try {
    const resp:any = await invokeApi('message', {
      page: currentPage.value,
      limit: pageSize.value
    })

    if (resp && resp.data) {
      const data = resp.data.data as ApiRead[]

      // 清空现有数据
      unread.value.data = []
      read.value.data = []

      // 分类消息
      data.forEach(item => {
        if (item.is_read === 0) {
          unread.value.data.push(item)
        } else {
          read.value.data.push(item)
        }
      })

      // 更新分页信息
      if (resp.data.pagination) {
        total.value = resp.data.pagination.total || 0
        currentPage.value = resp.data.pagination.current_page || 1
      } else {
        total.value = data.length
      }

      // 标记加载完成
      unread.value.finished = true
      read.value.finished = true
    }
  } catch (error) {
    console.error('加载消息失败:', error)
    unread.value.data = []
    read.value.data = []
    total.value = 0
  }
}

onMounted(() => {
  loadMessages()
})
</script>

<style scoped>
.pc-notices {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
  max-width: 1200px;
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
}

.back-btn {
  margin-right: 16px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.pc-content {
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filter-section {
  margin-bottom: 24px;
  display: flex;
  justify-content: center;
}

.notices-list {
  margin-bottom: 24px;
}

.notice-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.notice-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #409eff;
}

.notice-item:last-child {
  margin-bottom: 0;
}

.notice-item.unread {
  border-left: 3px solid #67c23a;
}

.notice-item.read {
  border-left: 3px solid #909399;
}

.notice-content {
  flex: 1;
}

.notice-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.notice-time {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.notice-status {
  flex-shrink: 0;
}

.notice-arrow {
  flex-shrink: 0;
  color: #c0c4cc;
  font-size: 16px;
}

.notice-item:hover .notice-arrow {
  color: #409eff;
}

.empty-state {
  padding: 60px 0;
}

.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}

/* Element Plus 样式覆盖 */
.pc-notices :deep(.el-radio-group) {
  display: flex;
  gap: 8px;
}

.pc-notices :deep(.el-radio-button__inner) {
  padding: 12px 24px;
  font-weight: 500;
}

.pc-notices :deep(.el-pagination) {
  padding: 12px 0;
}

@media (min-width: 1600px) {
  .pc-notices {
    max-width: 1400px;
  }
}
</style>
