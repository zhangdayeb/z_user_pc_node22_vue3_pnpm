<template>
  <div class="home-main">
    <!-- 轮播图 -->
    <swiper-container
      class="banner-swiper"
      :loop="true"
      :navigation="true"
      :autoplay="true"
      speed="500"
    >
      <swiper-slide v-for="(item, idx) in banners" :key="idx">
        <el-image
          :src="getImgUrl(item.url)"
          fit="contain"
          class="banner-img"
        />
      </swiper-slide>
    </swiper-container>

    <!-- 公告栏 -->
    <div class="notice-bar">
      <el-icon class="notice-icon"><Bell /></el-icon>
      <div class="notice-content">
        <div class="notice-list">
          <div v-for="(notice, idx) in notices" :key="idx" class="notice-item">
            <span v-html="notice.content"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 游戏分类导航 -->
      <div class="category-tabs">
        <div
          v-for="(category, idx) in gameCategories"
          :key="idx"
          class="category-tab"
          :class="{ active: activeCategory === category.game_type }"
          @click="switchCategory(category.game_type)"
        >
          {{ category.title }}
          <el-icon v-if="category.is_hot" class="hot-icon">
            <StarFilled />
          </el-icon>
        </div>
      </div>

      <!-- 供应商区域 -->
      <div class="suppliers-section" v-if="suppliers.length > 0">
        <h3 class="section-title">游戏厂商</h3>
        <div class="suppliers-grid">
          <div
            v-for="supplier in suppliers"
            :key="supplier.id"
            class="supplier-card"
            :class="{ disabled: supplier.is_can_run === 0 }"
            @click="goToSupplier(supplier)"
          >
            <el-image
              :src="getImgUrl(supplier.img_url)"
              fit="contain"
              class="supplier-logo"
            >
              <template #error>
                <div class="logo-placeholder">{{ supplier.name }}</div>
              </template>
            </el-image>
            <div class="supplier-info">
              <div class="supplier-name">{{ supplier.name }}</div>
              <div class="game-count" v-if="supplier.game_count">
                {{ supplier.game_count }}款游戏
              </div>
            </div>
            <div v-if="supplier.is_can_run === 0" class="maintenance-mask">
              <span>维护中</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 热门游戏区域 -->
      <div class="games-section">
        <div class="section-header">
          <h3 class="section-title">热门游戏</h3>
          <div class="section-actions">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索游戏..."
              clearable
              class="search-input"
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button
              type="text"
              :icon="viewMode === 'grid' ? List : Grid"
              @click="toggleViewMode"
            >
              {{ viewMode === 'grid' ? '列表' : '网格' }}
            </el-button>
          </div>
        </div>

        <!-- 游戏网格视图 -->
        <div v-if="viewMode === 'grid'" class="games-grid">
          <!-- 显示热门游戏 -->
          <div
            v-if="activeCategory === 'HOT'"
            v-for="game in displayGames"
            :key="game.id || game.game_code"
            class="game-card"
            :class="{ disabled: game.is_can_run === 0 }"
            @click="enterGame(game)"
          >
            <div class="game-image-wrapper">
              <el-image
                :src="getImgUrl(game.game_img_url || game.img_url)"
                fit="cover"
                class="game-image"
                lazy
              >
                <template #error>
                  <div class="image-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>

              <!-- 游戏标签 -->
              <div class="game-tags">
                <el-tag v-if="game.is_hot_text" type="danger" size="small">
                  {{ game.is_hot_text }}
                </el-tag>
                <el-tag v-if="game.is_new" type="success" size="small">
                  新游戏
                </el-tag>
              </div>

              <!-- 维护遮罩 -->
              <div v-if="game.is_can_run === 0" class="maintenance-overlay">
                <span>维护中</span>
              </div>

              <!-- 悬停操作 -->
              <div class="game-overlay">
                <el-button
                  type="primary"
                  :disabled="game.is_can_run === 0"
                  @click.stop="enterGame(game)"
                >
                  {{ game.is_can_run === 0 ? '维护中' : '开始游戏' }}
                </el-button>
              </div>
            </div>

            <div class="game-info">
              <div class="game-name" :title="game.game_name || game.name">
                {{ game.game_name || game.name }}
              </div>
              <div class="supplier-name">
                {{ game.supplier_code }}
              </div>
            </div>
          </div>

          <!-- 显示供应商 -->
          <div
            v-else
            v-for="supplier in suppliers"
            :key="supplier.id"
            class="supplier-card"
            :class="{ disabled: supplier.is_can_run === 0 }"
            @click="goToSupplier(supplier)"
          >
            <div class="supplier-image-wrapper">
              <el-image
                :src="getImgUrl(supplier.img_url)"
                fit="contain"
                class="supplier-image"
              >
                <template #error>
                  <div class="image-placeholder">
                    <span>{{ supplier.name }}</span>
                  </div>
                </template>
              </el-image>

              <!-- 维护遮罩 -->
              <div v-if="supplier.is_can_run === 0" class="maintenance-overlay">
                <span>维护中</span>
              </div>
            </div>

            <div class="supplier-info">
              <div class="supplier-name" :title="supplier.name">
                {{ supplier.name }}
              </div>
              <div class="game-count" v-if="supplier.game_count">
                {{ supplier.game_count }}款游戏
              </div>
            </div>
          </div>
        </div>

        <!-- 游戏列表视图 -->
        <div v-else class="games-list">
          <el-table :data="displayGames" @row-click="enterGame">
            <el-table-column label="游戏" min-width="300">
              <template #default="{ row }">
                <div class="list-game-info">
                  <el-image
                    :src="getImgUrl(row.game_img_url || row.img_url)"
                    fit="cover"
                    class="list-game-image"
                  />
                  <div class="list-game-details">
                    <div class="list-game-name">
                      {{ row.game_name || row.name }}
                      <el-tag v-if="row.is_hot_text" type="danger" size="small">
                        {{ row.is_hot_text }}
                      </el-tag>
                    </div>
                    <div class="list-game-code">{{ row.game_code }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <el-table-column prop="supplier_code" label="供应商" width="150" />

            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.is_can_run === 1 ? 'success' : 'danger'">
                  {{ row.is_can_run === 1 ? '正常' : '维护' }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column label="操作" width="120" align="center">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  size="small"
                  :disabled="row.is_can_run === 0"
                  @click.stop="enterGame(row)"
                >
                  {{ row.is_can_run === 0 ? '维护中' : '进入' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="pagination-wrapper" v-if="totalGames > pageSize">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="totalGames"
            :page-sizes="[20, 40, 60, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import {
  Bell,
  StarFilled,
  Search,
  Picture,
  Grid,
  List
} from '@element-plus/icons-vue'
import { getImgUrl } from '@/utils/tools'
import { register } from 'swiper/element/bundle'
import api from '@/api'
import type { ApiBanner, ApiNotice } from 'typings/api'

defineOptions({ name: 'WebHomeMain' })

interface GameCategory {
  game_type: number
  title: string
  is_hot?: boolean
}

interface Supplier {
  id: number
  name: string
  code: string
  img_url: string
  is_can_run: number
  game_count?: number
}

interface GameInfo {
  id?: number
  game_code: string
  game_name?: string
  name?: string
  game_img_url?: string
  img_url?: string
  supplier_code: string
  api_name?: string
  is_can_run: number
  is_hot_text?: string
  is_new?: boolean
}

const router = useRouter()
const store = useAppStore()
const { t } = useI18n()

// 注册Swiper
register()

// 响应式数据
const banners = ref<ApiBanner[]>([])
const notices = ref<ApiNotice[]>([])
const gameCategories = ref<GameCategory[]>([])
const suppliers = ref<Supplier[]>([])
const games = ref<GameInfo[]>([])
const activeCategory = ref<number>(0)
const searchKeyword = ref('')
const viewMode = ref<'grid' | 'list'>('grid')
const currentPage = ref(1)
const pageSize = ref(20)
const totalGames = ref(0)
const loading = ref(false)

// 游戏类型映射 - 与移动端保持一致
const gameTypeI18nMap: { [key: number]: string } = {
  0: 'hotGames',
  1: 'liveCasino',
  2: 'fishingGames',
  3: 'electronicGames',
  4: 'lotteryGames',
  5: 'sportsEvents',
  6: 'cardGames'
}

// 计算属性
const filteredGames = computed(() => {
  if (!searchKeyword.value) return games.value

  const keyword = searchKeyword.value.toLowerCase()
  return games.value.filter(game =>
    (game.game_name || game.name || '').toLowerCase().includes(keyword) ||
    game.game_code.toLowerCase().includes(keyword) ||
    game.supplier_code.toLowerCase().includes(keyword)
  )
})

const displayGames = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredGames.value.slice(start, end)
})

// 方法
async function getBanners() {
  try {
    const resp = await api.bannerList({
      group: 'new1',
      lang: t.locale || 'zh-CN'
    })
    console.log('banner resp:', resp)

    if (resp?.data && Array.isArray(resp.data)) {
      const data = resp.data as ApiBanner[]
      // 如果只有一张轮播图，复制一份避免单图轮播问题
      if (data.length === 1) {
        banners.value = [...data, ...data]
      } else {
        banners.value = data
      }
      console.log('轮播图加载成功:', banners.value.length)
    }
  } catch (error) {
    console.error('获取轮播图失败:', error)
  }
}

async function getNotices() {
  try {
    const resp = await api.notices({ page: 1, limit: 5 })
    console.log('notices resp:', resp)

    if (resp?.code === 200 && Array.isArray(resp.data)) {
      notices.value = resp.data as ApiNotice[]
      console.log('公告加载成功:', notices.value.length)
    }
  } catch (error) {
    console.error('获取公告失败:', error)
  }
}

async function getGameCategories() {
  try {
    const resp = await api.gameTypeList({
      lang: t.locale || 'zh-CN'
    })
    console.log('game types resp:', resp)

    if (resp?.code === 200 && resp.data) {
      const types = resp.data as any[]

      // 转换为菜单格式并翻译 - 与移动端逻辑一致
      const categories = types.map(item => ({
        game_type: item.game_type,
        title: getGameTypeTitle(item),
        is_hot: item.is_hot || item.game_type === 'HOT',
        sort: item.sort_weight || 0,
        id: item.id
      }))

      // 按排序字段排序
      gameCategories.value = categories.sort((a, b) => a.sort - b.sort)

      if (categories.length > 0) {
        // 优先选择HOT类型
        const hotType = categories.find(c => c.game_type === 'HOT')
        activeCategory.value = hotType ? hotType.game_type : categories[0].game_type
      }

      console.log('游戏分类加载成功:', gameCategories.value)
    }
  } catch (error) {
    console.error('获取游戏类型失败，使用默认菜单', error)
    // 使用默认菜单 - 与移动端一致
    gameCategories.value = [
      { game_type: 'HOT', title: t('hotGames'), is_hot: true, sort: 0 },
      { game_type: 'SPORTS', title: t('sportsEvents'), is_hot: false, sort: 1 },
      { game_type: 'LIVE', title: t('liveCasino'), is_hot: false, sort: 2 },
      { game_type: 'SLOTS', title: t('electronicGames'), is_hot: false, sort: 3 },
      { game_type: 'CARD', title: t('cardGames'), is_hot: false, sort: 4 },
      { game_type: 'FISH', title: t('fishingGames'), is_hot: false, sort: 5 },
      { game_type: 'LOTTERY', title: t('lotteryGames'), is_hot: false, sort: 6 }
    ]
    activeCategory.value = 'HOT'
  }
}

// 获取游戏类型标题（支持多语言）
function getGameTypeTitle(gameType: any): string {
  // 如果有多语言字段，根据当前语言返回
  if (gameType.title_i18n) {
    const titles = gameType.title_i18n
    return titles[t.locale] || titles['zh-CN'] || gameType.title
  }

  // 如果没有多语言字段，尝试使用预定义的翻译key
  const typeKeyMap: { [key: string]: string } = {
    'HOT': 'hotGames',
    'SPORTS': 'sportsEvents',
    'LIVE': 'liveCasino',
    'SLOTS': 'electronicGames',
    'CARD': 'cardGames',
    'FISH': 'fishingGames',
    'LOTTERY': 'lotteryGames'
  }

  const key = typeKeyMap[gameType.game_type]
  if (key) {
    return t(key)
  }

  // 默认返回原始标题
  return gameType.title
}

async function getSuppliers() {
  try {
    const resp = await api.supplierList({
      category_code: activeCategory.value,
      page: 1,
      limit: 20,
      show_status: 1,
      lang: t.locale || 'zh-CN'
    })
    console.log('suppliers resp:', resp)

    if (resp?.code === 200 && resp.data) {
      const newSuppliers = resp.data.list || resp.data || []

      // 设置运行状态
      newSuppliers.forEach((supplier: any) => {
        supplier.is_can_run = supplier.run_status
      })

      suppliers.value = newSuppliers
      console.log('供应商加载成功:', suppliers.value.length)
    }
  } catch (error) {
    console.error('获取供应商失败:', error)
    suppliers.value = []
  }
}

async function getGames() {
  try {
    loading.value = true
    const resp = await api.gameList({
      game_type: activeCategory.value,
      page: currentPage.value,
      limit: pageSize.value,
      lang: t.locale || 'zh-CN'
    })

    console.log('games resp:', resp)

    if (resp?.code === 200 && resp.data) {
      // 兼容不同的数据结构
      let gameData = []
      let total = 0

      if (Array.isArray(resp.data)) {
        gameData = resp.data
        total = resp.data.length
      } else if (resp.data.list) {
        gameData = resp.data.list
        total = resp.data.pagination?.total || resp.data.list.length
      } else if (resp.data.data) {
        gameData = resp.data.data
        total = resp.data.total || resp.data.data.length
      }

      games.value = gameData
      totalGames.value = total

      console.log('获取游戏列表成功:', games.value.length, '个游戏')
    }
  } catch (error) {
    console.error('获取游戏列表失败:', error)
    games.value = []
    totalGames.value = 0
  } finally {
    loading.value = false
  }
}

async function switchCategory(gameType: string | number) {
  if (activeCategory.value === gameType) return

  console.log('切换到游戏分类:', gameType)
  activeCategory.value = gameType
  currentPage.value = 1

  // 根据分类类型决定加载数据
  if (gameType === 'HOT') {
    // 热门游戏直接加载游戏列表
    suppliers.value = []
    await getGames()
  } else {
    // 其他分类加载供应商列表
    games.value = []
    await getSuppliers()
  }
}

function goToSupplier(supplier: Supplier) {
  if (supplier.is_can_run === 0) {
    ElMessage.warning('该厂商正在维护中')
    return
  }

  // 使用与移动端相同的路由跳转逻辑
  router.push({
    name: 'supplier_games',
    params: {
      supplier_code: supplier.code,
      category_code: activeCategory.value.toString()
    },
    query: {
      supplier_name: supplier.name,
      supplier_id: supplier.id.toString(),
      currency_code: supplier.currency_code || 'CNY',
      supplier_img: supplier.img_url,
      is_can_run: supplier.is_can_run.toString(),
      current_game_type_name: gameCategories.value.find(c => c.game_type === activeCategory.value)?.title
    }
  })
}

function enterGame(game: GameInfo) {
  if (!store.isLogin()) {
    ElMessage.warning(t('game.loginRequired'))
    // 触发登录弹窗
    return
  }

  if (game.is_can_run === 0) {
    ElMessage.warning('游戏维护中，暂时无法进入')
    return
  }

  // 使用与移动端相同的跳转逻辑
  router.push({
    name: 'to_game',
    params: {
      game: game.game_code,
      code: game.supplier_code,
      mobile: 0  // PC端标识
    }
  })
}

function toggleViewMode() {
  viewMode.value = viewMode.value === 'grid' ? 'list' : 'grid'
}

function handleSearch() {
  currentPage.value = 1
}

function handleSizeChange(size: number) {
  pageSize.value = size
  currentPage.value = 1
}

function handlePageChange(page: number) {
  currentPage.value = page
  // 可以在这里重新加载数据实现真正的分页
}

// 监听分类变化 - 重新加载数据
watch(activeCategory, async (newCategory) => {
  console.log('分类变化监听:', newCategory)
  if (newCategory === 'HOT') {
    suppliers.value = []
    await getGames()
  } else {
    games.value = []
    await getSuppliers()
  }
}, { immediate: false })

// 监听搜索关键词变化
watch(searchKeyword, () => {
  totalGames.value = filteredGames.value.length
  currentPage.value = 1
})

onMounted(async () => {
  console.log('首页组件开始加载...')
  store.loading()
  try {
    // 先加载基础数据
    await Promise.all([
      getBanners(),
      getNotices(),
      getGameCategories()
    ])

    console.log('基础数据加载完成，游戏分类:', gameCategories.value)

    // 等待分类加载完成后再加载对应数据
    if (gameCategories.value.length > 0 && activeCategory.value !== undefined) {
      console.log('开始加载内容，当前分类:', activeCategory.value)

      if (activeCategory.value === 'HOT') {
        console.log('加载热门游戏')
        await getGames()
      } else {
        console.log('加载供应商列表')
        await getSuppliers()
      }
    }
  } catch (error) {
    console.error('首页数据加载失败:', error)
  } finally {
    store.stopLoad()
    console.log('首页加载完成')
  }
})
</script>

<style lang="less" scoped>
.home-main {
  flex: 1;
  min-width: var(--web-min-width);
  width: 100%;
  margin: 0 auto;
  background: #f5f7fa;

  // 轮播图
  .banner-swiper {
    width: 100%;
    height: 300px;

    .banner-img {
      width: 100%;
      height: 100%;
    }
  }

  // 公告栏
  .notice-bar {
    height: 40px;
    background: rgba(54, 66, 76, 0.9);
    display: flex;
    align-items: center;
    padding: 0 20px;

    .notice-icon {
      color: #fff;
      font-size: 18px;
      margin-right: 10px;
    }

    .notice-content {
      flex: 1;
      overflow: hidden;

      .notice-list {
        animation: scrollLeft 20s linear infinite;
        white-space: nowrap;

        .notice-item {
          display: inline-block;
          color: #fff;
          font-size: 14px;
          margin-right: 50px;
        }
      }
    }
  }

  // 主要内容
  .main-content {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;

    // 分类导航
    .category-tabs {
      display: flex;
      gap: 20px;
      margin-bottom: 30px;
      padding: 20px;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

      .category-tab {
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s;
        font-weight: 500;
        color: #666;
        border: 2px solid transparent;
        display: flex;
        align-items: center;
        gap: 8px;

        .hot-icon {
          color: #ff4d4f;
          font-size: 16px;
        }

        &:hover {
          background: #f0f2f5;
        }

        &.active {
          background: #409eff;
          color: #fff;
          border-color: #409eff;
        }
      }
    }

    // 供应商区域
    .suppliers-section {
      margin-bottom: 40px;

      .section-title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
        color: #333;
      }

      .suppliers-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 20px;
        padding: 20px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .supplier-card {
          position: relative;
          padding: 20px;
          border: 2px solid #e8e8e8;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s;
          text-align: center;

          &:hover:not(.disabled) {
            border-color: #409eff;
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(64, 158, 255, 0.2);
          }

          &.disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .supplier-logo {
            width: 80px;
            height: 60px;
            margin: 0 auto 15px;

            .logo-placeholder {
              width: 100%;
              height: 100%;
              background: #f5f5f5;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 8px;
              color: #999;
              font-size: 12px;
            }
          }

          .supplier-info {
            .supplier-name {
              font-weight: 500;
              color: #333;
              margin-bottom: 5px;
            }

            .game-count {
              font-size: 12px;
              color: #999;
            }
          }

          .maintenance-mask {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.7);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 500;
          }
        }
      }
    }

    // 游戏区域
    .games-section {
      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;

        .section-title {
          font-size: 24px;
          font-weight: 600;
          color: #333;
        }

        .section-actions {
          display: flex;
          gap: 15px;
          align-items: center;

          .search-input {
            width: 300px;
          }
        }
      }

      // 网格视图 - 支持游戏和供应商两种显示
      .games-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
        padding: 20px;
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

        .game-card, .supplier-card {
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s;
          border: 2px solid #e8e8e8;

          &:hover:not(.disabled) {
            transform: translateY(-2px);
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
          }

          &.disabled {
            opacity: 0.6;
            cursor: not-allowed;
          }

          .game-image-wrapper, .supplier-image-wrapper {
            position: relative;
            width: 100%;
            height: 160px;

            .game-image, .supplier-image {
              width: 100%;
              height: 100%;

              .image-placeholder {
                width: 100%;
                height: 100%;
                background: #f5f5f5;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #ccc;
                font-size: 14px;
              }
            }

            .game-tags {
              position: absolute;
              top: 8px;
              left: 8px;
              display: flex;
              gap: 5px;
            }

            .maintenance-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              color: #fff;
              font-weight: 500;
            }

            .game-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.7);
              display: flex;
              align-items: center;
              justify-content: center;
              opacity: 0;
              transition: all 0.3s;
            }

            &:hover .game-overlay {
              opacity: 1;
            }
          }

          .game-info, .supplier-info {
            padding: 15px;

            .game-name, .supplier-name {
              font-weight: 500;
              color: #333;
              margin-bottom: 5px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .supplier-name, .game-count {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }

      // 列表视图
      .games-list {
        background: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        overflow: hidden;

        .list-game-info {
          display: flex;
          align-items: center;
          gap: 15px;

          .list-game-image {
            width: 60px;
            height: 45px;
            border-radius: 6px;
          }

          .list-game-details {
            .list-game-name {
              font-weight: 500;
              margin-bottom: 5px;
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .list-game-code {
              font-size: 12px;
              color: #999;
            }
          }
        }
      }

      // 分页
      .pagination-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 30px;
      }
    }
  }
}

@keyframes scrollLeft {
  0% { transform: translateX(100%); }
  100% { transform: translateX(-100%); }
}

// 响应式设计
@media (max-width: 1200px) {
  .home-main .main-content {
    .suppliers-section .suppliers-grid {
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    }

    .games-section .games-grid {
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    }
  }
}

@media (max-width: 768px) {
  .home-main .main-content {
    padding: 10px;

    .category-tabs {
      flex-wrap: wrap;
      gap: 10px;
    }

    .suppliers-section .suppliers-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }

    .games-section {
      .section-header {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;

        .section-actions .search-input {
          width: 100%;
        }
      }

      .games-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
    }
  }
}
</style>
