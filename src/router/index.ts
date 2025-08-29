import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * PC端个人中心路由配置
 * 基于现有文件结构，逐步迁移
 */

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/pc/home/index.vue'),
    redirect: '/main',
    children: [
      // 主页
      {
        name: 'main',
        path: '/main',
        component: () => import('@/views/pc/mine/index.vue'), // 暂时使用现有的mine/index作为主页
        meta: { title: '个人中心' }
      },
      // 优惠活动
      {
        name: 'gift',
        path: '/gift',
        component: () => import('@/views/pc/gift/index.vue'),
        meta: { title: '优惠活动' }
      },
      // 客服支持
      {
        name: 'support',
        path: '/support',
        component: () => import('@/views/pc/support/index.vue'),
        meta: { title: '客服支持' }
      },
      // 个人中心
      {
        name: 'mine',
        path: '/mine',
        component: () => import('@/views/pc/mine/index.vue'),
        meta: { title: '我的账户' }
      }
    ]
  },

  // ========== 账户管理相关页面 ==========
  {
    path: '/register/:invite_code?',
    name: 'register',
    component: () => import('@/views/pc/mine/register.vue'),
    meta: { title: '注册' }
  },
  {
    name: 'activity',
    path: '/activity/:id',
    component: () => import('@/views/pc/gift/activity.vue'),
    meta: { title: '活动详情' },
    props: true
  },
  {
    name: 'safeSettings',
    path: '/safeSettings',
    component: () => import('@/views/pc/mine/safeSetting.vue'),
    meta: { title: '安全设置', requiresAuth: true }
  },

  // ========== 财务管理 ==========
  {
    name: 'deposit',
    path: '/deposit',
    component: () => import('@/views/pc/mine/deposit.vue'),
    meta: { title: '充值', requiresAuth: true }
  },
  {
    name: 'withdraw',
    path: '/withdraw',
    component: () => import('@/views/pc/mine/withdraw.vue'),
    meta: { title: '提现', requiresAuth: true }
  },
  {
    name: 'card',
    path: '/card',
    component: () => import('@/views/pc/mine/card.vue'),
    meta: { title: '银行卡管理', requiresAuth: true }
  },
  {
    name: 'transfer',
    path: '/transfer',
    component: () => import('@/views/pc/mine/transfer.vue'),
    meta: { title: '转账', requiresAuth: true }
  },

  // ========== VIP相关 ==========
  {
    name: 'vip',
    path: '/vip',
    component: () => import('@/views/pc/mine/vip.vue'),
    meta: { title: 'VIP等级', requiresAuth: true }
  },
  {
    name: 'vipDetail',
    path: '/vipDetail',
    component: () => import('@/views/pc/mine/vip_detail.vue'),
    meta: { title: 'VIP详情', requiresAuth: true }
  },

  // ========== 密码管理 ==========
  {
    name: 'modifyPwd',
    path: '/modifyPwd',
    component: () => import('@/views/pc/mine/modify_pwd.vue'),
    meta: { title: '修改密码', requiresAuth: true }
  },
  {
    name: 'withdrawalPwd',
    path: '/withdrawalPwd',
    component: () => import('@/views/pc/mine/modify_withdrawal_pwd.vue'),
    meta: { title: '修改提现密码', requiresAuth: true }
  },

  // ========== 记录查询 ==========
  {
    name: 'topUpLog',
    path: '/topUpLog',
    component: () => import('@/views/pc/mine/topUp_log.vue'),
    meta: { title: '充值记录', requiresAuth: true }
  },
  {
    name: 'withdrawLog',
    path: '/withdrawLog',
    component: () => import('@/views/pc/mine/withdraw_log.vue'),
    meta: { title: '提现记录', requiresAuth: true }
  },
  {
    name: 'moneyLog',
    path: '/moneyLog',
    component: () => import('@/views/pc/mine/money_log.vue'),
    meta: { title: '资金记录', requiresAuth: true }
  },
  {
    name: 'gameRecord',
    path: '/gameRecord',
    component: () => import('@/views/pc/mine/game_log.vue'),
    meta: { title: '游戏记录', requiresAuth: true }
  },
  {
    name: 'fanyongRecord',
    path: '/fanyongRecord',
    component: () => import('@/views/pc/mine/fanyong_log.vue'),
    meta: { title: '返佣记录', requiresAuth: true }
  },
  {
    name: 'fanshuiRecord',
    path: '/fanshuiRecord',
    component: () => import('@/views/pc/mine/fanshui_log.vue'),
    meta: { title: '返水记录', requiresAuth: true }
  },
  {
    name: 'dailiRecord',
    path: '/dailiRecord',
    component: () => import('@/views/pc/mine/daili_log.vue'),
    meta: { title: '代理记录', requiresAuth: true }
  },

  // ========== 其他功能 ==========
  {
    name: 'extension',
    path: '/extension',
    component: () => import('@/views/pc/mine/extension.vue'),
    meta: { title: '推广中心', requiresAuth: true }
  },
  {
    name: 'personal',
    path: '/personal',
    component: () => import('@/views/pc/mine/personal.vue'),
    meta: { title: '个人资料', requiresAuth: true }
  },
  {
    name: 'collection',
    path: '/collection',
    component: () => import('@/views/pc/mine/collection.vue'),
    meta: { title: '我的收藏', requiresAuth: true }
  },
  {
    name: 'notices',
    path: '/notices',
    component: () => import('@/views/pc/mine/notices.vue'),
    meta: { title: '通知公告' }
  },

  // ========== 404 处理 ==========
  {
    path: '/:pathMatch(.*)*',
    name: 'notFound',
    component: () => import('@/views/pc/common/404.vue').catch(() => {
      // 如果404页面不存在，使用一个简单的内联组件
      return {
        template: `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh;">
            <h1 style="font-size: 72px; margin: 0; color: #909399;">404</h1>
            <p style="font-size: 20px; margin: 20px 0; color: #909399;">页面不存在</p>
            <a href="/" style="color: #409EFF; text-decoration: none;">返回首页</a>
          </div>
        `
      }
    })
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

  // 从localStorage或store获取token判断登录状态
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  // 需要认证的路由
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 保存原本要访问的路由
    next({
      path: '/register',
      query: { redirect: to.fullPath }
    })
    return
  }

  next()
})

// 路由错误处理
router.onError((error) => {
  console.error('路由错误:', error)
  // 可以在这里添加错误上报逻辑
})

// 导出路由实例
export default router
