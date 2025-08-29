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
  min-height: 100vh;
  background-color: #f7f8fa;

  .m-nav {
    position: fixed;
    top: 0px;
    left: 0;
    right: 0;
    background-color: #fff;
    border-bottom: 1px solid #ebedf0;
  }

  .m-list {
    margin-top: 56px;
    padding: 10px 16px;
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 10px;

    .m-list-item {
      height: 95px;
      background-color: #fff;
      border-radius: 8px;
      margin-bottom: 0;

      .m-wrapper {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        height: 100%;
        gap: 10px;
        padding: 16px;

        .m-logo {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
        }

        .m-item-right {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
          height: 100%;
          padding: 8px 0;

          .m-le {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: flex-start;

            &-le {
              display: flex;
              flex-direction: column;
              justify-content: flex-start;
              align-items: flex-start;

              .m-label {
                font-size: 12px;
                color: #333;
                margin-bottom: 4px;
              }
              .m-money {
                font-size: 18px;
                color: #fb9802;
                font-weight: 600;
              }
            }
            .m-sub {
              display: flex;
              align-items: center;
              font-size: 12px;
              color: #333;
              background-color: #f0f9ff;
              padding: 4px 8px;
              border-radius: 4px;
              border: 1px solid #e1f5fe;
            }
          }
          .m-ri {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;

            .m-label {
              font-size: 12px;
              color: #333;
              font-weight: 500;
            }
            .m-txt {
              font-size: 12px;
              color: #666;
              background-color: #f8f9fa;
              padding: 4px 8px;
              border-radius: 4px;
            }
          }
        }
      }
    }
  }

  /* VIP等级图标样式 */
  .m-level0 {
    background: linear-gradient(135deg, #9e9e9e, #757575);

    &::before {
      content: 'V0';
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .m-level1 {
    background: linear-gradient(135deg, #8bc34a, #689f38);

    &::before {
      content: 'V1';
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .m-level2 {
    background: linear-gradient(135deg, #2196f3, #1976d2);

    &::before {
      content: 'V2';
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .m-level3 {
    background: linear-gradient(135deg, #ff9800, #f57c00);

    &::before {
      content: 'V3';
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .m-level4 {
    background: linear-gradient(135deg, #e91e63, #c2185b);

    &::before {
      content: 'V4';
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .m-level5 {
    background: linear-gradient(135deg, #9c27b0, #7b1fa2);

    &::before {
      content: 'V5';
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .m-level6 {
    background: linear-gradient(135deg, #673ab7, #512da8);

    &::before {
      content: 'V6';
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .m-level7 {
    background: linear-gradient(135deg, #3f51b5, #303f9f);

    &::before {
      content: 'V7';
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .m-level8 {
    background: linear-gradient(135deg, #f44336, #d32f2f);

    &::before {
      content: 'V8';
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .m-level9 {
    background: linear-gradient(135deg, #795548, #5d4037);

    &::before {
      content: 'V9';
      color: #fff;
      font-size: 14px;
      font-weight: bold;
    }
  }

  .m-level10 {
    background: linear-gradient(135deg, #ffd700, #ffb300);

    &::before {
      content: 'V10';
      color: #fff;
      font-size: 12px;
      font-weight: bold;
    }
  }
}

/* PC端适配样式 */
@media (min-width: 768px) {
  .m-vip-detail {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .m-nav {
      position: relative;
      border-radius: 8px 8px 0 0;
    }

    .m-list {
      margin-top: 0;
      padding: 24px 32px;
      gap: 16px;

      .m-list-item {
        height: 120px;
        border: 1px solid #ebedf0;
        transition: all 0.3s ease;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transform: translateY(-2px);
          border-color: #d0d0d0;
        }

        .m-wrapper {
          padding: 24px;
          gap: 20px;

          .m-logo {
            width: 80px;
            height: 80px;
          }

          .m-item-right {
            padding: 12px 0;

            .m-le {
              margin-bottom: 16px;

              &-le {
                .m-label {
                  font-size: 14px;
                  margin-bottom: 6px;
                }
                .m-money {
                  font-size: 22px;
                }
              }
              .m-sub {
                font-size: 14px;
                padding: 6px 12px;
                border-radius: 6px;
              }
            }
            .m-ri {
              .m-label {
                font-size: 14px;
              }
              .m-txt {
                font-size: 14px;
                padding: 6px 12px;
                border-radius: 6px;
              }
            }
          }
        }
      }
    }

    /* PC端VIP等级图标调整 */
    .m-level0, .m-level1, .m-level2, .m-level3, .m-level4,
    .m-level5, .m-level6, .m-level7, .m-level8, .m-level9 {
      &::before {
        font-size: 18px;
      }
    }

    .m-level10 {
      &::before {
        font-size: 16px;
      }
    }
  }
}

/* 大屏PC端适配 */
@media (min-width: 1200px) {
  .m-vip-detail {
    max-width: 1000px;

    .m-list {
      padding: 32px 48px;
      gap: 20px;

      .m-list-item {
        height: 140px;

        .m-wrapper {
          padding: 32px;
          gap: 24px;

          .m-logo {
            width: 90px;
            height: 90px;
          }

          .m-item-right {
            padding: 16px 0;

            .m-le {
              margin-bottom: 20px;

              &-le {
                .m-label {
                  font-size: 15px;
                }
                .m-money {
                  font-size: 24px;
                }
              }
              .m-sub {
                font-size: 15px;
              }
            }
            .m-ri {
              .m-label {
                font-size: 15px;
              }
              .m-txt {
                font-size: 15px;
              }
            }
          }
        }
      }
    }

    /* 大屏VIP等级图标调整 */
    .m-level0, .m-level1, .m-level2, .m-level3, .m-level4,
    .m-level5, .m-level6, .m-level7, .m-level8, .m-level9 {
      &::before {
        font-size: 20px;
      }
    }

    .m-level10 {
      &::before {
        font-size: 18px;
      }
    }
  }
}

/* 超大屏适配 */
@media (min-width: 1600px) {
  .m-vip-detail {
    max-width: 1200px;
  }
}
</style>

<style lang="less">
@import url('@/views/mobile/common.less');

/* PC端优化 */
@media (min-width: 768px) {
  .m-vip-detail {
    .van-cell {
      padding: 0;

      &::after {
        display: none;
      }
    }
  }
}
</style>
