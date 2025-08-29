<template>
  <div class="m-vip-index">
    <van-nav-bar
      left-arrow
      :title="$t('mine.vip')"
      @click-left="onClickLeft"
      class="m-nav"
    />
    <div class="m-userGrade">
      <div class="m-userVipBox">
        <van-image :src="avatarImg" fit="contain" class="m-avatar"></van-image>
        <div class="m-ava-sub">
          <h5 class="m-txt">{{ store.getUser()?.name ?? '' }}</h5>
          <div class="m-level-txt">Vip{{ store.getUser()?.level ?? 0 }}</div>
        </div>
        <div
          class="m-ava-level"
          :class="`m-level${store.getUser()?.level ?? 0}`"
        ></div>
      </div>
      <div class="m-vipSchedule">
        <div class="m-start">VIP{{ store.getUser()?.level ?? 0 }}</div>
        <div class="m-middle">
          <div class="m-line">
            <div class="m-l1">
              <p class="m-z" :style="{ width: getPercent(1) + '%' }">
                <span class="m-z-p">{{
                  getNumber(vips?.total_deposit ?? 0)
                }}</span>
              </p>
            </div>
            <div class="m-l1">
              <p class="m-l" :style="{ width: getPercent(2) + '%' }">
                <span class="m-l-p">{{ getNumber(vips?.total_bet ?? 0) }}</span>
              </p>
            </div>
          </div>
        </div>
        <div class="m-end">VIP{{ (store.getUser()?.level ?? 0) + 1 }}</div>
      </div>
      <div class="m-weekBox">
        <div class="m-row">
          <span>{{ $t('vip.dqCK') }}： </span>
          <span>{{ getNumber(vips?.total_deposit ?? 0) }}</span>
          <span
            >（{{ userLevel?.deposit_money ?? 0 }}/{{
              userNextLevel?.deposit_money
            }}）</span
          >
        </div>
        <div class="m-row">
          <span>{{ $t('vip.dqBet') }}： </span>
          <span>{{ getNumber(vips?.total_bet ?? 0) }}</span>
          <span
            >（{{ userLevel?.bet_money ?? 0 }}/{{
              userNextLevel?.bet_money ?? 0
            }}）</span
          >
        </div>
      </div>
    </div>
    <div class="m-grade-bg"></div>
    <van-swipe
      class="m-van-swipe"
      :autoplay="10000"
      @change="swipeChangeHandler"
    >
      <van-swipe-item
        class="m-item"
        v-for="(it, idx) in vips?.levels ?? []"
        :key="idx"
      >
        <template v-if="it.level >= 0">
          <div class="m-item-wrapper">
            <div class="m-row">
              <div class="m-vip">{{ it.level_name }}</div>
              <div class="m-level">
                <div :class="`m-leve m-level${it.level}`"></div>
              </div>
            </div>
            <div class="m-row m-lr40">
              <div class="m-col">
                <div class="m-label m-color">{{ it.deposit_money }}</div>
                <div class="m-money m-color">{{ $t('mine.deposit') }}（$）</div>
              </div>
              <div class="m-col">
                <div class="m-label m-color">{{ it.bet_money }}</div>
                <div class="m-money m-color">{{ $t('mine.bet') }}（$）</div>
              </div>
              <div class="m-col">
                <div class="m-label m-blue">{{ it.level_bonus }}</div>
                <div class="m-money m-color">{{ $t('vip.amount') }}（$）</div>
              </div>
            </div>
          </div>
        </template>
      </van-swipe-item>
      <template #indicator="{ active, total }">
        <div class="custom-indicator">{{ active + 1 }}/{{ total }}</div>
      </template>
    </van-swipe>
    <div class="m-devier"></div>
    <div class="m-other">
      <div class="m-title">
        {{ currentLevel?.level_name ?? 'VIP0' }}{{ $t('vip.zhuanXiang') }}
      </div>
      <van-grid
        class="m-other-bd"
        :column-num="3"
        direction="vertical"
        :border="false"
      >
        <van-grid-item class="m-grid-item">
          <template #icon>
            <div class="icon-gift"></div>
          </template>
          <template #text>
            <p class="m-label">{{ $t('vip.amount') }}</p>
            <p class="m-money">{{ currentLevel?.level_bonus ?? '0.00' }}$</p>
          </template>
        </van-grid-item>
        <van-grid-item class="m-grid-item">
          <template #icon>
            <div class="icon-calendar"></div>
          </template>
          <template #text>
            <p class="m-label">{{ $t('vip.dayLJ') }}</p>
            <p class="m-money">{{ currentLevel?.day_bonus ?? '0.00' }}元</p>
          </template>
        </van-grid-item>
        <van-grid-item class="m-grid-item">
          <template #icon>
            <div class="icon-week"></div>
          </template>
          <template #text>
            <p class="m-label">{{ $t('vip.weekLJ') }}</p>
            <p class="m-money">{{ currentLevel?.week_bonus ?? '0.00' }}$</p>
          </template>
        </van-grid-item>
        <van-grid-item class="m-grid-item">
          <template #icon>
            <div class="icon-month"></div>
          </template>
          <template #text>
            <p class="m-label">{{ $t('vip.monthLJ') }}</p>
            <p class="m-money">{{ currentLevel?.month_bonus ?? '0.00' }}$</p>
          </template>
        </van-grid-item>
        <van-grid-item class="m-grid-item">
          <template #icon>
            <div class="icon-birthday"></div>
          </template>
          <template #text>
            <p class="m-label">{{ $t('vip.brithdayLJ') }}</p>
            <p class="m-money">{{ currentLevel?.year_bonus ?? '0.00' }}$</p>
          </template>
        </van-grid-item>
      </van-grid>
      <div class="m-link" @click="toDetails">{{ $t('vip.rightDetail') }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import avatarImg from '@/assets/mobile/avatar.png'
import { useRouter } from 'vue-router'
import { useAppStore } from '@/stores/app'
import { ref, onMounted } from 'vue'
import { invokeApi } from '@/utils/tools'
import type { ApiLevel, ApiVips } from 'typings'

defineOptions({ name: 'VipVue' })

const router = useRouter()
const store = useAppStore()
const vips = ref<ApiVips | null>(null)
const userLevel = ref<ApiLevel | null>(null)
const userNextLevel = ref<ApiLevel | null>(null)
const currentLevel = ref<ApiLevel>()

function onClickLeft() {
  router.back()
}

function getNumber(d: string | number) {
  const tmp = Number(`${d}`)
  return tmp <= 0 ? '0.00' : tmp
}

function getPercent(n: number) {
  switch (n) {
    case 1:
      const //min = Number(userLevel.value?.deposit_money ?? '0'),
        max = Number(userNextLevel.value?.deposit_money ?? '0'),
        curr = Number(vips.value?.total_deposit ?? '0')
      return (curr / max) * 1e2
    case 2:
      const //min2 = Number(userLevel.value?.bet_money ?? '0'),
        max2 = Number(userNextLevel.value?.bet_money ?? '0'),
        curr2 = Number(vips.value?.total_bet ?? '0')
      return (curr2 / max2) * 1e2
  }
  return 0
}

function toDetails() {
  router.push({ name: 'vipDetail' })
}

function swipeChangeHandler(v: number) {
  currentLevel.value = vips.value?.levels[v]
}

async function getVips() {
  const resp = await invokeApi('vips')
  if (!resp) {
    return
  }
  vips.value = (resp.data as ApiVips) ?? null
  if ((vips.value?.levels.length ?? 0) > 0) {
    currentLevel.value = vips.value.levels[0]
  }
  //获取用户等级
  const user = store.getUser()
  if (user) {
    userLevel.value = vips.value.levels[user?.level ?? 0]
    let nLevel = user?.level ?? 0
    nLevel += 1
    if (vips.value.levels.length - nLevel <= 1) {
      nLevel = vips.value.levels.length - 1
    }
    userNextLevel.value = vips.value.levels[nLevel]
  }
}

onMounted(async () => {
  await getVips()
})
</script>

<style lang="less" scoped>
.m-vip-index {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f7f8fa;

  .m-nav {
    position: fixed;
    left: 0px;
    right: 0px;
  }

  .m-userGrade {
    margin-top: 46px;
    position: relative;
    background: -webkit-linear-gradient(left, #d2e5ff, #f6faff);
    background: linear-gradient(90deg, #d2e5ff, #f6faff);
    height: 214px;

    .m-userVipBox {
      margin: 0px 20px;
      height: 100px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 10px;

      .m-avatar {
        width: 48px;
        height: 48px;
      }
      .m-ava-sub {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        flex: 1;

        .m-txt {
          font-size: 16px;
          font-weight: 700;
          color: #333;
        }
        .m-level-txt {
          width: 48px;
          height: 18px;
          border-radius: 2px;
          overflow: hidden;
          background: -webkit-linear-gradient(90deg, #d5b69d, #eddbcd);
          background: linear-gradient(1turn, #d5b69d, #eddbcd);
          display: -webkit-box;
          display: -webkit-flex;
          display: -ms-flexbox;
          display: flex;
          -webkit-box-align: center;
          -webkit-align-items: center;
          -ms-flex-align: center;
          align-items: center;
          -webkit-box-pack: center;
          -webkit-justify-content: center;
          -ms-flex-pack: center;
          justify-content: center;
          font-size: 13px;
          color: #fff;
        }
      }
      .m-ava-level {
        width: 70px;
        height: 70px;
      }
    }
    .m-vipSchedule {
      height: 66px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 0px 16px;
      gap: 10px;

      .m-start {
        width: 45px;
        height: 20px;
        border-radius: 8px;
        font-size: 12px;
        color: #333;
        display: flex;
        -webkit-box-pack: center;
        -webkit-justify-content: center;
        -ms-flex-pack: center;
        justify-content: center;
        align-items: center;
        background: -webkit-linear-gradient(top, #d7def1, #adbac8);
        background: linear-gradient(180deg, #d7def1, #adbac8);
      }

      .m-middle {
        flex: 1;
        display: flex;
        flex-direction: row;

        .m-line {
          height: 15px;
          display: flex;
          flex-direction: column;
          justify-content: space-around;
          width: 100%;

          .m-l1 {
            height: 5px;
            width: 100%;
            border-radius: 4px;
            font-size: 0;
            padding: 0;
            border: none;
            background-color: #d7def1;

            .m-z {
              position: relative;
              display: inline-block;
              border-radius: 4px;
              height: 5px;
              min-width: 5px;
              background-color: #a86cfc;

              .m-z-p {
                position: absolute;
                right: 3px;
                font-size: 12px;
                line-height: 14px;
                transform: translateX(50%);
                display: flex;
                justify-content: center;
                height: 14px;
                top: -22px;

                &::before {
                  content: '';
                  position: absolute;
                  border-left: 6px dashed transparent;
                  border-right: 6px dashed transparent;
                  top: 13px;
                  left: 5px;
                  border-top: 6px solid #333;
                }
              }
            }
            .m-l {
              position: relative;
              display: inline-block;
              border-radius: 4px;
              height: 5px;
              min-width: 5px;
              background-color: #44afef;

              .m-l-p {
                position: absolute;
                right: 3px;
                font-size: 12px;
                line-height: 14px;
                transform: translateX(50%);
                display: flex;
                justify-content: center;
                height: 14px;
                top: 15px;

                &::before {
                  content: '';
                  position: absolute;
                  border-left: 6px dashed transparent;
                  border-right: 6px dashed transparent;
                  bottom: 14px;
                  left: 5px;
                  border-bottom: 6px solid #333;
                }
              }
            }
          }
        }
      }
      .m-end {
        .m-start;
      }
    }
    .m-weekBox {
      padding: 0px 16px;
      height: 48px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: flex-start;
      font-size: 12px;
      color: #95a2b4;
      gap: 6px;
    }
  }

  .m-grade-bg {
    height: 19px;
    background: url('../../../assets/mobile/background_head.png') no-repeat;
    background-size: 100% 100%;
    background-color: #f6faff;
  }

  .m-van-swipe {
    padding-top: 24px;
    height: 188px;
    background-color: #f6faff;

    .m-item {
      display: flex;
      flex-direction: column;

      .m-item-wrapper {
        height: 144px;
        margin: 0px 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: url('../../../assets/mobile/background_box.png') no-repeat;
        background-size: 100% 100%;
      }
      .m-row {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        align-items: center;
        width: 100%;
        flex: 1;

        .m-vip {
          font-size: 16px;
          color: #727e8d;
          flex: 1;
          margin-left: 40px;
        }
        .m-level {
          flex: 1;
          display: flex;
          justify-content: flex-end;
          align-items: center;
          margin-right: 40px;
        }
        .m-leve {
          width: 70px;
          height: 70px;
        }
      }
      .m-col {
        display: flex;
        flex-direction: column;
        flex: 1;
        width: 33.4444px;
        gap: 5px;

        .m-label {
          font-size: 14px;
          font-weight: 700;
        }
        .m-color {
          color: #95a2b4;
        }
        .m-blue {
          color: #4290ff;
        }
        .m-money {
          font-size: 12px;
        }
      }
      .m-lr40 {
        padding-left: 20px;
        padding-right: 10px;
      }
    }
    .custom-indicator {
      position: absolute;
      right: 5px;
      bottom: 5px;
      padding: 2px 5px;
      font-size: 12px;
      background: rgba(0, 0, 0, 0.1);
    }
  }

  .m-devier {
    margin-top: 10px;
  }

  .m-other {
    padding: 10px 16px;
    display: flex;
    flex-direction: column;
    background-color: #f6faff;

    .m-title {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      font-size: 16px;

      &::before {
        content: '';
        border-radius: 3px;
        margin-right: 7px;
        width: 3px;
        height: 14px;
        background-color: #4290ff;
        margin-top: 3.5px;
      }
    }

    .m-other-bd {
      margin: 20px 0;

      .m-grid-item {
        .m-label {
          margin-top: 10px;
          font-size: 14px;
          color: #333;
        }
        .m-money {
          margin-top: 5px;
          font-size: 12px;
          color: #999;
        }
      }
    }

    .m-link {
      margin-top: 10px;
      padding: 10px 16px 20px 16px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      color: #4290ff;
      cursor: pointer;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  /* CSS图标样式 */
  .icon-gift,
  .icon-calendar,
  .icon-week,
  .icon-month,
  .icon-birthday {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .icon-gift {
    background: linear-gradient(135deg, #ff6b6b, #ffa500);

    &::before {
      content: '';
      width: 16px;
      height: 16px;
      background: #fff;
      border-radius: 2px;
      position: relative;
    }

    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 4px;
      background: #fff;
      border-radius: 2px;
      top: 8px;
    }
  }

  .icon-calendar {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);

    &::before {
      content: '';
      width: 18px;
      height: 14px;
      background: #fff;
      border-radius: 2px;
      position: relative;
      border: 2px solid #fff;
    }

    &::after {
      content: '';
      position: absolute;
      width: 2px;
      height: 6px;
      background: #4ecdc4;
      top: 8px;
      left: 13px;
    }
  }

  .icon-week {
    background: linear-gradient(135deg, #667eea, #764ba2);

    &::before {
      content: '';
      width: 20px;
      height: 16px;
      background: #fff;
      border-radius: 2px;
      position: relative;
    }

    &::after {
      content: '';
      position: absolute;
      width: 12px;
      height: 2px;
      background: #667eea;
      top: 14px;
      border-radius: 1px;
    }
  }

  .icon-month {
    background: linear-gradient(135deg, #f093fb, #f5576c);

    &::before {
      content: '';
      width: 18px;
      height: 18px;
      background: #fff;
      border-radius: 50%;
      position: relative;
    }

    &::after {
      content: '';
      position: absolute;
      width: 8px;
      height: 2px;
      background: #f093fb;
      top: 17px;
      border-radius: 1px;
    }
  }

  .icon-birthday {
    background: linear-gradient(135deg, #fa709a, #fee140);

    &::before {
      content: '';
      width: 16px;
      height: 20px;
      background: #fff;
      border-radius: 8px 8px 4px 4px;
      position: relative;
    }

    &::after {
      content: '';
      position: absolute;
      width: 4px;
      height: 6px;
      background: #fa709a;
      top: 6px;
      border-radius: 2px;
    }
  }
}

/* PC端适配样式 */
@media (min-width: 768px) {
  .m-vip-index {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .m-nav {
      position: relative;
      border-radius: 8px 8px 0 0;
    }

    .m-userGrade {
      margin-top: 0;
      height: 280px;
      border-radius: 0 0 16px 16px;

      .m-userVipBox {
        margin: 0px 32px;
        height: 120px;
        padding-top: 20px;

        .m-avatar {
          width: 64px;
          height: 64px;
        }

        .m-ava-sub {
          .m-txt {
            font-size: 20px;
          }
          .m-level-txt {
            width: 60px;
            height: 24px;
            font-size: 14px;
          }
        }

        .m-ava-level {
          width: 80px;
          height: 80px;
        }
      }

      .m-vipSchedule {
        height: 80px;
        padding: 0px 32px;

        .m-start, .m-end {
          width: 60px;
          height: 28px;
          font-size: 14px;
        }

        .m-middle .m-line {
          height: 20px;

          .m-l1 {
            height: 8px;

            .m-z, .m-l {
              height: 8px;
              min-width: 8px;
            }

            .m-z-p, .m-l-p {
              font-size: 14px;
            }
          }
        }
      }

      .m-weekBox {
        padding: 0px 32px;
        height: 60px;
        font-size: 14px;
        gap: 8px;
      }
    }

    .m-van-swipe {
      height: 220px;
      padding-top: 32px;

      .m-item .m-item-wrapper {
        height: 160px;
        margin: 0px 32px;
      }

      .m-row {
        .m-vip {
          font-size: 18px;
          margin-left: 48px;
        }

        .m-level {
          margin-right: 48px;
        }

        .m-leve {
          width: 80px;
          height: 80px;
        }
      }

      .m-col {
        .m-label {
          font-size: 16px;
        }
        .m-money {
          font-size: 14px;
        }
      }

      .m-lr40 {
        padding-left: 32px;
        padding-right: 24px;
      }
    }

    .m-other {
      padding: 20px 32px;

      .m-title {
        font-size: 18px;

        &::before {
          width: 4px;
          height: 18px;
          margin-top: 2px;
        }
      }

      .m-other-bd {
        margin: 32px 0;

        .m-grid-item {
          padding: 20px;
          border-radius: 12px;
          transition: all 0.3s ease;

          &:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          }

          .m-label {
            margin-top: 12px;
            font-size: 16px;
          }
          .m-money {
            margin-top: 8px;
            font-size: 14px;
          }
        }
      }

      .m-link {
        margin-top: 20px;
        padding: 16px;
        font-size: 16px;
        border-radius: 8px;
        transition: all 0.3s ease;

        &:hover {
          background-color: rgba(66, 144, 255, 0.1);
        }
      }
    }

    /* PC端图标尺寸调整 */
    .icon-gift,
    .icon-calendar,
    .icon-week,
    .icon-month,
    .icon-birthday {
      width: 48px;
      height: 48px;
    }
  }
}

/* 大屏PC端适配 */
@media (min-width: 1200px) {
  .m-vip-index {
    max-width: 1000px;

    .m-userGrade {
      height: 320px;

      .m-userVipBox {
        margin: 0px 48px;
        height: 140px;
        padding-top: 24px;

        .m-avatar {
          width: 72px;
          height: 72px;
        }

        .m-ava-sub {
          .m-txt {
            font-size: 22px;
          }
          .m-level-txt {
            width: 64px;
            height: 26px;
            font-size: 15px;
          }
        }

        .m-ava-level {
          width: 90px;
          height: 90px;
        }
      }

      .m-vipSchedule {
        padding: 0px 48px;
      }

      .m-weekBox {
        padding: 0px 48px;
        font-size: 15px;
      }
    }

    .m-van-swipe {
      .m-item .m-item-wrapper {
        margin: 0px 48px;
      }
    }

    .m-other {
      padding: 24px 48px;

      .m-title {
        font-size: 20px;
      }

      .m-other-bd {
        .m-grid-item {
          .m-label {
            font-size: 17px;
          }
          .m-money {
            font-size: 15px;
          }
        }
      }
    }

    /* 大屏图标尺寸 */
    .icon-gift,
    .icon-calendar,
    .icon-week,
    .icon-month,
    .icon-birthday {
      width: 52px;
      height: 52px;
    }
  }
}

/* 超大屏适配 */
@media (min-width: 1600px) {
  .m-vip-index {
    max-width: 1200px;
  }
}
</style>

<style lang="less">
@import url('@/views/mobile/common.less');

.m-vip-index {
  .van-nav-bar {
    background: -webkit-linear-gradient(left, #d2e5ff, #f6faff);
    background: linear-gradient(90deg, #d2e5ff, #f6faff);
  }

  .m-other {
    .van-grid-item__content {
      background-color: #f6faff;
    }
  }

  /* PC端优化 */
  @media (min-width: 768px) {
    .m-other {
      .van-grid-item__content {
        background-color: #fff;
        border-radius: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        border: 1px solid #ebedf0;
      }
    }
  }
}
</style>
