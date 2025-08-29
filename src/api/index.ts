import { request } from '@/utils/http'
import type { AxiosResponse } from 'axios'

// 基础API类型定义
type ApiFunction = (params?: object) => Promise<AxiosResponse>

interface Api {
  [key: string]: ApiFunction
}

// ========================= 统一API对象 =========================
const api: Api = {
  // ========== 系统配置模块 ==========
  // 系统配置获取
  sysConfig: (params = {}) =>
    request.get('/config/sys_config', { params }),

  // 验证码获取
  authCaptcha: (params = {}) =>
    request.get('/config/auth_captcha', { params }),

  // ========== 信息展示模块 ==========
  // VIP等级信息
  vipLevel: (params = {}) =>
    request.get('/info/vip_level', { params }),

  // 公告通知
  notices: (params = {}) =>
    request.get('/info/notices', { params }),

  // 活动类型列表
  activityTypeList: (params = {}) =>
    request.get('/info/activity_type_list', { params }),

  // 活动列表
  activityList: (params = {}) =>
    request.get('/info/activity_list', { params }),

  // 活动详情
  activityDetail: (params = {}) =>
    request.get('/info/activity_detail', { params }),

  // 文章类型列表
  articleTypeList: (params = {}) =>
    request.get('/info/article_type_list', { params }),

  // 文章列表
  articleList: (params = {}) =>
    request.get('/info/article_list', { params }),

  // 文章详情
  articleDetail: (params = {}) =>
    request.get('/info/article_detail', { params }),

  // 图片上传 - 使用POST方法
  uploadImg: (formData) =>
    request.post('/info/upload', formData),

  // 多图片上传 - 新增接口
  uploadMultipleImg: (formData) =>
    request.post('/info/upload_multiple_img', formData),

  // ========== 游戏模块 ==========
  // 游戏类型列表
  gameTypeList: (params = {}) =>
    request.get('/game/game_type_list', { params }),

  // 游戏列表
  gameList: (params = {}) =>
    request.get('/game/game_list', { params }),

  // 热门游戏列表 - 新增接口
  gameHotList: (params = {}) =>
    request.get('/game/game_hot_list', { params }),

  // 供应商列表
  supplierList: (params = {}) =>
    request.get('/game/supplier_list', { params }),

  // Banner列表
  bannerList: (params = {}) =>
    request.get('/game/banner_list', { params }),

  // 获取游戏URL
  gameUrl: (params = {}) =>
    request.get('/game/game_url', { params }),

  // 游戏配置
  gameConfig: (params = {}) =>
    request.get('/game/game_config', { params }),

  // 根据名称获取配置
  getConfigByName: (params = {}) =>
    request.get('/game/get_config_by_name', { params }),

  // ========== 用户模块 ==========
  // 用户登录 - 使用GET方法（根据路由文件）
  login: (params = {}) =>
    request.get('/user/login', { params }),
  // tg 用户自动登录
  tglogin: (params = {}) =>
    request.get('/user/tglogin', { params }),

  // 用户注册 - 使用GET方法（根据路由文件）
  register: (params = {}) =>
    request.get('/user/register', { params, noNeedTip: true }),

  // 用户退出 - 使用GET方法（根据路由文件）
  logout: (params = {}) =>
    request.get('/user/out', { params }),

  // 修改登录密码 - 使用GET方法（根据路由文件）
  updatePassword: (params = {}) =>
    request.get('/user/update_pwd', { params }),

  // 修改提现密码 - 使用GET方法（根据路由文件）
  updateWithdrawPassword: (params = {}) =>
    request.get('/user/update_withdraw_pwd', { params }),

  // 更新用户信息 - 使用GET方法（根据路由文件）
  updateUserInfo: (params = {}) =>
    request.get('/user/update_user_info', { params }),

  // 获取用户信息
  getUserInfo: (params = {}) =>
    request.get('/user/user_info', { params }),

  // 用户最近游戏列表 - 新增接口
  userGameRecentList: (params = {}) =>
    request.get('/user/user_game_recent_list', { params }),

  // 用户收藏游戏列表 - 新增接口
  userGameLoveList: (params = {}) =>
    request.get('/user/user_game_love_list', { params }),

  // 添加最近游戏 - 新增接口
  userGameRecentAdd: (params = {}) =>
    request.get('/user/user_game_recent_add', { params }),

  // 添加收藏游戏 - 新增接口
  userGameLoveAdd: (params = {}) =>
    request.get('/user/user_game_love_add', { params }),

  // 删除最近游戏 - 新增接口
  userGameRecentDel: (params = {}) =>
    request.get('/user/user_game_recent_del', { params }),

  // 删除收藏游戏 - 新增接口
  userGameLoveDel: (params = {}) =>
    request.get('/user/user_game_love_del', { params }),

  // ========== 财务模块 ==========
  // 充值信息获取
  topUpInfo: (params = {}) =>
    request.get('/money/top_up_info', { params }),

  // 充值 - 使用GET方法（根据路由文件）
  topUp: (params = {}) =>
    request.get('/money/top_up', { params }),

  // 提现 - 使用GET方法（根据路由文件）
  withdraw: (params = {}) =>
    request.get('/money/withdraw', { params }),

  // 充值记录
  topUpRecord: (params = {}) =>
    request.get('/money/top_up_record', { params }),

  // 资金记录 - 新增接口
  moneyRecord: (params = {}) =>
    request.get('/money/money_record', { params }),

  // 提现记录
  withdrawRecord: (params = {}) =>
    request.get('/money/withdraw_record', { params }),

  // 银行卡添加 - 使用GET方法（根据路由文件）
  addAccount: (params = {}) =>
    request.get('/money/account_add', { params }),

  // 银行卡编辑 - 使用GET方法（根据路由文件）
  editAccount: (params = {}) =>
    request.get('/money/account_edit', { params }),

  // 银行卡详情
  accountDetail: (params = {}) =>
    request.get('/money/account_detail', { params }),

  // 银行卡设置默认 - 使用GET方法（根据路由文件）
  setDefaultAccount: (params = {}) =>
    request.get('/money/account_set_default', { params }),

  // 银行卡列表
  accountList: (params = {}) =>
    request.get('/money/account_list', { params }),

  // 游戏记录
  gameRecord: (params = {}) =>
    request.get('/money/game_record', { params }),

  // 返水记录
  fanshuiRecord: (params = {}) =>
    request.get('/money/fanshui_record', { params }),

  // 返佣记录
  fanyongRecord: (params = {}) =>
    request.get('/money/fanyong_record', { params }),

  // 代理列表
  dailiRecord: (params = {}) =>
    request.get('/money/daili_record', { params }),

  // 代理比例调整
  dailiEdit: (params = {}) =>
    request.get('/money/daili_edit', { params }),

  dailiAddMemberMoney: (params = {}) =>
    request.get('/money/daili_add_memeber_money', { params }),

  // ========== 团队模块 ==========
  // 团队信息
  teamInfo: (params = {}) =>
    request.get('/team/info', { params }),
}

// ========================= 分模块导出 =========================
export const configApi = {
  sysConfig: api.sysConfig,
  authCaptcha: api.authCaptcha,
}

export const infoApi = {
  vipLevel: api.vipLevel,
  notices: api.notices,
  activityTypeList: api.activityTypeList,
  activityList: api.activityList,
  activityDetail: api.activityDetail,
  articleTypeList: api.articleTypeList,
  articleList: api.articleList,
  articleDetail: api.articleDetail,
  uploadImg: api.uploadImg,
  uploadMultipleImg: api.uploadMultipleImg, // 新增
}

export const gameApi = {
  gameTypeList: api.gameTypeList,
  gameList: api.gameList,
  gameHotList: api.gameHotList, // 新增
  supplierList: api.supplierList,
  bannerList: api.bannerList,
  gameUrl: api.gameUrl,
  gameConfig: api.gameConfig,
  getConfigByName: api.getConfigByName,
}

export const userApi = {
  login: api.login,
  register: api.register,
  logout: api.logout,
  updatePassword: api.updatePassword,
  updateWithdrawPassword: api.updateWithdrawPassword,
  updateUserInfo: api.updateUserInfo,
  getUserInfo: api.getUserInfo,
  userGameRecentList: api.userGameRecentList, // 新增
  userGameLoveList: api.userGameLoveList, // 新增
  userGameRecentAdd: api.userGameRecentAdd, // 新增
  userGameLoveAdd: api.userGameLoveAdd, // 新增
  userGameRecentDel: api.userGameRecentDel, // 新增
  userGameLoveDel: api.userGameLoveDel, // 新增
}

export const moneyApi = {
  topUpInfo: api.topUpInfo,
  topUp: api.topUp,
  withdraw: api.withdraw,
  topUpRecord: api.topUpRecord,
  moneyRecord: api.moneyRecord, // 新增
  withdrawRecord: api.withdrawRecord,
  addAccount: api.addAccount,
  editAccount: api.editAccount,
  accountDetail: api.accountDetail,
  setDefaultAccount: api.setDefaultAccount,
  accountList: api.accountList,
  gameRecord: api.gameRecord,
  fanshuiRecord: api.fanshuiRecord,
  fanyongRecord: api.fanyongRecord,
  dailiRecord: api.dailiRecord,
  dailiEdit: api.dailiEdit,
  dailiAddMemberMoney: api.dailiAddMemberMoney,
}

export const teamApi = {
  teamInfo: api.teamInfo,
}

// ========================= 类型导出 =========================
export type { Api, ApiFunction }

// ========================= 默认导出 =========================
export default api
