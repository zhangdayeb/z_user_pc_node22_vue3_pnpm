<template>
  <div class="m-collection">
    <van-nav-bar
      left-arrow
      :title="$t('mine.myCollection')"
      @click-left="onClickLeft"
      class="m-nav"
    />

    <van-tabs v-model:active="active">
      <van-tab :title="$t('all')" name="all">
        <van-empty :description="$t('noRecord')" v-if="list.all.length <= 0" />
        <van-cell-group v-else>
          <van-cell
            class="m-tab-item"
            v-for="(item, idx) in list.all"
            :key="idx"
          >
            <template #default>
              <div class="m-row">
                <van-image
                  :src="item.img_url"
                  fit="contain"
                  class="m-img"
                ></van-image>
                <div class="m-game">
                  <div class="m-title">{{ item.en_name }}</div>
                  <div class="m-code">{{ item.api_name }}</div>
                </div>
                <van-icon
                  name="star"
                  size="20"
                  color="#ff6363"
                  @click="cancelFavor(item)"
                />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
      <van-tab :title="$t('dianzi')" name="3">
        <van-empty :description="$t('noRecord')" v-if="list['3'].length <= 0" />
        <van-cell-group v-else>
          <van-cell
            class="m-tab-item"
            v-for="(item, idx) in list['3']"
            :key="idx"
          >
            <template #default>
              <div class="m-row">
                <van-image
                  :src="item.img_url"
                  fit="contain"
                  class="m-img"
                ></van-image>
                <div class="m-game">
                  <div class="m-title">{{ item.en_name }}</div>
                  <div class="m-code">{{ item.api_name }}</div>
                </div>
                <van-icon
                  name="star"
                  size="20"
                  color="#ff6363"
                  @click="cancelFavor(item)"
                />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
      <van-tab :title="$t('zhenren')" name="1">
        <van-empty :description="$t('noRecord')" v-if="list['1'].length <= 0" />
        <van-cell-group v-else>
          <van-cell
            class="m-tab-item"
            v-for="(item, idx) in list['1']"
            :key="idx"
          >
            <template #default>
              <div class="m-row">
                <van-image
                  :src="item.img_url"
                  fit="contain"
                  class="m-img"
                ></van-image>
                <div class="m-game">
                  <div class="m-title">{{ item.en_name }}</div>
                  <div class="m-code">{{ item.api_name }}</div>
                </div>
                <van-icon
                  name="star"
                  size="20"
                  color="#ff6363"
                  @click="cancelFavor(item)"
                />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
      <van-tab :title="$t('tiyu')" name="5">
        <van-empty :description="$t('noRecord')" v-if="list['5'].length <= 0" />
        <van-cell-group v-else>
          <van-cell
            class="m-tab-item"
            v-for="(item, idx) in list['5']"
            :key="idx"
          >
            <template #default>
              <div class="m-row">
                <van-image
                  :src="item.img_url"
                  fit="contain"
                  class="m-img"
                ></van-image>
                <div class="m-game">
                  <div class="m-title">{{ item.name }}</div>
                  <div class="m-code">{{ item.api_name }}</div>
                </div>
                <van-icon
                  name="star"
                  size="20"
                  color="#ff6363"
                  @click="cancelFavor(item)"
                />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
      <van-tab :title="$t('lottery')" name="4">
        <van-empty :description="$t('noRecord')" v-if="list['4'].length <= 0" />
        <van-cell-group v-else>
          <van-cell
            class="m-tab-item"
            v-for="(item, idx) in list['4']"
            :key="idx"
          >
            <template #default>
              <div class="m-row">
                <van-image
                  :src="item.img_url"
                  fit="contain"
                  class="m-img"
                ></van-image>
                <div class="m-game">
                  <div class="m-title">{{ item.name }}</div>
                  <div class="m-code">{{ item.api_name }}</div>
                </div>
                <van-icon
                  name="star"
                  size="20"
                  color="#ff6363"
                  @click="cancelFavor(item)"
                />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
      <van-tab :title="$t('qipai')" name="6">
        <van-empty :description="$t('noRecord')" v-if="list['6'].length <= 0" />
        <van-cell-group v-else>
          <van-cell
            class="m-tab-item"
            v-for="(item, idx) in list['6']"
            :key="idx"
          >
            <template #default>
              <div class="m-row">
                <van-image
                  :src="item.img_url"
                  fit="contain"
                  class="m-img"
                ></van-image>
                <div class="m-game">
                  <div class="m-title">{{ item.name }}</div>
                  <div class="m-code">{{ item.api_name }}</div>
                </div>
                <van-icon
                  name="star"
                  size="20"
                  color="#ff6363"
                  @click="cancelFavor(item)"
                />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
      <van-tab :title="$t('fishGame')" name="2">
        <van-empty :description="$t('noRecord')" v-if="list['2'].length <= 0" />
        <van-cell-group v-else>
          <van-cell
            class="m-tab-item"
            v-for="(item, idx) in list['2']"
            :key="idx"
          >
            <template #default>
              <div class="m-row">
                <van-image
                  :src="item.img_url"
                  fit="contain"
                  class="m-img"
                ></van-image>
                <div class="m-game">
                  <div class="m-title">{{ item.name }}</div>
                  <div class="m-code">{{ item.api_name }}</div>
                </div>
                <van-icon
                  name="star"
                  size="20"
                  color="#ff6363"
                  @click="cancelFavor(item)"
                />
              </div>
            </template>
          </van-cell>
        </van-cell-group>
      </van-tab>
    </van-tabs>
    <div class="m-tab-contain"></div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { invokeApi } from '@/utils/tools'
import type { ApiCollectGame } from 'typings'
import { showToast } from 'vant'
import { useI18n } from 'vue-i18n'
defineOptions({ name: 'myCollection' })

const { t } = useI18n()
const router = useRouter()
const active = ref('all')
const list = ref<{ [key: string]: ApiCollectGame[] }>({
  all: [],
  '1': [],
  '2': [],
  '3': [],
  '4': [],
  '5': [],
  '6': [],
})
function onClickLeft() {
  router.back()
}

async function cancelFavor(it: ApiCollectGame) {
  //{"game_type":3,"api_name":"AG","model_id":3584}
  const resp = await invokeApi('favorDelete', {
    game_type: it.game_type,
    api_name: it.api_name,
    model_id: it.id,
  })
  if (!resp) {
    return
  }
  await getMyGames()
  showToast({
    message: t('success'),
    onClose: async () => {},
  })
}
async function getMyGames() {
  const resp = await invokeApi('favorList')
  if (!resp) {
    return
  }

  const gamelist: ApiCollectGame[] = resp.gamelists as ApiCollectGame[]
  if (gamelist.length > 0) {
    Object.keys(list.value).forEach((key: string) => {
      if (key === 'all') {
        list.value[key] = gamelist
      } else {
        list.value[key] = gamelist.filter(it => it.game_type === Number(key))
      }
    })
    console.log('list', list.value)
  }
}

onMounted(async () => {
  await getMyGames()
})
</script>

<style lang="less" scoped>
.m-collection {
  display: flex;
  flex-direction: column;
  flex: 1;

  .m-tab-item {
    .m-row {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      background-color: #fff;

      .m-game {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        flex: 1;
        gap: 25px;

        .m-title {
          font-size: 18px;
          font-weight: 500;
          color: rgba(0, 0, 0, 0.85);
        }
        .m-code {
          background: #f4f4f4;
          border-radius: 4px;
          padding: 5px;
          font-size: 12px;
          color: rgba(138, 146, 157, 0.85);
        }
      }
      .m-img {
        width: 83px;
        height: 120px;
      }
    }
  }
}
</style>
<style lang="less">
@import url('@/views/mobile/common.less');
.m-collection {
  .van-tabs__nav--line {
    padding-bottom: 0px;
  }
  .van-tabs__line {
    bottom: 0px;
  }
}
</style>
