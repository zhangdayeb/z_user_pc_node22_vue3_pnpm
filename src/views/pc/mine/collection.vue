<template>
  <div class="pc-collection">
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
      <h2 class="page-title">{{ $t('game.myCollection') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-loading-spinner />
        <span>{{ $t('common.loading') }}</span>
      </div>

      <!-- 游戏网格 -->
      <div v-else-if="gameList.length > 0" class="game-grid">
        <div
          v-for="(item, idx) in gameList"
          :key="idx"
          class="game-item"
        >
          <el-image
            :src="item.img_url || item.game_img_url"
            fit="contain"
            class="game-image"
          />
          <div class="game-info">
            <div class="game-title">{{ item.en_name || item.name || item.game_name }}</div>
            <div class="game-code">{{ item.api_name || item.supplier_code }}</div>
          </div>

        </div>
      </div>

      <!-- 空数据状态 -->
      <div v-else class="empty-container">
        <el-empty :description="$t('game.noFavoriteGames')" />
      </div>

      <!-- 分页器 -->
      <div v-if="total > 0" class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[12, 24, 48, 96]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import api from '@/api'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'PcMyCollection' })

const { t } = useI18n()
const router = useRouter()

// 响应式数据
const gameList = ref<any[]>([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(24)
const total = ref(0)

function handleBack() {
  router.back()
}

// 获取收藏游戏列表
async function getFavoriteGames(page = 1, limit = 24) {
  loading.value = true
  try {
    const params = {
      page: page,
      limit: limit
    }

    const resp:any = await api.userGameLoveList(params)
    if (resp && resp.code === 200 && resp.data) {
      gameList.value = resp.data.list || []

      // 处理分页信息
      const pagination = resp.data.pagination
      if (pagination) {
        total.value = pagination.total || 0
        currentPage.value = pagination.current_page || page
        pageSize.value = pagination.per_page || limit
      } else {
        // 兼容旧格式
        total.value = resp.data.total || gameList.value.length
      }

      console.log('收藏游戏加载成功:', {
        count: gameList.value.length,
        total: total.value,
        currentPage: currentPage.value
      })
    } else {
      throw new Error(resp?.message || '获取收藏游戏失败')
    }
  } catch (error) {
    console.error('获取收藏游戏失败:', error)
    ElMessage.error(t('game.getFavoriteGamesFailed'))
    gameList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}


// 分页大小改变
async function handleSizeChange(newSize: number) {
  pageSize.value = newSize
  currentPage.value = 1
  await getFavoriteGames(1, newSize)
}

// 当前页改变
async function handleCurrentChange(newPage: number) {
  currentPage.value = newPage
  await getFavoriteGames(newPage, pageSize.value)
}

onMounted(async () => {
  await getFavoriteGames()
})
</script>

<style lang="less" scoped>
.pc-collection {
  min-height: 100vh;
  background: #f5f7fa;
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

  .game-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;
    margin-bottom: 40px;

    .game-item {
      display: flex;
      align-items: center;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        border-color: #409eff;
      }

      .game-image {
        width: 100px;
        height: 140px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .game-info {
        flex: 1;
        margin: 0 20px;
        min-width: 0;

        .game-title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .game-code {
          background: #e0f2fe;
          color: #409eff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          display: inline-block;
        }
      }

      .game-action {
        flex-shrink: 0;

        :deep(.el-button) {
          &:hover {
            transform: scale(1.1);
          }
        }
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
    margin-top: 20px;

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
  .pc-collection {
    max-width: 1600px;

    .pc-content {
      .game-grid {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
      }
    }
  }
}
</style>
