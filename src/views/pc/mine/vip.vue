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
            <h3 class="username">{{ store.getUser()?.name ?? '' }}</h3>
            <div class="level-badge">VIP{{ store.getUser()?.level ?? 0 }}</div>
          </div>
          <div class="level-icon" :class="`level-${store.getUser()?.level ?? 0}`"></div>
        </div>

        <div class="progress-section">
          <div class="progress-header">
            <span class="current-level">VIP{{ store.getUser()?.level ?? 0 }}</span>
            <span class="next-level">VIP{{ (store.getUser()?.level ?? 0) + 1 }}</span>
          </div>
          <div class="progress-bars">
            <div class="progress-item">
              <div class="progress-bar">
                <div class="progress-fill deposit" :style="{ width: getPercent(1) + '%' }">
                  <span class="progress-text">{{ getNumber(vips?.total_deposit ?? 0) }}</span>
                </div>
              </div>
            </div>
            <div class="progress-item">
              <div class="progress-bar">
                <div class="progress-fill bet" :style="{ width: getPercent(2) + '%' }">
                  <span class="progress-text">{{ getNumber(vips?.total_bet ?? 0) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="stats-section">
          <div class="stat-item">
            <span class="stat-label">{{ $t('vip.dqCK') }}：</span>
            <span class="stat-value">{{ getNumber(vips?.total_deposit ?? 0) }}</span>
            <span class="stat-target">（{{ userLevel?.deposit_money ?? 0 }}/{{ userNextLevel?.deposit_money }}）</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">{{ $t('vip.dqBet') }}：</span>
            <span class="stat-value">{{ getNumber(vips?.total_bet ?? 0) }}</span>
            <span class="stat-target">（{{ userLevel?.bet_money ?? 0 }}/{{ userNextLevel?.bet_money ?? 0 }}）</span>
          </div>
        </div>
      </div>

      <!-- VIP等级表格 -->
      <div class="vip-levels-section">
        <h3 class="section-title">VIP等级详情</h3>
        <el-table
          :data="vips?.levels ?? []"
          class="levels-table"
          stripe
        >
          <el-table-column
            prop="level_name"
            label="VIP等级"
            width="120"
          />
          <el-table-column
            prop="deposit_money"
            label="存款要求($)"
            width="120"
            align="right"
          />
          <el-table-column
            prop="bet_money"
            label="投注要求($)"
            width="120"
            align="right"
          />
          <el-table-column
            prop="level_bonus"
            label="升级奖金($)"
            width="120"
            align="right"
          >
            <template #default="{ row }">
              <span class="bonus-amount">{{ row.level_bonus }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="day_bonus"
            label="日礼金"
            width="100"
            align="right"
          />
          <el-table-column
            prop="week_bonus"
            label="周礼金"
            width="100"
            align="right"
          />
          <el-table-column
            prop="month_bonus"
            label="月礼金"
            width="100"
            align="right"
          />
          <el-table-column
            prop="year_bonus"
            label="年礼金"
            min-width="100"
            align="right"
          />
        </el-table>
      </div>

      <!-- 当前等级特权 -->
      <div class="privileges-section">
        <h3 class="section-title">
          {{ currentLevel?.level_name ?? 'VIP0' }}{{ $t('vip.zhuanXiang') }}
        </h3>
        <div class="privileges-grid">
          <div class="privilege-item">
            <div class="privilege-icon gift-icon"></div>
            <div class="privilege-info">
              <div class="privilege-label">{{ $t('vip.amount') }}</div>
              <div class="privilege-value">{{ currentLevel?.level_bonus ?? '0.00' }}$</div>
            </div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon calendar-icon"></div>
            <div class="privilege-info">
              <div class="privilege-label">{{ $t('vip.dayLJ') }}</div>
              <div class="privilege-value">{{ currentLevel?.day_bonus ?? '0.00' }}元</div>
            </div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon week-icon"></div>
            <div class="privilege-info">
              <div class="privilege-label">{{ $t('vip.weekLJ') }}</div>
              <div class="privilege-value">{{ currentLevel?.week_bonus ?? '0.00' }}$</div>
            </div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon month-icon"></div>
            <div class="privilege-info">
              <div class="privilege-label">{{ $t('vip.monthLJ') }}</div>
              <div class="privilege-value">{{ currentLevel?.month_bonus ?? '0.00' }}$</div>
            </div>
          </div>
          <div class="privilege-item">
            <div class="privilege-icon birthday-icon"></div>
            <div class="privilege-info">
              <div class="privilege-label">{{ $t('vip.brithdayLJ') }}</div>
              <div class="privilege-value">{{ currentLevel?.year_bonus ?? '0.00' }}$</div>
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
import { ref, onMounted } from 'vue'
import { invokeApi } from '@/utils/tools'
import { ArrowLeft } from '@element-plus/icons-vue'
import type { ApiLevel, ApiVips } from 'typings'

defineOptions({ name: 'PcVipIndex' })

const router = useRouter()
const store = useAppStore()
const vips = ref<ApiVips | null>(null)
const userLevel = ref<ApiLevel | null>(null)
const userNextLevel = ref<ApiLevel | null>(null)
const currentLevel = ref<ApiLevel>()

function handleBack() {
  router.back()
}

function getNumber(d: string | number) {
  const tmp = Number(`${d}`)
  return tmp <= 0 ? '0.00' : tmp
}

function getPercent(n: number) {
  switch (n) {
    case 1:
      const max = Number(userNextLevel.value?.deposit_money ?? '0'),
        curr = Number(vips.value?.total_deposit ?? '0')
      return max > 0 ? (curr / max) * 100 : 0
    case 2:
      const max2 = Number(userNextLevel.value?.bet_money ?? '0'),
        curr2 = Number(vips.value?.total_bet ?? '0')
      return max2 > 0 ? (curr2 / max2) * 100 : 0
  }
  return 0
}

function toDetails() {
  router.push({ name: 'vipDetail' })
}

async function getVips() {
  const resp:any = await invokeApi('vips')
  if (!resp) {
    return
  }
  vips.value = (resp.data as ApiVips) ?? null
  if ((vips.value?.levels.length ?? 0) > 0) {
    currentLevel.value = vips.value.levels[0]
  }

  // 获取用户等级
  const user = store.getUser()
  if (user) {
    userLevel.value = vips.value.levels[user?.level ?? 0]
    let nLevel = user?.level ?? 0
    nLevel += 1
    if (vips.value.levels.length - nLevel <= 1) {
      nLevel = vips.value.levels.length - 1
    }
    userNextLevel.value = vips.value.levels[nLevel]
    currentLevel.value = vips.value.levels[user?.level ?? 0]
  }
}

onMounted(async () => {
  await getVips()
})
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
