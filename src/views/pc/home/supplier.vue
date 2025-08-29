<template>
  <div class="pc-supplier-page">
    <!-- 简单头部 -->
    <div class="page-header">
      <el-button @click="goBack" class="back-btn">
        <el-icon><ArrowLeft /></el-icon>
        {{ t('common.back') }}
      </el-button>
      <h1>{{ supplierInfo.name }} - {{ categoryName }}</h1>
      <div class="game-count">{{ t('common.all') }} {{ gameList.length }} {{ t('game.venues') }}</div>
    </div>

    <!-- 游戏列表 -->
    <div class="games-section">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <el-icon class="is-loading" size="32"><Loading /></el-icon>
        <span>{{ t('loading') }}</span>
      </div>

      <!-- 空状态 -->
      <el-empty v-else-if="gameList.length === 0" :description="t('noData')" />

      <!-- 游戏网格 -->
      <div v-else class="games-grid">
        <div
          v-for="(game, idx) in gameList"
          :key="idx"
          class="game-card"
          @click="enterGame(game)"
        >
          <div class="game-image">
            <el-image
              :src="getImgUrl(game.game_img_url || game.img_url || '')"
              fit="cover"
              style="width: 100%; height: 100%;"
            >
              <template #error>
                <div class="image-error">
                  <el-icon size="24"><Picture /></el-icon>
                  <span>{{ t('noData') }}</span>
                </div>
              </template>
            </el-image>

            <!-- 维护遮罩 -->
            <div v-if="game.is_can_run === 0" class="maintenance-mask">
              <span>{{ t('maintenance') }}</span>
            </div>
          </div>

          <div class="game-info">
            <div class="game-name">{{ game.game_name || game.name }}</div>
            <div class="game-meta">
              <span class="supplier-code">{{ game.supplier_code }}</span>
              <el-tag v-if="game.is_hot_text" type="danger" size="small">
                {{ game.is_hot_text }}
              </el-tag>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Loading, Picture } from '@element-plus/icons-vue'
import { getImgUrl } from '@/utils/tools'
import api from '@/api'
import { getLanguage } from '@/lang'
import { convertFrontendToBackendLang } from '@/utils/tools'

defineOptions({ name: 'PcSupplierGames' })

const store = useAppStore()
const route = useRoute()
const router = useRouter()
const { t } = useI18n()

console.log('PC供应商页面初始化')
console.log('route.params:', route.params)
console.log('route.query:', route.query)

// 响应式数据
const loading = ref(true)
const gameList = ref([])

// 供应商信息 - 从路由参数获取
const supplierInfo = ref({
  code: route.params.supplier_code || '',
  name: route.query.supplier_name || t('game.venues'),
  categoryCode: route.params.category_code || route.query.category_code || 'SLOT',
  id: route.query.supplier_id || '',
  is_can_run: Number(route.query.is_can_run) || 1
})

console.log('供应商信息:', supplierInfo.value)

// 计算属性
const categoryName = computed(() => {
  const categoryMap = {
    'SLOT': t('electronicGames'),
    'LIVE': t('liveCasino'),
    'FISH': t('fishingGames'),
    'CARD': t('cardGames'),
    'SPORT': t('sportsEvents'),
    'SPORTS': t('sportsEvents'),
    'LOTTERY': t('lotteryGames'),
    'XG': t('game.venues'), // 根据URL中的XG
    'HOT': t('hotGames')
  }
  return categoryMap[supplierInfo.value.categoryCode] || supplierInfo.value.categoryCode
})

// 获取游戏列表
async function getGameList() {
  console.log('开始获取游戏列表...')
  loading.value = true

  try {
    const userInfo = store.getUser()
    const userCurrency = userInfo?.currency || 'CNY'

    const requestParams = {
      page: 1,
      limit: 100, // 一次加载更多
      supplier_code: supplierInfo.value.code,
      game_type: supplierInfo.value.categoryCode,
      currency: userCurrency,
      language: convertFrontendToBackendLang(getLanguage()),
    }

    console.log('请求参数:', requestParams)

    const resp = await api.gameList(requestParams)
    console.log('API响应:', resp)

    if (resp && resp.code === 200) {
      let games = []

      // 处理不同的响应格式
      if (resp.data && Array.isArray(resp.data)) {
        games = resp.data
      } else if (resp.data && resp.data.list && Array.isArray(resp.data.list)) {
        games = resp.data.list
      } else if (resp.data && resp.data.data && Array.isArray(resp.data.data)) {
        games = resp.data.data
      }

      // 确保游戏有必要的字段
      games.forEach(game => {
        if (!game.supplier_code) {
          game.supplier_code = supplierInfo.value.code
        }
      })

      gameList.value = games
      console.log('游戏列表加载成功:', gameList.value.length, '个游戏')
    } else {
      console.error('API响应异常:', resp)
      ElMessage.error('获取游戏列表失败')
    }
  } catch (error) {
    console.error('获取游戏列表失败:', error)
    ElMessage.error('获取游戏列表失败: ' + error.message)
  } finally {
    loading.value = false
  }
}

// 进入游戏
function enterGame(game) {
  console.log('点击游戏:', game)

  if (!store.isLogin()) {
    ElMessage.warning(t('game.loginRequired'))
    return
  }

  if (game.is_can_run === 0) {
    ElMessage.warning(t('weiHuZhong'))
    return
  }

  // 跳转到游戏页面
  router.push({
    name: 'to_game',
    params: {
      game: game.game_code,
      code: game.supplier_code || supplierInfo.value.code,
      mobile: 0
    }
  })
}

// 返回上一页
function goBack() {
  router.back()
}

// 页面初始化
onMounted(async () => {
  console.log('PC供应商页面mounted')
  await getGameList()
})
</script>

<style lang="less" scoped>
.pc-supplier-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;

  // 头部
  .page-header {
    background: white;
    padding: 20px 30px;
    border-radius: 8px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    .back-btn {
      flex-shrink: 0;
    }

    h1 {
      margin: 0;
      color: #333;
      font-size: 24px;
      font-weight: 600;
    }

    .game-count {
      margin-left: auto;
      color: #666;
      background: #f0f0f0;
      padding: 5px 12px;
      border-radius: 12px;
      font-size: 14px;
    }
  }

  // 游戏区域
  .games-section {
    background: white;
    border-radius: 8px;
    padding: 30px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);

    // 加载状态
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px;
      color: #666;
      gap: 10px;
    }

    // 游戏网格
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;

      .game-card {
        background: white;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        transition: all 0.3s ease;
        cursor: pointer;
        border: 2px solid transparent;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(0,0,0,0.15);
          border-color: #409eff;
        }

        .game-image {
          position: relative;
          width: 100%;
          height: 150px;
          overflow: hidden;

          .image-error {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #f5f5f5;
            color: #999;
            gap: 8px;

            span {
              font-size: 12px;
            }
          }

          .maintenance-mask {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: 500;
          }
        }

        .game-info {
          padding: 15px;

          .game-name {
            font-size: 14px;
            font-weight: 500;
            color: #333;
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .game-meta {
            display: flex;
            align-items: center;
            gap: 8px;

            .supplier-code {
              font-size: 12px;
              color: #999;
              background: #f0f0f0;
              padding: 2px 6px;
              border-radius: 4px;
            }
          }
        }
      }
    }
  }
}

// 响应式
@media (max-width: 768px) {
  .pc-supplier-page {
    padding: 10px;

    .page-header {
      padding: 15px 20px;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;

      h1 {
        font-size: 20px;
      }
    }

    .games-section {
      padding: 20px;

      .games-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
    }
  }
}
</style>
