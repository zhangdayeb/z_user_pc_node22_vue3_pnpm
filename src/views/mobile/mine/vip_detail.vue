<template>
  <div class="m-vip-detail">
    <van-nav-bar
      left-arrow
      :title="$t('mine.vipDetial')"
      @click-left="onClickLeft"
      class="m-nav"
    />
    <div class="m-list">
      <van-cell
        class="m-list-item"
        v-for="(item, idx) in vips?.levels ?? []"
        :key="idx"
      >
        <template #default>
          <div class="m-wrapper">
            <div :class="`m-logo m-level${item.level}`"></div>
            <div class="m-item-right">
              <div class="m-le">
                <div class="m-le-le">
                  <div class="m-label">{{ $t('mine.vipLiJin') }}</div>
                  <div class="m-money">
                    {{
                      Number(item.level_bonus) < 1e3
                        ? Number(item.level_bonus).toFixed(2)
                        : Number(item.level_bonus).toLocaleString('en-US') +
                          '.00'
                    }}
                  </div>
                </div>
                <div class="m-sub">
                  {{ $t('mine.bet') }}>={{
                    Number(item.bet_money) <= 1e3
                      ? Number(item.bet_money).toFixed(2)
                      : Number(item.bet_money).toLocaleString('en-US')
                  }}
                </div>
              </div>
              <div class="m-ri">
                <div class="m-label">{{ $t('mine.allDaBiao') }}</div>
                <div class="m-txt">
                  {{ $t('mine.deposit') }}>={{
                    Number(item.deposit_money) <= 1e3
                      ? Number(item.deposit_money).toFixed(2)
                      : Number(item.deposit_money).toLocaleString('en-US')
                  }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </van-cell>
    </div>
  </div>
</template>

<script setup lang="ts">
import { invokeApi } from '@/utils/tools'
import type { ApiVips } from 'typings'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
defineOptions({ name: 'VipDetail' })
const router = useRouter()
const vips = ref<ApiVips>()

async function getVips() {
  const resp = await invokeApi('vips')
  if (!resp) {
    return
  }
  vips.value = resp.data as ApiVips
}
function onClickLeft() {
  router.back()
}

onMounted(async () => {
  await getVips()
})
</script>

<style lang="less" scoped>
.m-vip-detail {
  display: flex;
  flex-direction: column;
  // min-height: calc(100% - 46px);
  flex: 1;
  margin-top: 46px;

  .m-nav {
    position: fixed;
    top: 0px;
    left: 0;
    right: 0;
  }

  .m-list {
    margin-top: 10px;
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;

    .m-list-item {
      height: 95px;

      .m-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        gap: 10px;

        .m-logo {
          width: 60px;
          height: 60px;
        }
        .m-item-right {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;

          .m-le {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            &-le {
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: flex-start;

              .m-label {
                font-size: 12px;
                color: #333;
              }
              .m-money {
                font-size: 18px;
                color: #fb9802;
              }
            }
            .m-sub {
              display: flex;
              align-items: center;
              font-size: 12px;
              color: #333;
            }
          }
          .m-ri {
            display: flex;
            flex-direction: row;
            justify-content: space-between;

            .m-label {
              font-size: 12px;
              color: #333;
            }
            .m-txt {
              font-size: 12px;
              color: #333;
            }
          }
        }
      }
    }
  }
}
</style>
<style lang="less">
@import url('@/views/mobile/common.less');
</style>
