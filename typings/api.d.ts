export interface ConfigParams {
  group: string
  url: string
  is_mobile: number
  lang: string
}

export interface SiteConfig {
  system_maintenance_message: string
  site_title: string
  site_keyword: string
  site_name: string
}

export interface PaymentItemParams {
  bank_type: string
  bank_address: string
  bank_type_text: string
}
export interface ApiPaymentItem {
  id: number
  account: string
  name: string
  desc: string
  type: string
  qrcode: string
  memo: string
  params: PaymentItemParams
  rate: string
  min: number
  max: number
  is_open: number
  lang: number
  created_at: string
  updated_at: string
  remark_code: number
  type_text: string
}

export interface ApiMemberBank {
  id: number
  member_id: number
  card_no: string
  bank_type: string
  phone: string | null
  owner_name: string
  bank_address: string
  remark: string
  created_at: string
  updated_at: string
  url: string
  bank_type_text: string
}

export interface ApiUser {
  agent_id: number
  created_at: string
  deleted_at?: string
  email?: string
  facebook?: string
  money_rebate: number
  gender: number
  has_qk_pwd: boolean
  id: number
  invite_code: string
  is_demo: number
  is_in_on: number
  is_tips_on: number
  is_trans_on: number
  lang: string
  level: number
  level_name: string
  line?: string
  ml_money: string
  money: number
  name: string
  nickname: string
  phone?: string
  qq?: string
  realname: string
  register_area: string
  register_ip: string
  register_site: string
  score: string
  status: number
  top_id: number
  total_credit: string
  total_money: string
  updated_at: string
  used_credit: string
}

export interface ApiLevel {
  bet_money: string
  created_at: string
  credit_bonus: string
  day_bonus: string
  deposit_money: string
  id: number
  lang: string
  level: number
  level_bonus: string
  level_name: string
  levelup_type: number
  month_bonus: string
  updated_at: string
  week_bonus: string
  year_bonus: string
}

export interface ApiMemberLevels {
  day_bonus: string
  level_bonus: string
  month_bonus: string
  week_bonus: string
  year_bonus: string
}
export interface ApiVips {
  levels: ApiLevel[]
  levelup_types: string[]
  member_levels: ApiMemberLevels
  total_bet: number
  total_deposit: number
}

export interface ApiOperateType {
  key: number
  value: string
}
export interface ApiStatistic {
  sum_money: number
  valid_money: number
}
export interface ApiGameStatistic {
  sum_bet_amount: number
  sum_valid_bet_amount: number
  sum_net_amount: number
}

export interface ApiMoneyLogItem {
  id: number
  member_id: number
  money: string
  money_before: string
  money_after: string
  money_type: string
  number_type: number
  operate_type: number
  user_id: number
  model_name: string
  model_id: number
  description: string
  remark: string
  created_at: string
  updated_at: string
  deleted_at: null
  operate_type_text: string
  money_type_text: string
}

export interface ApiGameType {
  isLobbyPage: boolean
  key: number
  value: string
}

export interface ApiResp<T = object> {
  code: number
  status: string
  message: string
  data?: T
}

export interface ApiPageData<T = object> {
  current_page?: number
  total?: number
  data: T
}

export interface ApiWallet {
  api_name: string
  api_title: string
  money: string
  wallet_type: number
  loading: boolean
}
export interface ApiMoneiesResp<T = object> {
  api_moneys?: T[]
}

export interface ApiCollectGame {
  api_name: string
  client_type: number
  created_at: string
  en_name: string
  full_image_url: string
  game_code: string
  game_type: number
  id: number
  img_path?: string
  img_url: string
  is_open: number
  name: string
  param_remark: string
  platform: string
  tags: string
  updated_at: string
  weight: number
}

export interface ApiRead {
  content: string
  created_at: string
  deleted_at?: string
  format_created_at: string
  id: number
  is_read: number
  parent?: number
  pid: number
  title: string
  url: string
  user_id: number
}

export interface ApiMoneyRespData {
  is_trans_on: number
  money_info: ApiWallet[]
}

export interface ApiNotice {
  title: string
  content: string
  url?: string
  type: string
}

export interface gameType {
  id: number
  title: string
  subtitle: string
  web_pic: string
  mobile_pic: string
  logo_url: string
  api_name: string
  class_name: string
  game_type: number
  params: string
  is_open: number
  weight: number
  client_type: number
  tags: string
  remark: string
  lang_json: string
  lang: string
  created_at: string
  updated_at: string
  icon_url: string
}
export interface gameInfo {
  id: number
  api_name: string
  name: string
  en_name: string | null
  game_type: number
  game_code: string
  img_path: string | null
  img_url: string
  client_type: number
  platform: string
  param_remark: string
  is_open: number
  weight: number
  tags: string
  created_at: string
  updated_at: string
  full_image_url: string
  api: {
    api_name: string
    api_title: string
  }
}

export interface AdminConf {
  service_skype: string
  service_telegram: string
  service_logo_link: string
  site_email: string
}

export interface About {
  id: number
  title: string
  weight: number
  type: number
  lang: string
  type_text: string
}

export interface ApiBanner {
  dimensions: string
  groups: string
  is_new_window: number
  jump_link: string
  title: string
  url: string
  weight: number
}
