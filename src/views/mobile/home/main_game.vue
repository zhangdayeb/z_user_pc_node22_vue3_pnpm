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

    <!-- user -->
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
            >{{ $t('daliySign') }}</van-button
          >
        </div>
        <span
          >${{
            Number(store.getUser()?.money ?? '0.00') <= 0
              ? '0.00'
              : Number(store.getUser()?.money).toFixed(2)
          }}</span
        >
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

    <!-- main -->
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
                  :style="{
                    background:
                      idx > selectIdx
                        ? '-webkit-linear-gradient(90deg, #ccd7ed, #e0e4eb)'
                        : '',
                  }"
                  @click.stop="selectGameHandler(item, idx)"
                >
                  <van-image
                    :src="
                      getImgUrl(
                        currentGameType?.id === item.id
                          ? item.icon_after
                          : item.icon_before,
                      )
                    "
                    class="m-item-img"
                  ></van-image>
                  <div class="m-item-txt">{{ getGameTypeTitle(item) }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧游戏列表 -->
      <div class="m-con-right">
        <div class="m-scroll-wrapper" ref="scrollContainer">
          <div class="m-scroll-content">
            <div class="m-scroll-list-wrapper">
              <div class="m-gameNav-container-list">
                <!-- 热门游戏类型 - 显示选项卡 -->
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
                        class="m-nav-list-item"
                        v-for="(item, idx) in currentGameList"
                        :key="item.id"
                        @click.stop="playGameHandler(item)"
                      >
                        <div class="m-item-img-wrapper">
                          <van-image
                            :src="getImgUrl(item.game_img_url)"
                            class="m-item-img"
                            fit="cover"
                          >
                            <template v-slot:error>
                              <div class="m-img-error">
                                <van-icon name="warning-o" class="m-ico" size="22" />
                              </div>
                            </template>
                          </van-image>
                          <div v-if="item.is_hot_text" class="m-item-tag">{{ getHotText(item) }}</div>
                        </div>
                        <div class="m-item-txt">{{ getGameName(item) }}</div>
                      </div>
                    </div>

                    <!-- 空数据状态 -->
                    <div v-if="currentGameList.length === 0 && !loading && (store.isLogin() || activeHotTab === 'hot')" class="m-empty">
                      <van-empty :description="getEmptyDescription()" />
                    </div>
                  </div>
                </div>

                <!-- 其他游戏类型 - 普通游戏列表 -->
                <div v-else class="m-normal-games-wrapper">
                  <!-- 游戏列表 -->
                  <div
                    class="m-nav-list-item"
                    v-for="(item, idx) in gameList"
                    :key="item.id"
                    @click.stop="playGameHandler(item)"
                  >
                    <div class="m-item-img-wrapper">
                      <van-image
                        :src="getImgUrl(item.game_img_url)"
                        class="m-item-img"
                        fit="cover"
                      >
                        <template v-slot:error>
                          <div class="m-img-error">
                            <van-icon name="warning-o" class="m-ico" size="22" />
                          </div>
                        </template>
                      </van-image>
                      <div v-if="item.is_hot_text" class="m-item-tag">{{ getHotText(item) }}</div>
                    </div>
                    <div class="m-item-txt">{{ getGameName(item) }}</div>
                  </div>

                  <!-- 空数据状态 -->
                  <div v-if="gameList.length === 0 && !loading" class="m-empty">
                    <van-empty :description="$t('noData')" />
                  </div>
                </div>

                <!-- 加载更多状态 -->
                <div v-if="loadingMore" class="m-loading-more">
                  <van-loading>{{ $t('loading') }}</van-loading>
                </div>

                <!-- 没有更多数据 -->
                <div v-else-if="!hasMore && ((isHotGameType && currentGameList.length > 0) || (!isHotGameType && gameList.length > 0))" class="m-no-more">
                  {{ $t('noMore') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <NoticesPop />

    <!-- footer -->
    <div class="m-main-footer"></div>
  </div>
</template>

<script setup lang="ts">
import depositImg from '@/assets/mobile/deposit.png'
import withdrawImg from '@/assets/mobile/withdraw.png'
import vipImg from '@/assets/mobile/home_vip.png'

defineOptions({ name: 'HomeMain' })
import { onMounted, ref, nextTick, computed, watch } from 'vue'
import LanguageVue from './components/language.vue'
import api from '@/api'
import { getImgUrl, mobileFunc } from '@/utils/tools'
import { showToast } from 'vant'
import { useAppStore } from '@/stores/app'
import { useRouter } from 'vue-router'
import NoticesPop from '@/views/mobile/components/notices.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const store = useAppStore()
const { t, locale } = useI18n()

// ==================== 响应式数据 ====================
const banners = ref([])
const gameTypes = ref([])
const currentGameType = ref(null)

// 游戏列表数据 - 分离不同类型的数据
const gameList = ref([])              // 普通游戏类型的游戏列表
const hotGameList = ref([])           // 热门游戏列表
const recentGameList = ref([])        // 最近游戏列表
const favoriteGameList = ref([])      // 收藏游戏列表

const selectIdx = ref(6)
const loading = ref(false)
const loadingMore = ref(false)
const hasMore = ref(true)
const currentPage = ref(1)
const scrollContainer = ref(null)

// 热门游戏选项卡状态
const activeHotTab = ref('hot') // 'hot' | 'recent' | 'favorite'

// ==================== 计算属性 ====================
// 判断当前是否为热门游戏类型
const isHotGameType = computed(() => {
  console.log('isHotGameType check:', {
    currentGameType: currentGameType.value,
    game_type: currentGameType.value?.game_type,
    isHot: currentGameType.value?.game_type === 'HOT'
  })
  return currentGameType.value?.game_type === 'HOT'
})

// 根据当前选中的选项卡返回对应的游戏列表
const currentGameList = computed(() => {
  if (!isHotGameType.value) {
    return []
  }

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

// ==================== 多语言处理方法 ====================
// 获取游戏类型标题（支持多语言）
function getGameTypeTitle(gameType) {
  // 如果有多语言字段，根据当前语言返回
  if (gameType.title_i18n) {
    const titles = gameType.title_i18n
    return titles[locale.value] || titles['zh-CN'] || gameType.title
  }

  // 如果没有多语言字段，尝试使用预定义的翻译key
  const typeKeyMap = {
    'HOT': 'hotGames',
    'SPORTS': 'sportsEvents',
    'LIVE': 'liveCasino',
    'SLOTS': 'electronicGames',
    'CARD': 'cardGames',
    'FISH': 'fishingGames',
    'LOTTERY': 'lotteryGames',
    'dianzi': 'dianzi',
    'zhenren': 'zhenren',
    'tiyu': 'tiyu',
    'lottery': 'lottery',
    'qipai': 'qipai',
    'fishGame': 'fishGame'
  }

  const key = typeKeyMap[gameType.game_type]
  if (key) {
    return t(key)
  }

  // 默认返回原始标题
  return gameType.title
}

// 获取游戏名称（支持多语言）
function getGameName(game) {
  // 如果有多语言字段
  if (game.game_name_i18n) {
    const names = game.game_name_i18n
    return names[locale.value] || names['zh-CN'] || game.game_name
  }

  // 默认返回原始名称
  return game.game_name
}

// 获取热门标签文本（支持多语言）
function getHotText(game) {
  // 如果有多语言的热门标签
  if (game.is_hot_text_i18n) {
    const texts = game.is_hot_text_i18n
    return texts[locale.value] || texts['zh-CN'] || game.is_hot_text
  }

  // 使用默认的热门标签或返回原文本
  if (game.is_hot_text === 'HOT' || game.is_hot_text === '热门') {
    return t('game.hot') || 'HOT'
  }

  return game.is_hot_text
}

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

  // 检查登录状态 - 最近和收藏需要登录
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

// ==================== 游戏类型相关方法 ====================
async function getGameTypes() {
  try {
    const resp = await api.gameTypeList({
      lang: locale.value // 传递当前语言参数
    })
    console.log('game types resp:', resp)

    // 适配后端响应格式：数据在data字段
    if (resp && resp.code === 200 && resp.data) {
      gameTypes.value = resp.data

      // 按权重排序
      gameTypes.value.sort((a, b) => a.sort_weight - b.sort_weight)

      console.log('游戏类型加载成功:', gameTypes.value)
    } else {
      console.warn('游戏类型数据格式异常:', resp)
    }
  } catch (error) {
    console.error('获取游戏类型失败:', error)
    showToast(t('operationFailed'))
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
      limit: 20,
      lang: locale.value // 传递当前语言参数
    }

    console.log('请求热门游戏列表:', params)

    const resp = await api.gameHotList(params)
    console.log('hot games resp:', resp)

    if (resp && resp.code === 200 && resp.data) {
      const newGames = resp.data.list || []

      if (isLoadMore) {
        // 加载更多：追加到现有列表
        hotGameList.value.push(...newGames)
      } else {
        // 新加载：替换列表
        hotGameList.value = newGames
        currentPage.value = 1
      }

      // 更新分页信息
      const pagination = resp.data.pagination
      hasMore.value = pagination?.has_more || false
      currentPage.value = pagination?.current_page || page

      console.log('热门游戏加载成功:', {
        count: newGames.length,
        total: hotGameList.value.length,
        hasMore: hasMore.value
      })
    } else {
      throw new Error(resp?.message || t('game.getHotGamesFailed'))
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
      limit: 20,
      lang: locale.value // 传递当前语言参数
    }

    console.log('请求最近游戏列表:', params)

    const resp = await api.userGameRecentList(params)
    console.log('recent games resp:', resp)

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
    } else {
      throw new Error(resp?.message || t('game.getRecentGamesFailed'))
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
      limit: 20,
      lang: locale.value // 传递当前语言参数
    }

    console.log('请求收藏游戏列表:', params)

    const resp = await api.userGameLoveList(params)
    console.log('favorite games resp:', resp)

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
    } else {
      throw new Error(resp?.message || t('game.getFavoriteGamesFailed'))
    }
  } catch (error) {
    console.error('获取收藏游戏失败:', error)
    showToast(t('game.getFavoriteGamesFailed'))
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// ==================== 普通游戏列表相关方法 ====================
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
      limit: 20,
      lang: locale.value // 传递当前语言参数
    }

    console.log('请求游戏列表:', params)

    const resp = await api.gameList(params)
    console.log('games resp:', resp)

    if (resp && resp.code === 200 && resp.data) {
      const newGames = resp.data.list || []

      if (isLoadMore) {
        // 加载更多：追加到现有列表
        gameList.value.push(...newGames)
      } else {
        // 新类型：替换列表
        gameList.value = newGames
        currentPage.value = 1
      }

      // 更新分页信息
      const pagination = resp.data.pagination
      hasMore.value = pagination?.has_more || false
      currentPage.value = pagination?.current_page || page

      console.log('游戏列表加载成功:', {
        count: newGames.length,
        total: gameList.value.length,
        hasMore: hasMore.value
      })
    } else {
      throw new Error(resp?.message || t('dataLoadFailed'))
    }
  } catch (error) {
    console.error('获取游戏列表失败:', error)
    showToast(t('dataLoadFailed'))
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// ==================== 交互逻辑方法 ====================
async function selectGameHandler(gameItem, idx) {
  console.log('selectGameHandler', gameItem, idx)

  // 权限检查
  if (idx > selectIdx.value) {
    console.log('权限不足，无法切换到此类型')
    return
  }

  // 避免重复切换
  if (currentGameType.value?.id === gameItem.id) {
    console.log('已经是当前类型，无需切换')
    return
  }

  // 更新当前选中类型
  currentGameType.value = gameItem

  // 重置状态
  gameList.value = []
  hotGameList.value = []
  recentGameList.value = []
  favoriteGameList.value = []
  hasMore.value = true
  currentPage.value = 1

  // 根据游戏类型加载对应数据
  if (gameItem.game_type === 'HOT') {
    // 热门游戏类型 - 默认选中热门选项卡
    activeHotTab.value = 'hot'
    await getHotGames(1, false)
  } else {
    // 其他游戏类型 - 加载普通游戏列表
    await getGames(gameItem.game_type, 1, false)
  }
}

// 加载更多游戏
async function loadMoreGames() {
  if (!hasMore.value || loadingMore.value) {
    return
  }

  const nextPage = currentPage.value + 1

  if (isHotGameType.value) {
    // 热门游戏类型 - 根据当前选项卡加载更多
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
    // 其他游戏类型
    await getGames(currentGameType.value.game_type, nextPage, true)
  }
}

// 设置滚动监听
function setupScrollListener() {
  const container = scrollContainer.value

  if (!container) return

  container.addEventListener('scroll', () => {
    const { scrollTop, scrollHeight, clientHeight } = container

    // 距离底部50px时触发加载更多
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      loadMoreGames()
    }
  })
}

// ==================== 游戏相关方法 ====================
function playGameHandler(gameItem) {
  // 登录检查
  if (!store.isLogin()) {
    loginHandler()
    return
  }

  try {
    // 直接使用后端返回的字段跳转
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
    showToast(t('operationFailed'))
  }
}

// ==================== 用户相关方法 ====================
function loginHandler() {
  store.$patch({ loginShow: true })
  console.log('login show', store.getUser(), store.loginShow)
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
    default:
      console.warn('未知的操作类型:', operationType)
  }
}

// ==================== API 调用方法 ====================
async function getNotices() {
  console.log('获取通知 - 待实现')
}

async function getBanners() {
  try {
    const resp = await api.bannerList({
      group: 'mobile1',
      lang: locale.value // 传递当前语言参数
    })
    console.log('banner resp:', resp)

    if (resp && resp.data && Array.isArray(resp.data)) {
      banners.value = resp.data
      // 如果有banner数据，复制第一个用于无缝轮播
      if (banners.value.length >= 1) {
        banners.value.push(resp.data[0])
      }
    } else {
      console.warn('Banner数据格式异常:', resp)
    }
  } catch (error) {
    console.error('获取Banner失败:', error)
    const message = error?.message
    if (message && message.length > 0) {
      showToast(message)
    }
  }
}

async function refreshUserInfo() {
  if (!store.isLogin()) {
    return
  }

  try {
    const resp = await api.getUserInfo()
    console.log('user info resp:', resp)

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
    } else {
      console.warn('用户信息数据格式异常:', resp)
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

// ==================== 初始化方法 ====================
async function init() {
  try {
    // 隐藏登录弹窗
    store.$patch({ loginShow: false })

    // 开始加载
    store.loading()

    // 1. 并行获取基础数据
    const promises = [
      getNotices(),
      getBanners(),
      getGameTypes(),
    ]

    await Promise.allSettled(promises)

    // 2. 默认选择HOT类型 (热门游戏)
    const hotGameType = gameTypes.value.find(type => type.game_type === 'HOT')
    if (hotGameType) {
      currentGameType.value = hotGameType
      activeHotTab.value = 'hot'
      await getHotGames(1, false)
    } else if (gameTypes.value.length > 0) {
      // 如果没有HOT类型，选择第一个类型
      const firstType = gameTypes.value[0]
      currentGameType.value = firstType
      if (firstType.game_type === 'HOT') {
        activeHotTab.value = 'hot'
        await getHotGames(1, false)
      } else {
        await getGames(firstType.game_type, 1, false)
      }
    }

    // 3. 如果用户已登录，获取最新用户信息
    if (store.getUser()) {
      await refreshUserInfo()
    }

    // 4. 设置滚动监听
    nextTick(() => {
      setupScrollListener()
    })

    console.log('首页数据初始化完成')
  } catch (error) {
    console.error('首页初始化失败:', error)
    showToast(t('tryAgainLater'))
  } finally {
    // 停止加载
    store.stopLoad()
  }
}

// ==================== 监听语言变化 ====================
// 当语言改变时，重新加载数据
const currentLocale = computed(() => locale.value)

watch(currentLocale, (newLocale, oldLocale) => {
  if (newLocale !== oldLocale) {
    console.log('语言切换，重新加载数据:', newLocale)

    // 重新获取游戏类型和游戏列表（使用新语言）
    getGameTypes()

    if (currentGameType.value) {
      if (isHotGameType.value) {
        // 热门游戏类型 - 根据当前选项卡重新加载
        switch (activeHotTab.value) {
          case 'hot':
            getHotGames(1, false)
            break
          case 'recent':
            if (store.isLogin()) {
              getRecentGames(1, false)
            }
            break
          case 'favorite':
            if (store.isLogin()) {
              getFavoriteGames(1, false)
            }
            break
        }
      } else {
        // 其他游戏类型
        getGames(currentGameType.value.game_type, 1, false)
      }
    }

    // 重新获取banner
    getBanners()
  }
})

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

  .m-col {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 0 16px;
    color: var(--van-field-label-color);
    background: var(--color-m-background);
    box-shadow:
      0 0.08rem 0.32rem 0 rgba(209, 221, 242, 0.4),
      0 -0.05333rem 0 0 hsla(0, 0%, 100%, 0.5);
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
      background-image: var(--m-label-gb);
      background-repeat: no-repeat;
      background-position: 0 100%;
      background-size: 60px 95%;

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
          display: flex;
          flex-direction: column;

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

            // 热门游戏列表使用双列布局
            .m-content-games {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 10px;
            }
          }
        }

        // 普通游戏类型包装器 - 双列布局
        .m-normal-games-wrapper {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;

          .m-empty {
            grid-column: 1 / -1;
            text-align: center;
            padding: 40px 20px;
          }
        }

        // 游戏卡片样式 - 适用于所有游戏列表
        .m-nav-list-item {
          position: relative;
          display: flex;
          flex-direction: column;
          background: var(--m-main-img-item-bg-color);
          box-shadow: 0 0 0 2px rgb(0 0 0 / 5%);
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
          transition: transform 0.2s ease;

          &:active {
            transform: scale(0.98);
          }

          // 图片容器 - 保持1:1比例
          .m-item-img-wrapper {
            position: relative;
            width: 100%;
            padding-bottom: 100%; // 关键：创建1:1的容器
            background: #f5f5f5;
            overflow: hidden;

            .m-item-img {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;

              // 错误状态
              .m-img-error {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f0f0f0;

                .m-ico {
                  color: #999;
                }
              }
            }

            // 标签定位
            .m-item-tag {
              position: absolute;
              right: 5px;
              top: 5px;
              font-size: 10px;
              color: #fff;
              background: rgba(254, 68, 68, 0.9);
              border-radius: 10px;
              padding: 2px 6px;
              line-height: 1.2;
              font-weight: 500;
              z-index: 1;
            }
          }

          // 文字标题
          .m-item-txt {
            padding: 8px 5px;
            color: var(--m-left-menu-color);
            font-size: 12px;
            line-height: 1.4;
            text-align: center;
            min-height: 32px; // 固定最小高度，确保布局一致
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
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
      overflow-y: auto;
      -webkit-overflow-scrolling: touch; // iOS平滑滚动

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

// 响应式适配 - 小屏幕优化
@media screen and (max-width: 320px) {
  .m-main {
    .m-main-contain {
      .m-con-right {
        .m-gameNav-container-list {
          gap: 8px;

          .m-nav-list-item {
            .m-item-txt {
              font-size: 11px;
              padding: 6px 4px;
            }
          }
        }
      }
    }
  }
}

// 大屏幕限制最大宽度
@media screen and (min-width: 768px) {
  .m-main {
    .m-main-contain {
      .m-con-right {
        .m-gameNav-container-list {
          max-width: 600px;
          margin: 0 auto;
        }
      }
    }
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
