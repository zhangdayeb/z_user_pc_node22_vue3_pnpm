<template>
  <div class="pc-extension">
    <!-- PC端头部 -->
    <div class="pc-header">
      <el-button
        type="primary"
        :icon="ArrowLeft"
        @click="handleBack"
        class="back-btn"
      >
        {{ t('common.back') }}
      </el-button>
      <h2 class="page-title">{{ t('mine.promotion') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 用户信息 -->
      <div class="info-section">
        <h3 class="section-title">{{ t('mine.baseInfo') }}</h3>
        <div class="user-info">
          <div class="info-item">
            <span class="info-label">
              <el-icon><User /></el-icon>
              {{ t('extension.userId') }}
            </span>
            <span class="info-value">{{ userInfo?.id || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 邀请码 -->
      <div class="info-section">
        <h3 class="section-title">{{ t('extension.myInviteCode') }}</h3>
        <div class="invite-code-wrapper">
          <div class="invite-code-display">
            <div class="invite-code">
              {{ userInfo?.inviteCode || t('extension.loading') }}
            </div>
            <el-button
              type="primary"
              :loading="copyingCode"
              @click="copyInviteCode"
              class="copy-btn"
              :icon="DocumentCopy"
            >
              {{ t('extension.copyInviteCode') }}
            </el-button>
          </div>
        </div>
      </div>

      <!-- 推广链接 -->
      <div class="info-section">
        <h3 class="section-title">{{ t('extension.promotionLink') }}</h3>
        <div class="link-wrapper">
          <div class="link-display">
            <el-input
              :model-value="promotionLink"
              readonly
              class="link-input"
            >
              <template #append>
                <el-button
                  type="primary"
                  :loading="copyingLink"
                  @click="copyPromotionLink"
                  :icon="DocumentCopy"
                >
                  {{ t('extension.copyLink') }}
                </el-button>
              </template>
            </el-input>
          </div>
        </div>
      </div>

      <!-- 分享操作 -->
      <div class="info-section">
        <h3 class="section-title">{{ t('extension.sharePromotionLink') }}</h3>
        <div class="share-actions">
          <el-button
            type="success"
            size="large"
            @click="sharePromotion"
            class="share-btn"
            :icon="Share"
          >
            {{ t('extension.sharePromotionLink') }}
          </el-button>
        </div>
      </div>

      <!-- 推广说明 -->
      <div class="info-section">
        <h3 class="section-title">{{ t('extension.promotionInstructions') }}</h3>
        <el-alert
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul class="promotion-tips">
              <li>{{ t('extension.tip1') }}</li>
              <li>{{ t('extension.tip2') }}</li>
              <li>{{ t('extension.tip3') }}</li>
              <li>{{ t('extension.tip4') }}</li>
            </ul>
          </template>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, User, Share, DocumentCopy } from '@element-plus/icons-vue'
import { userApi } from '@/api'

defineOptions({ name: 'PcExtension' })

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
function handleBack() {
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
  max-width: 1200px;
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
  background-color: #fff;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.info-section {
  margin-bottom: 32px;
}

.info-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 20px 0;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 3px;
  width: 3px;
  height: 14px;
  background-color: #4290ff;
  border-radius: 2px;
}

.user-info {
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.info-label .el-icon {
  font-size: 16px;
  color: #909399;
}

.info-value {
  font-size: 14px;
  color: #303133;
  font-family: monospace;
}

.invite-code-wrapper {
  text-align: center;
}

.invite-code-display {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.invite-code {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  letter-spacing: 6px;
  padding: 24px 32px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border-radius: 12px;
  border: 2px dashed #409eff;
  font-family: 'Courier New', monospace;
  min-width: 240px;
}

.copy-btn {
  padding: 12px 24px;
  font-size: 14px;
}

.link-wrapper {
  margin-top: 8px;
}

.link-display {
  max-width: 600px;
}

.link-input :deep(.el-input__wrapper) {
  border-radius: 6px 0 0 6px;
}

.link-input :deep(.el-input-group__append) {
  border-radius: 0 6px 6px 0;
  padding: 0;
  border-left: none;
}

.link-input :deep(.el-input-group__append .el-button) {
  border-radius: 0 6px 6px 0;
  border-left: 1px solid #dcdfe6;
}

.share-actions {
  text-align: center;
}

.share-btn {
  min-width: 200px;
  padding: 16px 32px;
  font-size: 16px;
  border-radius: 8px;
}

.promotion-tips {
  margin: 12px 0 0 0;
  padding-left: 20px;
  list-style: none;
}

.promotion-tips li {
  position: relative;
  margin-bottom: 8px;
  line-height: 1.6;
  color: #606266;
  font-size: 14px;
}

.promotion-tips li:before {
  content: '•';
  position: absolute;
  left: -16px;
  color: #409eff;
}

.promotion-tips li:last-child {
  margin-bottom: 0;
}

/* Element Plus 样式覆盖 */
.pc-extension :deep(.el-alert) {
  border-radius: 6px;
}

@media (min-width: 1600px) {
  .pc-extension {
    max-width: 1400px;
  }
}
</style>
