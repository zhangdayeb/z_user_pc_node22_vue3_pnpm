import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * PC端个人中心路由配置
 */

const routes: RouteRecordRaw[] = [
  // ========== 主要页面 ==========
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/pc/mine/index.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/mine',
    name: 'mine',
    component: () => import('@/views/pc/mine/index.vue'),
    meta: { title: '个人中心' }
  },
  {
    path: '/gift',
    name: 'gift',
    component: () => import('@/views/pc/gift/index.vue'),
    meta: { title: '优惠活动' }
  },
  {
    path: '/support',
    name: 'support',
    component: () => import('@/views/pc/support/index.vue'),
    meta: { title: '客服支持' }
  },

  // ========== 账户管理 ==========
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/pc/mine/login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/register/:invite_code?',
    name: 'register',
    component: () => import('@/views/pc/mine/register.vue'),
    meta: { title: '注册' }
  },
  {
    path: '/activity/:id',
    name: 'activity',
    component: () => import('@/views/pc/gift/activity.vue'),
    meta: { title: '活动详情' },
    props: true
  },
  {
    path: '/safeSettings',
    name: 'safeSettings',
    component: () => import('@/views/pc/mine/safeSetting.vue'),
    meta: { title: '安全设置', requiresAuth: true }
  },

  // ========== 财务管理 ==========
  {
    path: '/deposit',
    name: 'deposit',
    component: () => import('@/views/pc/mine/deposit.vue'),
    meta: { title: '充值', requiresAuth: true }
  },
  {
    path: '/withdraw',
    name: 'withdraw',
    component: () => import('@/views/pc/mine/withdraw.vue'),
    meta: { title: '提现', requiresAuth: true }
  },
  {
    path: '/card',
    name: 'card',
    component: () => import('@/views/pc/mine/card.vue'),
    meta: { title: '银行卡管理', requiresAuth: true }
  },

  // ========== VIP相关 ==========
  {
    path: '/vip',
    name: 'vip',
    component: () => import('@/views/pc/mine/vip.vue'),
    meta: { title: 'VIP等级', requiresAuth: true }
  },

  // ========== 密码管理 ==========
  {
    path: '/modifyPwd',
    name: 'modifyPwd',
    component: () => import('@/views/pc/mine/modify_pwd.vue'),
    meta: { title: '修改密码', requiresAuth: true }
  },
  {
    path: '/withdrawalPwd',
    name: 'withdrawalPwd',
    component: () => import('@/views/pc/mine/modify_withdrawal_pwd.vue'),
    meta: { title: '修改提现密码', requiresAuth: true }
  },

  // ========== 记录查询 ==========
  {
    path: '/topUpLog',
    name: 'topUpLog',
    component: () => import('@/views/pc/mine/topUp_log.vue'),
    meta: { title: '充值记录', requiresAuth: true }
  },
  {
    path: '/withdrawLog',
    name: 'withdrawLog',
    component: () => import('@/views/pc/mine/withdraw_log.vue'),
    meta: { title: '提现记录', requiresAuth: true }
  },
  {
    path: '/moneyLog',
    name: 'moneyLog',
    component: () => import('@/views/pc/mine/money_log.vue'),
    meta: { title: '资金记录', requiresAuth: true }
  },
  {
    path: '/gameRecord',
    name: 'gameRecord',
    component: () => import('@/views/pc/mine/game_log.vue'),
    meta: { title: '游戏记录', requiresAuth: true }
  },
  {
    path: '/fanyongRecord',
    name: 'fanyongRecord',
    component: () => import('@/views/pc/mine/fanyong_log.vue'),
    meta: { title: '返佣记录', requiresAuth: true }
  },
  {
    path: '/fanshuiRecord',
    name: 'fanshuiRecord',
    component: () => import('@/views/pc/mine/fanshui_log.vue'),
    meta: { title: '返水记录', requiresAuth: true }
  },
  {
    path: '/dailiRecord',
    name: 'dailiRecord',
    component: () => import('@/views/pc/mine/daili_log.vue'),
    meta: { title: '代理记录', requiresAuth: true }
  },

  // ========== 其他功能 ==========
  {
    path: '/extension',
    name: 'extension',
    component: () => import('@/views/pc/mine/extension.vue'),
    meta: { title: '推广中心', requiresAuth: true }
  },
  {
    path: '/personal',
    name: 'personal',
    component: () => import('@/views/pc/mine/personal.vue'),
    meta: { title: '个人资料', requiresAuth: true }
  },
  {
    path: '/notices',
    name: 'notices',
    component: () => import('@/views/pc/mine/notices.vue'),
    meta: { title: '通知公告' }
  },

  // ========== 404 处理 ==========
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/pc/common/404.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  // 滚动行为
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// ========== 路由守卫 ==========
router.beforeEach(async (to, from, next) => {
  // 设置页面标题
  const defaultTitle = '个人中心'
  document.title = to.meta.title ? `${to.meta.title} - ${defaultTitle}` : defaultTitle

  // 从localStorage获取token判断登录状态
  const token = localStorage.getItem('access_token')
  const isAuthenticated = !!token

  // 需要认证的路由
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 保存原本要访问的路由
    next({
      path: '/login',
      query: { redirect: to.fullPath }
    })
    return
  }

  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
})

// 导出路由实例
export default router
