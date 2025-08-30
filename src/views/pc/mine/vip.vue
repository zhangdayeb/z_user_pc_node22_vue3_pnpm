<template>
  <div class="pc-vip-index">
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
      <h2 class="page-title">{{ $t('mine.vip') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <!-- 用户VIP信息卡片 -->
      <div class="vip-info-card">
        <div class="user-info">
          <img :src="avatarImg" class="avatar" alt="avatar" />
          <div class="user-details">
            <h3 class="username">{{ store.getUser()?.name ?? 'Guest' }}</h3>
            <div class="level-badge">VIP{{ currentUserLevel }}</div>
          </div>
          <div class="level-icon" :class="`level-${currentUserLevel}`"></div>
        </div>

        <div class="progress-section">
          <div class="progress-header">
            <span class="current-level">VIP{{ currentUserLevel }}</span>
            <span class="next-level">VIP{{ currentUserLevel + 1 }}</span>
          </div>
          <div class="progress-bars">
            <div class="progress-item">
              <div class="progress-bar">
                <div class="progress-fill deposit" :style="{ width: depositPercent + '%' }">
                  <span class="progress-text">{{ mockData.total_deposit }}</span>
                </div>
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-bar">
                <div class="progress-fill bet" :style="{ width: betPercent + '%' }">
                  <span class="progress-text">{{ mockData.total_bet }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-label">{{ $t('vip.currentDeposit') }}：</span>
            <span class="stat-value">{{ mockData.total_deposit }}</span>
            <span class="stat-target">（{{ currentLevelData.deposit_money }}/{{ nextLevelData.deposit_money }}）</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('vip.currentBet') }}：</span>
            <span class="stat-value">{{ mockData.total_bet }}</span>
            <span class="stat-target">（{{ currentLevelData.bet_money }}/{{ nextLevelData.bet_money }}）</span>
          </div>
        </div>
      </div>

      <!-- VIP等级表格 -->
      <div class="vip-levels-section">
        <h3 class="section-title">{{ $t('vip.levelDetails') }}</h3>
        <el-table
          :data="mockLevels"
          class="levels-table"
          stripe
        >
          <el-table-column
            prop="level_name"
            :label="$t('vip.vipLevel')"
            width="120"
          />
          <el-table-column
            prop="deposit_money"
            :label="$t('vip.depositRequirement')"
            width="120"
            align="right"
          />
          <el-table-column
            prop="bet_money"
            :label="$t('vip.betRequirement')"
            width="120"
            align="right"
          />
          <el-table-column
            prop="level_bonus"
            :label="$t('vip.upgradeBonus')"
            width="120"
            align="right"
          >
            <template #default="{ row }">
              <span class="bonus-amount">{{ row.level_bonus }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="day_bonus"
            :label="$t('vip.dailyReward')"
            width="100"
            align="right"
          />
          <el-table-column
            prop="week_bonus"
            :label="$t('vip.weeklyReward')"
            width="100"
            align="right"
          />
          <el-table-column
            prop="month_bonus"
            :label="$t('vip.monthlyReward')"
            width="100"
            align="right"
          />
          <el-table-column
            prop="year_bonus"
            :label="$t('vip.birthdayReward')"
            min-width="100"
            align="right"
          />
        </el-table>
      </div>

      <!-- 当前等级特权 -->
      <div class="privileges-section">
        <h3 class="section-title">
          {{ currentLevelData.level_name }}{{ $t('vip.exclusive') }}
        </h3>
        <div class="privileges-grid">
          <div class="privilege-item">
            <div class="privilege-icon gift-icon"></div>
            <div class="privilege-info">
              <div class="privilege-label">{{ $t('vip.amount') }}</div>
              <div class="privilege-value">{{ currentLevelData.level_bonus }}$</div>
            </div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon calendar-icon"></div>
            <div class="privilege-info">
              <div class="privilege-label">{{ $t('vip.dailyReward') }}</div>
              <div class="privilege-value">{{ currentLevelData.day_bonus }}{{ $t('common.yuan') }}</div>
            </div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon week-icon"></div>
            <div class="privilege-info">
              <div class="privilege-label">{{ $t('vip.weeklyReward') }}</div>
              <div class="privilege-value">{{ currentLevelData.week_bonus }}$</div>
            </div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon month-icon"></div>
            <div class="privilege-info">
              <div class="privilege-label">{{ $t('vip.monthlyReward') }}</div>
              <div class="privilege-value">{{ currentLevelData.month_bonus }}$</div>
            </div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon birthday-icon"></div>
            <div class="privilege-info">
              <div class="privilege-label">{{ $t('vip.birthdayReward') }}</div>
              <div class="privilege-value">{{ currentLevelData.year_bonus }}$</div>
            </div>
          </div>
        </div>
        <div class="detail-link">
          <el-button type="primary" link @click="toDetails">
            {{ $t('vip.rightDetail') }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import avatarImg from '@/assets/mobile/avatar.png'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { ArrowLeft } from '@element-plus/icons-vue'

defineOptions({ name: 'PcVipIndex' })

const { t } = useI18n()
const router = useRouter()
const store = useAppStore()

// 模拟VIP等级数据
const mockLevels = [
  { level_name: 'VIP0', deposit_money: '0.00', bet_money: '0.00', level_bonus: '0.00', day_bonus: '0.00', week_bonus: '0.00', month_bonus: '0.00', year_bonus: '0.00' },
  { level_name: 'VIP1', deposit_money: '1,000.00', bet_money: '5,000.00', level_bonus: '50.00', day_bonus: '2.00', week_bonus: '10.00', month_bonus: '30.00', year_bonus: '100.00' },
  { level_name: 'VIP2', deposit_money: '5,000.00', bet_money: '20,000.00', level_bonus: '200.00', day_bonus: '5.00', week_bonus: '25.00', month_bonus: '80.00', year_bonus: '300.00' },
  { level_name: 'VIP3', deposit_money: '15,000.00', bet_money: '50,000.00', level_bonus: '500.00', day_bonus: '12.00', week_bonus: '60.00', month_bonus: '200.00', year_bonus: '600.00' },
  { level_name: 'VIP4', deposit_money: '50,000.00', bet_money: '150,000.00', level_bonus: '1,500.00', day_bonus: '30.00', week_bonus: '150.00', month_bonus: '500.00', year_bonus: '1,500.00' },
  { level_name: 'VIP5', deposit_money: '150,000.00', bet_money: '500,000.00', level_bonus: '5,000.00', day_bonus: '80.00', week_bonus: '400.00', month_bonus: '1,200.00', year_bonus: '5,000.00' }
]

// 模拟用户数据
const mockData = {
  total_deposit: '8,500.00',
  total_bet: '35,000.00'
}

// 计算当前用户等级（基于用户信息或默认为1）
const currentUserLevel = computed(() => {
  const user = store.getUser()
  return user?.level ?? 1
})

// 当前等级数据
const currentLevelData = computed(() => {
  return mockLevels[currentUserLevel.value] || mockLevels[0]
})

// 下一等级数据
const nextLevelData = computed(() => {
  const nextLevel = currentUserLevel.value + 1
  return mockLevels[nextLevel] || mockLevels[mockLevels.length - 1]
})

// 计算充值进度百分比
const depositPercent = computed(() => {
  const current = parseFloat(mockData.total_deposit.replace(/,/g, ''))
  const target = parseFloat(nextLevelData.value.deposit_money.replace(/,/g, ''))
  return target > 0 ? Math.min((current / target) * 100, 100) : 0
})

// 计算下注进度百分比
const betPercent = computed(() => {
  const current = parseFloat(mockData.total_bet.replace(/,/g, ''))
  const target = parseFloat(nextLevelData.value.bet_money.replace(/,/g, ''))
  return target > 0 ? Math.min((current / target) * 100, 100) : 0
})

function handleBack() {
  router.back()
}

function toDetails() {
  router.push({ name: 'vipDetail' })
}
</script>

<style scoped>
.pc-vip-index {
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

/* VIP信息卡片 */
.vip-info-card {
  background: linear-gradient(135deg, #d2e5ff 0%, #f6faff 100%);
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
}

.user-details {
  flex: 1;
}

.username {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0 0 8px 0;
}

.level-badge {
  display: inline-block;
  padding: 4px 12px;
  background: linear-gradient(135deg, #d5b69d, #eddbcd);
  color: #fff;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.level-icon {
  width: 64px;
  height: 64px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
}

.progress-section {
  margin-bottom: 20px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.current-level,
.next-level {
  padding: 4px 12px;
  background: linear-gradient(135deg, #d7def1, #adbac8);
  color: #333;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.progress-bars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-item {
  position: relative;
}

.progress-bar {
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 4px;
  position: relative;
  transition: width 0.3s ease;
}

.progress-fill.deposit {
  background-color: #a86cfc;
}

.progress-fill.bet {
  background-color: #44afef;
}

.progress-text {
  position: absolute;
  right: -40px;
  top: -20px;
  font-size: 11px;
  color: #666;
  white-space: nowrap;
}

.stats-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  font-size: 14px;
  color: #666;
}

.stat-label {
  color: #999;
}

.stat-value {
  color: #333;
  font-weight: 500;
}

.stat-target {
  color: #999;
}

/* VIP等级表格 */
.vip-levels-section {
  margin-bottom: 24px;
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

.levels-table {
  width: 100%;
}

.bonus-amount {
  color: #4290ff;
  font-weight: 600;
}

/* 特权网格 */
.privileges-section {
  margin-bottom: 24px;
}

.privileges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.privilege-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.privilege-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.privilege-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.gift-icon {
  background: linear-gradient(135deg, #ff6b6b, #ffa500);
}

.calendar-icon {
  background: linear-gradient(135deg, #4ecdc4, #44a08d);
}

.week-icon {
  background: linear-gradient(135deg, #667eea, #764ba2);
}

.month-icon {
  background: linear-gradient(135deg, #f093fb, #f5576c);
}

.birthday-icon {
  background: linear-gradient(135deg, #fa709a, #fee140);
}

.privilege-info {
  flex: 1;
}

.privilege-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.privilege-value {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.detail-link {
  text-align: center;
  margin-top: 16px;
}

/* Element Plus 样式覆盖 */
.pc-vip-index :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.pc-vip-index :deep(.el-table__header) {
  background-color: #f8f9fa;
}

.pc-vip-index :deep(.el-table th) {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.pc-vip-index :deep(.el-table td) {
  padding: 16px 12px;
}

@media (min-width: 1600px) {
  .pc-vip-index {
    max-width: 1400px;
  }
}
</style>
