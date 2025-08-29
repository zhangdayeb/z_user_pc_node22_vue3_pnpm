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
            <van-image
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEgAAABICAMAAABiM0N1AAABKVBMVEUAAACarNy6x+mtu+Oap9eHlsvF1/F1f43V3/Z2gZWDmNJ0fo3CzeqDmNF0f42InNS/yunO1u6Gm9PN1e6CmdPR2e/L1O7L1vCms+V6hY/W3PHJ1OzU2/F0fo3O1+2AlMnJ0uvCzup1fo2DmNLT2vDN1u2+yumJndPG0eyDmNLS2vDL1e10gI3BzOmDmdPQ2e/L1e6Dl9J2fo7P2O53gYyGmtLP2fF3go6Cl9H///+OodaJndR0foy4xOaVp9mGmtO0wuXAy+mSpNe9yOejs96wvuPFz+ucrtysuuGyv+PJ0uzCzemouOCZq9rM1e26xuafsNyYqdnP2O+mtd/4+fzY3/HT2/Dc4vLy9Prt8Pjf5PSBlczi5/R/ksN8jrZ6iqx4hqF2gpjm6/Zr5mrdAAAAOHRSTlMALCwtCxENfhL8+Pf057izspGOaVZQQyIcGfjz6ubk493W0tDPx8bGvauqoJyLhIJ4Z2NbRz81LXZ2pEAAAAOfSURBVFjDtZUHW/IwEICrgrg3Cu6990SGzGLFUpRRUEHR//8jvru0NElpodDne4ncJXd9IfHJg9CdEb9/RHDPyOyyqi7PulbNr6qE1XlXmsVd1WB3sW/N0nGR43ipL83whVI0oVwM9+65WVeKYII3jAjm6zc9au73FBv27nvQBE4UJacAGHIwONVJwKHGc7mS68jKpceJx7+Z68qmv6tm8DDriMPBLvch65hOt2Z+IvuafeWABQOYwDDixLzdfdhKvvbG1qLVfZhJ9sHMkvk+nE0k+2LibJjz7KeBZForQmIGazCs8n3WNJN2wQzzhdIFeOGbFbRmvZ6mX2kw1kYhVoBhN+cZZEQusBAlYgkCJAYwgaGntJKgNU6U6IUXeHHwItqFQKBz/kF+HSMjenEBJxJdQUVDIkESJUlMVoACmecw1YIKRYyYKmlGIsHfEBVJBmLhEahI2FGG7EOUPiGUYV5/bFHO4odiD4mciFKDzhomaXxGlTSRhJGiShReJEsyDFxWsTFBE1ZEiVmLZIYY9imQfODOIBIRiUClUi1j/JQpnKgkl2DICO7tT5ZF7C/CvIoiKFZ1oYSmWslSVGIhW5JLWQwizImARkyAEoWKBjIsCexLZuq4M5wTARP1b0QfYEUcuLdqCduLvAio1/8ekSrTP2AnUvHJNLZLvIhSluxEb5k3AiSZF2wl/zOcayIosaIs9mERn2NEbzw1vV0hs3bRh8g0c6JnnqL+gERmRNSK8BObyJja7UWi/sHP7SLaZCPKP+cJkADa3pQ8Wa+goBWxzvZizojyJrS9ySTXBEYE3vPvMGhkRO8mJLIzSLCRCCDVogWM6MkM7i2n50RAYzudRLi3TF+i1FOKAIkZrMEwR1pjRCk38KJwKmwAEwOYwKBRX6N9vCjsiv8mihgvgha75hFW5I24IewVDKbdiKYFiucAV+KROAzaYbfG1w48Amuai/fJHHg4Bqb70UwPCO00G6FQKB7SOiCxAuu01mgKVkSjP1+hHvj6iUZtRNHRb+ee79GonQj5bTjTNH6h2V6ENL8c7KoJjd1EeFTdD8eJCI+qy+E4EyG/G3aaDTgc56LToLAwaaWZXBCCp45FUw/k1pyPmTVj5+Q+PEw5Em3fCjqBI95zFGhVbrc7icaxsnbNLt3tUM3OHVu5XsPucUvRFBR85rt8NakfzpWp4PGNwyFYirw+X9BidW4MDmfO214J+ny46hzvwoKDB/4B8+yR4E+Zbh0AAAAASUVORK5CYII="
              fit="contain"
              class="m-img"
            ></van-image>
          </template>
          <template #text>
            <p class="m-label">{{ $t('vip.amount') }}</p>
            <p class="m-money">{{ currentLevel?.level_bonus ?? '0.00' }}$</p>
          </template>
        </van-grid-item>
        <van-grid-item class="m-grid-item">
          <template #icon>
            <van-image
              src="data:image/png;base64,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"
              fit="contain"
              class="m-img"
            ></van-image>
          </template>
          <template #text>
            <p class="m-label">{{ $t('vip.dayLJ') }}</p>
            <p class="m-money">{{ currentLevel?.day_bonus ?? '0.00' }}元</p>
          </template>
        </van-grid-item>
        <van-grid-item class="m-grid-item">
          <template #icon>
            <van-image
              src="data:image/png;base64,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"
              fit="contain"
              class="m-img"
            ></van-image>
          </template>
          <template #text>
            <p class="m-label">{{ $t('vip.weekLJ') }}</p>
            <p class="m-money">{{ currentLevel?.week_bonus ?? '0.00' }}$</p>
          </template>
        </van-grid-item>
        <van-grid-item class="m-grid-item">
          <template #icon>
            <van-image
              src="data:image/png;base64,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"
              fit="contain"
              class="m-img"
            ></van-image>
          </template>
          <template #text>
            <p class="m-label">{{ $t('vip.monthLJ') }}</p>
            <p class="m-money">{{ currentLevel?.month_bonus ?? '0.00' }}$</p>
          </template>
        </van-grid-item>
        <van-grid-item class="m-grid-item">
          <template #icon>
            <van-image
              src="data:image/png;base64,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"
              fit="contain"
              class="m-img"
            ></van-image>
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
      // console.log('----', max, curr, (curr / max) * 1e2)

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
  // console.log('v', v, currentLevel.value)
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
        .m-img {
          width: 36px;
          height: 36px;
        }

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
    }
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
}
</style>
