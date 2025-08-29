<template>
  <div class="m-main">
    <!-- i18n -->
    <LanguageVue />

    <!-- banner -->
    <van-swipe class="my-swipe" :autoplay="3000" indicator-color="white">
      <van-swipe-item v-for="(item, idx) in banners" :key="idx">
        <van-image :src="getImgUrl(item?.url)"></van-image>
      </van-swipe-item>
    </van-swipe>

    <!-- 通知栏 -->
    <div class="m-notice" v-if="notices.length > 0">
      <div class="m-notice-icon">
        <van-image :src="noticeImg" fit="contain" class="m-notice-img"></van-image>
      </div>
      <div class="m-notice-content">
        <van-swipe :autoplay="5000" :show-indicators="false" vertical class="notice-swipe">
          <van-swipe-item v-for="(notice, idx) in notices" :key="idx">
            <div class="notice-text" v-html="notice.content"></div>
          </van-swipe-item>
        </van-swipe>
      </div>
    </div>

    <!-- 用户信息区域（保持原有） -->
    <div class="m-col">
      <div class="m-row" v-if="store.getUser() === null">
        <span>{{ $t('main.noLogin') }}</span>
        <span class="m-link" @click.stop="loginHandler">{{
          $t('main.loginCheck')
        }}</span>
      </div>
      <div class="m-row" v-else>
        <div class="m-row m-user">
          <span>{{ store.getUser()?.name ?? '' }}</span>
          <div class="m-user-level">
            <div class="m-img-bg">VIP</div>
            <span class="m-level-txt">{{ store.getUser()?.level }}</span>
          </div>
          <van-button
            v-if="false"
            type="danger"
            size="mini"
            class="m-btn"
            @click="signDailyHandler"
            >{{ $t('daliySign') }}</van-button>
        </div>
        <span>${{
          Number(store.getUser()?.money ?? '0.00') <= 0
            ? '0.00'
            : Number(store.getUser()?.money).toFixed(2)
        }}</span>
      </div>
      <div class="m-row">
        <div class="m-row-item m-start" @click="operatHandler(1)">
          <van-image :src="depositImg" fit="contain" class="m-img"></van-image>
          <span class="m-label">{{ $t('mine.deposit') }}</span>
        </div>
        <div class="m-row-item" @click="operatHandler(2)">
          <van-image :src="withdrawImg" fit="contain" class="m-img"></van-image>
          <span class="m-label">{{ $t('mine.withdraw') }}</span>
        </div>
        <div class="m-row-item m-end" @click="operatHandler(3)">
          <van-image :src="vipImg" fit="contain" class="m-img"></van-image>
          <span class="m-label">VIP</span>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="m-main-contain">
      <!-- 左侧游戏类型导航 -->
      <div class="m-con-left">
        <div class="m-scroll-wrapper">
          <div class="m-scroll-content">
            <div class="m-scroll-list-wrapper">
              <div class="m-gameNav-container">
                <div
                  class="m-gameNav-item"
                  v-for="(item, idx) in gameTypes"
                  :key="item.id"
                  :class="{ active: item.id === currentGameType?.id }"
                  @click.stop="selectGameHandler(item, idx)"
                >
                  <van-image
                    :src="getImgUrl(
                      currentGameType?.id === item.id
                        ? item.icon_after
                        : item.icon_before
                    )"
                    class="m-item-img"
                  ></van-image>
                  <div class="m-item-txt">{{ item.title }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="m-con-right">
        <div class="m-scroll-wrapper" ref="scrollContainer">
          <div class="m-scroll-content">
            <div class="m-scroll-list-wrapper">
              <div class="m-gameNav-container-list">
                <!-- 热门游戏类型 - 显示选项卡和对应内容 -->
                <div v-if="isHotGameType" class="m-hot-games-section">
                  <!-- 热门游戏选项卡 -->
                  <div class="m-hot-tabs">
                    <div
                      class="m-hot-tab-item"
                      :class="{ active: activeHotTab === 'hot' }"
                      @click="switchHotTab('hot')"
                    >
                      {{ $t('game.hot') }}
                    </div>
                    <div
                      class="m-hot-tab-item"
                      :class="{ active: activeHotTab === 'recent' }"
                      @click="switchHotTab('recent')"
                    >
                      {{ $t('game.recent') }}
                    </div>
                    <div
                      class="m-hot-tab-item"
                      :class="{ active: activeHotTab === 'favorite' }"
                      @click="switchHotTab('favorite')"
                    >
                      {{ $t('game.favorite') }}
                    </div>
                  </div>

                  <!-- 热门游戏内容区域 -->
                  <div class="m-hot-content">
                    <!-- 未登录提示 -->
                    <div v-if="!store.isLogin() && (activeHotTab === 'recent' || activeHotTab === 'favorite')"
                         class="m-login-tip">
                      <div class="m-login-tip-content">
                        <van-icon name="warning-o" size="24" color="#999" />
                        <p>{{ $t(activeHotTab === 'recent' ? 'game.loginToViewRecent' : 'game.loginToViewFavorite') }}</p>
                        <van-button type="primary" size="small" @click="loginHandler">
                          {{ $t('game.loginNow') }}
                        </van-button>
                      </div>
                    </div>

                    <!-- 游戏列表 -->
                    <div v-else class="m-content-games">
                      <div
                        class="m-game-item"
                        v-for="(item, idx) in currentGameList"
                        :key="item.id"
                        @click.stop="playGameHandler(item)"
                      >
                        <van-image
                          :src="getImgUrl(item.game_img_url)"
                          class="m-game-img"
                          fit="fill"
                        >
                          <template v-slot:error>
                            <van-icon name="warning-o" class="m-ico" size="22" />
                          </template>
                        </van-image>
                        <div class="m-game-name">{{ item.game_name }}</div>
                        <div v-if="item.is_hot_text" class="m-game-tag">{{ item.is_hot_text }}</div>
                        <!-- 游戏维护状态标识 -->
                        <div v-if="item.is_can_run === 0" class="m-game-status">{{ $t('mine.maintenance') }}</div>
                      </div>
                    </div>

                    <!-- 空数据状态 -->
                    <div v-if="currentGameList.length === 0 && !loading && store.isLogin()" class="m-empty">
                      <van-empty :description="getEmptyDescription()" />
                    </div>
                  </div>
                </div>

                <!-- 其他类型：厂商列表 - 每行1个，纯大图 -->
                <div v-else class="m-content-suppliers">
                  <div
                    class="m-supplier-item"
                    v-for="(supplier, idx) in supplierList"
                    :key="supplier.id"
                    @click.stop="selectSupplierHandler(supplier)"
                  >
                    <van-image
                      :src="getImgUrl(supplier.img_url)"
                      class="m-supplier-img"
                      fit="fill"
                    >
                      <template v-slot:error>
                        <van-icon name="warning-o" class="m-ico" size="22" />
                      </template>
                    </van-image>
                    <!-- 供应商名称显示在图片底部 -->
                    <div class="m-supplier-name">{{ supplier.name }}</div>
                    <div v-if="supplier.is_can_run === 0" class="m-supplier-status">{{ $t('mine.maintenance') }}</div>
                  </div>
                </div>

                <!-- 加载更多状态 -->
                <div v-if="loadingMore" class="m-loading-more">
                  <van-loading>{{ $t('loading') }}</van-loading>
                </div>

                <!-- 没有更多数据 -->
                <div v-else-if="!hasMore && (currentGameList.length > 0 || supplierList.length > 0)" class="m-no-more">
                  {{ $t('noMore') }}
                </div>

                <!-- 空数据状态 -->
                <div v-if="!isHotGameType && gameList.length === 0 && supplierList.length === 0 && !loading" class="m-empty">
                  <van-empty :description="$t('noData')" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 通知弹窗（保持原有） -->
    <NoticesPop />

    <!-- 底部导航 -->
    <div class="m-main-footer"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { showToast } from 'vant'

// 组件导入
import LanguageVue from './components/language.vue'
import NoticesPop from '@/views/mobile/components/notices.vue'

// 工具和API导入
import api from '@/api'
import { getImgUrl, mobileFunc } from '@/utils/tools'
import { useAppStore } from '@/stores/app'

// 图片资源导入
import depositImg from '@/assets/mobile/deposit.png'
import withdrawImg from '@/assets/mobile/withdraw.png'
import vipImg from '@/assets/mobile/home_vip.png'
import noticeImg from '@/assets/mobile/newhome/icon_msg.avif'

defineOptions({ name: 'HomeMain' })

const router = useRouter()
const store = useAppStore()
const { t } = useI18n()

// ==================== 响应式数据 ====================
const banners = ref([])
const notices = ref([])
const gameTypes = ref([])
const currentGameType = ref(null)

// 游戏列表数据
const gameList = ref([])
const hotGameList = ref([])      // 热门游戏列表
const recentGameList = ref([])   // 最近游戏列表
const favoriteGameList = ref([]) // 收藏游戏列表
const supplierList = ref([])

// 状态控制
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const scrollContainer = ref(null)

// 热门游戏选项卡状态
const activeHotTab = ref('hot') // 'hot' | 'recent' | 'favorite'

// ==================== 计算属性 ====================
const isHotGameType = computed(() => {
  return currentGameType.value?.game_type === 'HOT'
})

// 根据当前选中的选项卡返回对应的游戏列表
const currentGameList = computed(() => {
  switch (activeHotTab.value) {
    case 'hot':
      return hotGameList.value
    case 'recent':
      return recentGameList.value
    case 'favorite':
      return favoriteGameList.value
    default:
      return hotGameList.value
  }
})

// 获取空数据描述文本
const getEmptyDescription = () => {
  switch (activeHotTab.value) {
    case 'hot':
      return t('game.noHotGames')
    case 'recent':
      return t('game.noRecentGames')
    case 'favorite':
      return t('game.noFavoriteGames')
    default:
      return t('noData')
  }
}

// ==================== 热门游戏选项卡切换 ====================
async function switchHotTab(tab: string) {
  if (activeHotTab.value === tab) {
    return
  }

  // 检查登录状态
  if (!store.isLogin() && (tab === 'recent' || tab === 'favorite')) {
    loginHandler()
    return
  }

  activeHotTab.value = tab
  hasMore.value = true
  currentPage.value = 1

  // 根据选项卡加载对应数据
  switch (tab) {
    case 'hot':
      if (hotGameList.value.length === 0) {
        await getHotGames(1, false)
      }
      break
    case 'recent':
      await getRecentGames(1, false)
      break
    case 'favorite':
      await getFavoriteGames(1, false)
      break
  }
}

// ==================== 通知相关方法 ====================
async function getNotices() {
  try {
    const resp = await api.notices({ page: 1, limit: 5 })
    console.log('notices resp:', resp)
    if (resp && resp.code === 200 && Array.isArray(resp.data)) {
      notices.value = resp.data
      console.log('通知加载成功:', notices.value)
    } else {
      console.warn('通知数据格式异常:', resp)
    }
  } catch (error) {
    console.error('获取通知失败:', error)
  }
}

// ==================== 游戏类型相关方法 ====================
async function getGameTypes() {
  try {
    const resp = await api.gameTypeList()
    if (resp && resp.code === 200 && resp.data) {
      gameTypes.value = resp.data
      gameTypes.value.sort((a, b) => a.sort_weight - b.sort_weight)
    }
  } catch (error) {
    console.error('获取游戏类型失败:', error)
    showToast('获取游戏类型失败')
  }
}

// ==================== 热门游戏相关方法 ====================
async function getHotGames(page = 1, isLoadMore = false) {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const params = {
      page: page,
      limit: 20
    }

    const resp = await api.gameHotList(params)
    if (resp && resp.code === 200 && resp.data) {
      const newGames = resp.data.list || []

      if (isLoadMore) {
        hotGameList.value.push(...newGames)
      } else {
        hotGameList.value = newGames
        currentPage.value = 1
      }

      const pagination = resp.data.pagination
      hasMore.value = pagination?.has_more || false
      currentPage.value = pagination?.current_page || page

      console.log('热门游戏加载成功:', {
        count: newGames.length,
        total: hotGameList.value.length,
        hasMore: hasMore.value
      })
    }
  } catch (error) {
    console.error('获取热门游戏失败:', error)
    showToast(t('game.getHotGamesFailed'))
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// ==================== 最近游戏相关方法 ====================
async function getRecentGames(page = 1, isLoadMore = false) {
  if (!store.isLogin()) {
    recentGameList.value = []
    return
  }

  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const params = {
      page: page,
      limit: 20
    }

    const resp = await api.userGameRecentList(params)
    if (resp && resp.code === 200 && resp.data) {
      const newGames = resp.data.list || []

      if (isLoadMore) {
        recentGameList.value.push(...newGames)
      } else {
        recentGameList.value = newGames
        currentPage.value = 1
      }

      const pagination = resp.data.pagination
      hasMore.value = pagination?.has_more || false
      currentPage.value = pagination?.current_page || page

      console.log('最近游戏加载成功:', {
        count: newGames.length,
        total: recentGameList.value.length,
        hasMore: hasMore.value
      })
    }
  } catch (error) {
    console.error('获取最近游戏失败:', error)
    showToast(t('game.getRecentGamesFailed'))
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// ==================== 收藏游戏相关方法 ====================
async function getFavoriteGames(page = 1, isLoadMore = false) {
  if (!store.isLogin()) {
    favoriteGameList.value = []
    return
  }

  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const params = {
      page: page,
      limit: 20
    }

    const resp = await api.userGameLoveList(params)
    if (resp && resp.code === 200 && resp.data) {
      const newGames = resp.data.list || []

      if (isLoadMore) {
        favoriteGameList.value.push(...newGames)
      } else {
        favoriteGameList.value = newGames
        currentPage.value = 1
      }

      const pagination = resp.data.pagination
      hasMore.value = pagination?.has_more || false
      currentPage.value = pagination?.current_page || page

      console.log('收藏游戏加载成功:', {
        count: newGames.length,
        total: favoriteGameList.value.length,
        hasMore: hasMore.value
      })
    }
  } catch (error) {
    console.error('获取收藏游戏失败:', error)
    showToast(t('game.getFavoriteGamesFailed'))
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// ==================== 游戏列表相关方法（保留用于其他游戏类型） ====================
async function getGames(gameType = 'HOT', page = 1, isLoadMore = false) {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const params = {
      game_type: gameType,
      page: page,
      limit: 20
    }

    const resp = await api.gameList(params)
    if (resp && resp.code === 200 && resp.data) {
      const newGames = resp.data.list || []

      if (isLoadMore) {
        gameList.value.push(...newGames)
      } else {
        gameList.value = newGames
        currentPage.value = 1
      }

      const pagination = resp.data.pagination
      hasMore.value = pagination?.has_more || false
      currentPage.value = pagination?.current_page || page
    }
  } catch (error) {
    console.error('获取游戏列表失败:', error)
    showToast('获取游戏列表失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// ==================== 厂商列表相关方法 ====================
async function getSuppliers(categoryCode, page = 1, isLoadMore = false) {
  if (isLoadMore) {
    loadingMore.value = true
  } else {
    loading.value = true
  }

  try {
    const params = {
      category_code: categoryCode,
      page: page,
      limit: 20,
      show_status: 1
    }

    console.log('请求厂商列表:', params)
    const resp = await api.supplierList(params)
    console.log('suppliers resp:', resp)

    if (resp && resp.code === 200 && resp.data) {
      const newSuppliers = resp.data.list || []

      newSuppliers.forEach(supplier => {
        supplier.is_can_run = supplier.run_status
      })

      if (isLoadMore) {
        supplierList.value.push(...newSuppliers)
      } else {
        supplierList.value = newSuppliers
        currentPage.value = 1
      }

      const pagination = resp.data.pagination
      hasMore.value = pagination?.has_more || false
      currentPage.value = pagination?.current_page || page

      console.log('厂商列表加载成功:', {
        count: newSuppliers.length,
        total: supplierList.value.length,
        hasMore: hasMore.value
      })
    } else {
      throw new Error(resp?.message || '获取厂商列表失败')
    }
  } catch (error) {
    console.error('获取厂商列表失败:', error)
    showToast('获取厂商列表失败')
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// ==================== 交互逻辑方法 ====================
async function selectGameHandler(gameItem, idx) {
  if (currentGameType.value?.id === gameItem.id) {
    return
  }

  currentGameType.value = gameItem

  // 清空所有游戏列表
  gameList.value = []
  hotGameList.value = []
  recentGameList.value = []
  favoriteGameList.value = []
  supplierList.value = []

  hasMore.value = true
  currentPage.value = 1

  if (gameItem.game_type === 'HOT') {
    // 切换到热门游戏类型，默认选中热门选项卡
    activeHotTab.value = 'hot'
    await getHotGames(1, false)
  } else {
    await getSuppliers(gameItem.game_type, 1, false)
  }
}

async function loadMore() {
  if (!hasMore.value || loadingMore.value) {
    return
  }

  const nextPage = currentPage.value + 1

  if (isHotGameType.value) {
    // 根据当前选中的选项卡加载更多数据
    switch (activeHotTab.value) {
      case 'hot':
        await getHotGames(nextPage, true)
        break
      case 'recent':
        await getRecentGames(nextPage, true)
        break
      case 'favorite':
        await getFavoriteGames(nextPage, true)
        break
    }
  } else {
    await getSuppliers(currentGameType.value.game_type, nextPage, true)
  }
}

function setupScrollListener() {
  const container = scrollContainer.value
  if (!container) return

  container.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = container
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadMore()
    }
  })
}

// ==================== 游戏和厂商点击处理 ====================
function playGameHandler(gameItem) {
  if (!store.isLogin()) {
    loginHandler()
    return
  }

  // 调试信息：检查游戏数据
  console.log('playGameHandler - 游戏数据:', gameItem)
  console.log('playGameHandler - is_can_run值:', gameItem.is_can_run, '类型:', typeof gameItem.is_can_run)

  // 检查游戏是否可以玩（维护状态判断）
  // 游戏使用 is_can_run 字段：0=不可玩，1=可玩
  if (gameItem.is_can_run === 0 || gameItem.is_can_run === '0' || gameItem.is_can_run === false) {
    console.log('游戏维护中，阻止跳转')
    showToast('游戏维护中')
    return
  }

  // 额外检查：如果字段不存在或值异常，也提示维护
  if (gameItem.is_can_run === undefined || gameItem.is_can_run === null) {
    console.log('游戏状态未知，阻止跳转')
    showToast('游戏状态异常，暂时无法进入')
    return
  }

  try {
    console.log('开始跳转到游戏:', gameItem.game_name)
    router.push({
      name: 'to_game',
      params: {
        game: gameItem.game_code,
        code: gameItem.supplier_code,
        mobile: mobileFunc() ? 1 : 0,
      },
    })
  } catch (error) {
    console.error('游戏跳转失败:', error)
    showToast('游戏启动失败')
  }
}

// ==================== 更新后的 selectSupplierHandler 函数 ====================
function selectSupplierHandler(supplier) {
  if (!store.isLogin()) {
    loginHandler()
    return
  }

  // 调试信息：检查供应商数据
  console.log('selectSupplierHandler - 供应商数据:', supplier)
  console.log('selectSupplierHandler - is_can_run值:', supplier.is_can_run, '类型:', typeof supplier.is_can_run)

  // 检查供应商是否可运行（维护状态判断）
  // 供应商使用 is_can_run 字段：0=不可运行，1=可运行
  if (supplier.is_can_run === 0 || supplier.is_can_run === '0' || supplier.is_can_run === false) {
    console.log('供应商维护中，阻止跳转')
    showToast('该厂商正在维护中')
    return
  }

  // 额外检查：如果字段不存在或值异常，也提示维护
  if (supplier.is_can_run === undefined || supplier.is_can_run === null) {
    console.log('供应商状态未知，阻止跳转')
    showToast('厂商状态异常，暂时无法进入')
    return
  }

  try {
    console.log('开始跳转到供应商:', supplier.name)

    // ✅ 使用新的 supplier_games 路由，直接跳转到供应商游戏页面
    router.push({
      name: 'supplier_games',
      params: {
        supplier_code: supplier.code,
        category_code: supplier.category_code || currentGameType.value?.game_type || 'SLOT'
      },
      query: {
        supplier_name: supplier.name,
        supplier_id: supplier.id,
        currency_code: supplier.currency_code || 'CNY',
        supplier_img: supplier.img_url,
        supplier_desc: supplier.description || '',
        is_can_run: supplier.is_can_run,
        // 传递当前游戏类型信息
        current_game_type_id: currentGameType.value?.id,
        current_game_type_name: currentGameType.value?.title
      }
    })

  } catch (error) {
    console.error('厂商跳转失败:', error)
    showToast('跳转失败')
  }
}

// ==================== 用户相关方法 ====================
function loginHandler() {
  store.$patch({ loginShow: true })
}

function signDailyHandler() {
  console.log('签到功能待实现')
}

function operatHandler(operationType) {
  if (!store.isLogin()) {
    store.$patch({ loginShow: true })
    return
  }

  switch (operationType) {
    case 1:
      router.push({ name: 'deposit' })
      break
    case 2:
      router.push({ name: 'withdraw' })
      break
    case 3:
      router.push({ name: 'vip' })
      break
  }
}

// ==================== Banner相关方法 ====================
async function getBanners() {
  try {
    const resp = await api.bannerList({ group: 'mobile1' })
    if (resp && resp.data && Array.isArray(resp.data)) {
      banners.value = resp.data
      if (banners.value.length >= 1) {
        banners.value.push(resp.data[0])
      }
    }
  } catch (error) {
    console.error('获取Banner失败:', error)
  }
}

// ==================== 用户信息刷新 ====================
async function refreshUserInfo() {
  if (!store.isLogin()) {
    return
  }

  try {
    const resp = await api.getUserInfo()
    if (resp && resp.data) {
      store.setUser(resp.data)

      // 如果当前是热门游戏类型且选中了最近或收藏选项卡，重新加载数据
      if (isHotGameType.value && (activeHotTab.value === 'recent' || activeHotTab.value === 'favorite')) {
        if (activeHotTab.value === 'recent') {
          await getRecentGames(1, false)
        } else if (activeHotTab.value === 'favorite') {
          await getFavoriteGames(1, false)
        }
      }
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// ==================== 初始化方法 ====================
async function init() {
  try {
    store.$patch({ loginShow: false })
    store.loading()

    const promises = [
      getNotices(),
      getBanners(),
      getGameTypes(),
    ]

    await Promise.allSettled(promises)

    const hotGameType = gameTypes.value.find(type => type.game_type === 'HOT')
    if (hotGameType) {
      currentGameType.value = hotGameType
      activeHotTab.value = 'hot'
      await getHotGames(1, false)
    } else if (gameTypes.value.length > 0) {
      const firstType = gameTypes.value[0]
      currentGameType.value = firstType
      if (firstType.game_type === 'HOT') {
        activeHotTab.value = 'hot'
        await getHotGames(1, false)
      } else {
        await getSuppliers(firstType.game_type, 1, false)
      }
    }

    if (store.getUser()) {
      await refreshUserInfo()
    }

    nextTick(() => {
      setupScrollListener()
    })
  } catch (error) {
    console.error('首页初始化失败:', error)
    showToast('页面加载失败，请重试')
  } finally {
    store.stopLoad()
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  init()
})
</script>

<style lang="less" scoped>
.m-main {
  background: var(--color-m-background);
  height: 100vh;
  display: flex;
  flex-direction: column;

  // Banner样式 - 完全参考第一个文件
  .my-swipe {
    height: 140px;
    .van-swipe-item {
      color: var(--m-label-gb);
      font-size: 20px;
      height: 140px;
      text-align: center;
      background-color: #39a9ed;
    }
  }

  // 通知栏样式
  .m-notice {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    background: #fff;
    border-bottom: 1px solid #f0f0f0;
    gap: 10px;

    .m-notice-icon {
      .m-notice-img {
        width: 20px;
        height: 20px;
      }
    }

    .m-notice-content {
      flex: 1;
      height: 24px;
      overflow: hidden;

      .notice-swipe {
        height: 24px;

        .notice-text {
          font-size: 14px;
          color: #666;
          line-height: 24px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  // 用户信息区域样式
  .m-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0 16px;
    color: var(--van-field-label-color);
    background: var(--color-m-background);
    box-shadow: 0 0.08rem 0.32rem 0 rgba(209, 221, 242, 0.4), 0 -0.05333rem 0 0 hsla(0, 0%, 100%, 0.5);
    border-radius: 0 0 0.13333rem 0.13333rem;

    .m-link {
      color: #3ea4f7;
    }
  }

  .m-row {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: 40px;
    font-size: 16px;

    .m-row-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      flex: 1;
      gap: 5px;

      .m-img {
        width: 34px;
        height: 32px;
      }

      .m-label {
        color: var(--m-label-gb);
        font-size: 16px;
      }
    }

    .m-start {
      justify-content: flex-start;
    }

    .m-end {
      justify-content: flex-end;
    }
  }

  .m-user {
    gap: 10px;

    .m-user-level {
      height: 20px;
      background-image: url('../../../assets/mobile/level_bg.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 2px;
      padding: 0 5px;
      justify-content: flex-start;

      .m-img-bg {
        color: #fff;
        font-size: 14px;
      }

      .m-level-txt {
        color: #fff;
        font-size: 14px;
      }
    }

    .m-btn {
      height: 20px;
    }
  }

  // 主内容区域样式
  .m-main-contain {
    display: flex;
    flex-direction: row;
    flex: 1;
    height: calc(100vh - 270px);
    background-color: var(--color-m-background);
    gap: 10px;

    .m-con-left {
      display: flex;
      flex-direction: column;
      width: 70px;
      height: 100%;
      background-color: var(--color-m-background);

      .m-gameNav-container {
        padding-top: 10px;
        padding-bottom: 10px;

        .m-gameNav-item {
          width: 60px;
          height: 67.5px;
          background-image: var(--m-label-gb);
          box-shadow: 0 0.08rem 0.32rem 0 rgba(209, 221, 242, 0.5);
          font-size: 14px;
          transition: 0.35s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          color: var(--m-left-menu-color);

          .m-item-img {
            width: 24px;
            height: 24px;
          }

          .m-item-txt {
            font-size: 10px;
          }
        }

        .active {
          width: 69.5px;
          height: 76.5px;
          color: #fff;
          background-repeat: no-repeat;
          background-size: 100% 100%;
          background-image: url('../../../assets/mobile/nav_active.png');
          box-shadow: none;
        }
      }
    }

    .m-con-right {
      display: flex;
      flex-direction: column;
      flex: 1;

      .m-gameNav-container-list {
        padding: 10px 10px 10px 0px;

        // 热门游戏区域样式
        .m-hot-games-section {
          // 热门游戏选项卡样式
          .m-hot-tabs {
            display: flex;
            background: #fff;
            border-radius: 8px;
            padding: 4px;
            margin-bottom: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

            .m-hot-tab-item {
              flex: 1;
              text-align: center;
              padding: 8px 12px;
              font-size: 14px;
              font-weight: 500;
              color: #666;
              border-radius: 6px;
              transition: all 0.3s ease;
              cursor: pointer;

              &.active {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: #fff;
                box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
              }

              &:hover:not(.active) {
                background: #f5f5f5;
                color: #333;
              }
            }
          }

          // 热门游戏内容区域
          .m-hot-content {
            .m-login-tip {
              display: flex;
              justify-content: center;
              align-items: center;
              padding: 40px 20px;

              .m-login-tip-content {
                text-align: center;
                color: #999;

                p {
                  margin: 12px 0 16px 0;
                  font-size: 14px;
                }
              }
            }
          }
        }

        // 热门游戏列表样式 - 每行3个小图标，1:1比例
        .m-content-games {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: space-between;
          padding: 0 4px;

          .m-game-item {
            position: relative;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: calc(33.333% - 6px); // 每行3个，减去gap
            background: #fff;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            padding: 8px;
            margin-bottom: 8px;

            .m-game-img {
              width: 100%;
              aspect-ratio: 1; // 1:1 比例
              border-radius: 6px;
              margin-bottom: 6px;
              background: #f5f5f5;
            }

            .m-game-name {
              color: #333;
              font-size: 11px;
              text-align: center;
              font-weight: 400;
              line-height: 14px;
              max-width: 100%;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .m-game-tag {
              position: absolute;
              top: 4px;
              right: 4px;
              font-size: 8px;
              color: #fff;
              background: #ff4444;
              border-radius: 8px;
              padding: 2px 4px;
              min-width: 12px;
              text-align: center;
            }

            // 游戏维护状态样式
            .m-game-status {
              position: absolute;
              top: 4px;
              left: 4px;
              font-size: 8px;
              color: #fff;
              background: rgba(255, 0, 0, 0.9);
              border-radius: 8px;
              padding: 2px 4px;
              font-weight: 500;
              z-index: 2;
            }
          }
        }

        // 厂商列表样式 - 每行1个纯大图
        .m-content-suppliers {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 0 4px;

          .m-supplier-item {
            position: relative;
            width: 100%;
            height: 120px; // 增加高度从 80px 到 120px
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

            .m-supplier-img {
              width: 100%;
              height: 100%;
              border-radius: 12px;
            }

            // 供应商名称显示在图片底部中央
            .m-supplier-name {
              position: absolute;
              bottom: 8px;
              left: 50%;
              transform: translateX(-50%);
              font-size: 14px;
              color: #fff;
              background: rgba(0, 0, 0, 0.6);
              border-radius: 6px;
              padding: 4px 8px;
              font-weight: 500;
              z-index: 2;
              max-width: calc(100% - 16px);
              text-align: center;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }

            .m-supplier-status {
              position: absolute;
              top: 8px;
              right: 8px;
              font-size: 10px;
              color: #fff;
              background: rgba(255, 0, 0, 0.9);
              border-radius: 4px;
              padding: 2px 6px;
              font-weight: 500;
              z-index: 2;
            }
          }
        }

        // 加载状态样式
        .m-loading-more {
          width: 100%;
          text-align: center;
          padding: 20px;
          color: #999;
        }

        .m-no-more {
          width: 100%;
          text-align: center;
          padding: 20px;
          color: #999;
          font-size: 14px;
        }

        .m-empty {
          width: 100%;
          text-align: center;
          padding: 40px 20px;
        }
      }
    }

    .m-scroll-wrapper {
      position: relative;
      height: 100%;
      overflow-y: scroll;

      .m-scroll-content {
        position: relative;

        .m-scroll-list-wrapper {
          overflow: hidden;
        }
      }
    }
  }

  .m-main-footer {
    display: flex;
    height: 50px;
  }
}
</style>

<style lang="less">
.m-main {
  ::-webkit-scrollbar {
    display: none !important;
    width: 0 !important;
  }
}
</style>
