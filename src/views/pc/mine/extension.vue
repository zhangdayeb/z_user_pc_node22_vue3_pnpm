<template>
  <div class="pc-extension">
    <!-- PC端头部 -->
    <div class="pc-header">
      <el-button
        type="primary"
        :icon="ArrowLeft"
        @click="onClickLeft"
        class="back-btn"
      >
        {{ $t('common.back') }}
      </el-button>
      <h2 class="page-title">{{ $t('mine.tuiguanG') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <div class="content-wrapper">
        <!-- 用户信息卡片 -->
        <div class="user-info-card">
          <div class="card-header">
            <el-icon class="header-icon"><User /></el-icon>
            <h3>{{ $t('mine.baseInfo') }}</h3>
          </div>
          <div class="user-details">
            <div class="user-id">ID: {{ userInfo?.id }}</div>
          </div>
        </div>

        <!-- 邀请码卡片 -->
        <div class="invite-code-card">
          <div class="card-header">
            <el-icon class="header-icon"><Ticket /></el-icon>
            <h3>{{ $t('extension.myInviteCode') }}</h3>
          </div>
          <div class="invite-code-content">
            <div class="invite-code-display">
              <div class="invite-code">
                {{ userInfo?.inviteCode || $t('extension.loading') }}
              </div>
              <el-button
                type="primary"
                :loading="copyingCode"
                @click="copyInviteCode"
                class="copy-btn"
              >
                <el-icon><DocumentCopy /></el-icon>
                {{ $t('extension.copyInviteCode') }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 推广链接卡片 -->
        <div class="promotion-link-card">
          <div class="card-header">
            <el-icon class="header-icon"><Link /></el-icon>
            <h3>{{ $t('extension.promotionLink') }}</h3>
          </div>
          <div class="link-content">
            <div class="link-text">{{ promotionLink }}</div>
            <el-button
              type="primary"
              :loading="copyingLink"
              @click="copyPromotionLink"
              class="copy-link-btn"
            >
              <el-icon><DocumentCopy /></el-icon>
              {{ $t('extension.copyLink') }}
            </el-button>
          </div>
        </div>

        <!-- 分享操作卡片 -->
        <div class="share-action-card">
          <div class="card-header">
            <el-icon class="header-icon"><Share /></el-icon>
            <h3>{{ $t('extension.sharePromotionLink') }}</h3>
          </div>
          <div class="share-content">
            <el-button
              type="success"
              size="large"
              @click="sharePromotion"
              class="share-btn"
            >
              <el-icon><Share /></el-icon>
              {{ $t('extension.sharePromotionLink') }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Ticket, Link, Share, DocumentCopy } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { userApi } from '@/api'

defineOptions({ name: 'PcExtensionVue' })

// 用户信息类型
interface UserInfo {
  id: string | number
  username?: string
  nickname?: string
  avatar?: string
  inviteCode?: string
}

const router = useRouter()
const { t } = useI18n()

// 响应式数据
const userInfo = ref<UserInfo | null>(null)
const copyingCode = ref(false)
const copyingLink = ref(false)

// 计算推广链接
const promotionLink = computed(() => {
  if (!userInfo.value?.inviteCode) return ''

  const currentDomain = window.location.origin
  return `${currentDomain}/register?invite=${userInfo.value.inviteCode}`
})

// 返回
function onClickLeft() {
  router.back()
}

// 复制邀请码
async function copyInviteCode() {
  if (!userInfo.value?.inviteCode) {
    ElMessage.warning(t('extension.inviteCodeNotExist'))
    return
  }

  copyingCode.value = true
  try {
    await navigator.clipboard.writeText(userInfo.value.inviteCode)
    ElMessage.success(t('extension.inviteCodeCopied'))
  } catch (err) {
    // 兼容性处理
    const textArea = document.createElement('textarea')
    textArea.value = userInfo.value.inviteCode
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success(t('extension.inviteCodeCopied'))
  } finally {
    copyingCode.value = false
  }
}

// 复制推广链接
async function copyPromotionLink() {
  if (!promotionLink.value) {
    ElMessage.warning(t('extension.promotionLinkGenerating'))
    return
  }

  copyingLink.value = true
  try {
    await navigator.clipboard.writeText(promotionLink.value)
    ElMessage.success(t('extension.promotionLinkCopied'))
  } catch (err) {
    // 兼容性处理
    const textArea = document.createElement('textarea')
    textArea.value = promotionLink.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    ElMessage.success(t('extension.promotionLinkCopied'))
  } finally {
    copyingLink.value = false
  }
}

// 分享推广
function sharePromotion() {
  if (navigator.share) {
    navigator.share({
      title: t('extension.inviteToRegister'),
      text: t('extension.comeToRegister'),
      url: promotionLink.value
    }).catch(err => {
      // 降级到复制链接
      copyPromotionLink()
    })
  } else {
    // 不支持原生分享，直接复制链接
    copyPromotionLink()
  }
}

// 获取用户信息
async function fetchUserInfo() {
  try {
    const response = await userApi.getUserInfo()

    if (response && response.data) {
      userInfo.value = {
        id: response.data.id,
        username: response.data.name,
        nickname: response.data.nick_name,
        avatar: response.data.avatar,
        inviteCode: response.data.invite_code || generateInviteCode(response.data.id)
      }
    } else {
      throw new Error(t('extension.getUserInfoFailed'))
    }
  } catch (error) {
    ElMessage.error(t('extension.getUserInfoFailed'))
  }
}

// 生成邀请码（如果接口没有返回）
function generateInviteCode(userId: string | number): string {
  // 简单的邀请码生成逻辑，实际应该由后端生成
  const base = userId.toString().padStart(6, '0')
  return `INV${base}`
}

// 组件挂载时获取用户信息
onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.pc-extension {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding: 20px;
}

.pc-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
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
  max-width: 800px;
  margin: 0 auto;
}

.content-wrapper {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 卡片通用样式 */
.user-info-card,
.invite-code-card,
.promotion-link-card,
.share-action-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e4e7ed;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f2f5;
}

.header-icon {
  font-size: 20px;
  color: #409eff;
  margin-right: 12px;
}

.card-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 用户信息卡片 */
.user-details {
  margin-top: 16px;
}

.user-id {
  font-size: 14px;
  color: #999;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e9ecef;
}

/* 邀请码卡片 */
.invite-code-content {
  text-align: center;
}

.invite-code-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.invite-code {
  font-size: 28px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 4px;
  padding: 20px 30px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 2px dashed #409eff;
  min-width: 200px;
  font-family: 'Courier New', monospace;
}

.copy-btn {
  padding: 12px 24px;
  font-size: 14px;
}

/* 推广链接卡片 */
.link-content {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.link-text {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  word-break: break-all;
  border: 1px solid #e9ecef;
  font-family: 'Courier New', monospace;
}

.copy-link-btn {
  align-self: flex-start;
}

/* 分享操作卡片 */
.share-content {
  text-align: center;
}

.share-btn {
  padding: 14px 32px;
  font-size: 16px;
  border-radius: 8px;
  width: 100%;
  max-width: 300px;
}
</style>
