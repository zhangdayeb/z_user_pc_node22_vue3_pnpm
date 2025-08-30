<template>
  <div class="pc-safe-setting">
    <!-- PC端头部 -->
    <div class="pc-header">
      <el-button
        type="primary"
        :icon="ArrowLeft"
        @click="handleBack"
        class="back-btn"
      >
        {{ $t('common.back') }}
      </el-button>
      <h2 class="page-title">{{ $t('mine.safeSetting') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 安全设置列表 -->
      <div class="setting-list">
        <div
          class="setting-item"
          @click="goToLoginPwd"
        >
          <div class="setting-icon">
            <div class="icon-lock"></div>
          </div>
          <div class="setting-content">
            <h3 class="setting-title">{{ $t('mine.loginPwd') }}</h3>
            <p class="setting-desc">{{ $t('mine.loginPwdDesc') }}</p>
          </div>
          <div class="setting-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>

        <div
          class="setting-item"
          @click="goToWithdrawPwd"
        >
          <div class="setting-icon">
            <div class="icon-shield"></div>
          </div>
          <div class="setting-content">
            <h3 class="setting-title">{{ $t('mine.withdrawPwd') }}</h3>
            <p class="setting-desc">{{ $t('mine.withdrawPwdDesc') }}</p>
          </div>
          <div class="setting-arrow">
            <el-icon><ArrowRight /></el-icon>
          </div>
        </div>
      </div>

      <!-- 安全提示 -->
      <div class="security-tips">
        <h3 class="section-title">{{ $t('mine.securityTips') }}</h3>
        <el-alert
          :title="$t('mine.accountSecurityAdvice')"
          type="info"
          :closable="false"
          show-icon
        >
          <template #default>
            <ul class="tips-list">
              <li>{{ $t('mine.securityTip1') }}</li>
              <li>{{ $t('mine.securityTip2') }}</li>
              <li>{{ $t('mine.securityTip3') }}</li>
              <li>{{ $t('mine.securityTip4') }}</li>
            </ul>
          </template>
        </el-alert>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue'

defineOptions({ name: 'PcSafeSetting' })

const { t } = useI18n()
const router = useRouter()

function handleBack() {
  router.back()
}

function goToLoginPwd() {
  router.push('/modifyPwd')
}

function goToWithdrawPwd() {
  router.push('/withdrawalPwd')
}
</script>

<style scoped>
.pc-safe-setting {
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

.setting-list {
  margin-bottom: 32px;
}

.setting-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  margin-bottom: 12px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.setting-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #409eff;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-icon {
  flex-shrink: 0;
}

.setting-content {
  flex: 1;
}

.setting-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 4px 0;
}

.setting-desc {
  font-size: 14px;
  color: #999;
  margin: 0;
}

.setting-arrow {
  flex-shrink: 0;
  color: #c0c4cc;
  font-size: 16px;
}

.setting-item:hover .setting-arrow {
  color: #409eff;
}

/* CSS图标样式 */
.icon-lock,
.icon-shield {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.icon-lock {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.icon-lock::before {
  content: '';
  width: 16px;
  height: 20px;
  border: 3px solid #fff;
  border-radius: 4px;
  border-top: 6px solid #fff;
  border-bottom: 6px solid #fff;
}

.icon-lock::after {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: 3px solid #fff;
  border-radius: 50% 50% 0 0;
  border-bottom: none;
  top: 8px;
}

.icon-shield {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.icon-shield::before {
  content: '';
  width: 20px;
  height: 24px;
  background: #fff;
  clip-path: polygon(50% 0%, 0% 40%, 50% 100%, 100% 40%);
}

.security-tips {
  border-top: 1px solid #ebeef5;
  padding-top: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
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

.tips-list {
  margin: 12px 0 0 0;
  padding-left: 20px;
  list-style: none;
}

.tips-list li {
  position: relative;
  margin-bottom: 8px;
  line-height: 1.6;
  color: #606266;
  font-size: 14px;
}

.tips-list li:before {
  content: '•';
  position: absolute;
  left: -16px;
  color: #409eff;
}

.tips-list li:last-child {
  margin-bottom: 0;
}

/* Element Plus 样式覆盖 */
.pc-safe-setting :deep(.el-alert) {
  border: 1px solid #d9ecff;
  background-color: #ecf5ff;
}

@media (min-width: 1600px) {
  .pc-safe-setting {
    max-width: 1400px;
  }
}
</style>
