<template>
  <div class="pc-collection">
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
      <h2 class="page-title">{{ $t('game.myCollection') }}</h2>
    </div>

    <!-- PC端内容区域 -->
    <div class="pc-content">
      <el-tabs v-model="active" class="collection-tabs">
        <el-tab-pane :label="$t('all')" name="all">
          <el-empty v-if="list.all.length <= 0" :description="$t('noRecord')" />
          <div v-else class="game-grid">
            <div
              v-for="(item, idx) in list.all"
              :key="idx"
              class="game-item"
            >
              <el-image
                :src="item.img_url"
                fit="contain"
                class="game-image"
              />
              <div class="game-info">
                <div class="game-title">{{ item.en_name || item.name }}</div>
                <div class="game-code">{{ item.api_name }}</div>
              </div>
              <div class="game-action">
                <el-button
                  type="danger"
                  :icon="Star"
                  circle
                  @click="cancelFavor(item)"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('dianzi')" name="3">
          <el-empty v-if="list['3'].length <= 0" :description="$t('noRecord')" />
          <div v-else class="game-grid">
            <div
              v-for="(item, idx) in list['3']"
              :key="idx"
              class="game-item"
            >
              <el-image
                :src="item.img_url"
                fit="contain"
                class="game-image"
              />
              <div class="game-info">
                <div class="game-title">{{ item.en_name || item.name }}</div>
                <div class="game-code">{{ item.api_name }}</div>
              </div>
              <div class="game-action">
                <el-button
                  type="danger"
                  :icon="Star"
                  circle
                  @click="cancelFavor(item)"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('zhenren')" name="1">
          <el-empty v-if="list['1'].length <= 0" :description="$t('noRecord')" />
          <div v-else class="game-grid">
            <div
              v-for="(item, idx) in list['1']"
              :key="idx"
              class="game-item"
            >
              <el-image
                :src="item.img_url"
                fit="contain"
                class="game-image"
              />
              <div class="game-info">
                <div class="game-title">{{ item.en_name || item.name }}</div>
                <div class="game-code">{{ item.api_name }}</div>
              </div>
              <div class="game-action">
                <el-button
                  type="danger"
                  :icon="Star"
                  circle
                  @click="cancelFavor(item)"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('tiyu')" name="5">
          <el-empty v-if="list['5'].length <= 0" :description="$t('noRecord')" />
          <div v-else class="game-grid">
            <div
              v-for="(item, idx) in list['5']"
              :key="idx"
              class="game-item"
            >
              <el-image
                :src="item.img_url"
                fit="contain"
                class="game-image"
              />
              <div class="game-info">
                <div class="game-title">{{ item.name }}</div>
                <div class="game-code">{{ item.api_name }}</div>
              </div>
              <div class="game-action">
                <el-button
                  type="danger"
                  :icon="Star"
                  circle
                  @click="cancelFavor(item)"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('lottery')" name="4">
          <el-empty v-if="list['4'].length <= 0" :description="$t('noRecord')" />
          <div v-else class="game-grid">
            <div
              v-for="(item, idx) in list['4']"
              :key="idx"
              class="game-item"
            >
              <el-image
                :src="item.img_url"
                fit="contain"
                class="game-image"
              />
              <div class="game-info">
                <div class="game-title">{{ item.name }}</div>
                <div class="game-code">{{ item.api_name }}</div>
              </div>
              <div class="game-action">
                <el-button
                  type="danger"
                  :icon="Star"
                  circle
                  @click="cancelFavor(item)"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('qipai')" name="6">
          <el-empty v-if="list['6'].length <= 0" :description="$t('noRecord')" />
          <div v-else class="game-grid">
            <div
              v-for="(item, idx) in list['6']"
              :key="idx"
              class="game-item"
            >
              <el-image
                :src="item.img_url"
                fit="contain"
                class="game-image"
              />
              <div class="game-info">
                <div class="game-title">{{ item.name }}</div>
                <div class="game-code">{{ item.api_name }}</div>
              </div>
              <div class="game-action">
                <el-button
                  type="danger"
                  :icon="Star"
                  circle
                  @click="cancelFavor(item)"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane :label="$t('fishGame')" name="2">
          <el-empty v-if="list['2'].length <= 0" :description="$t('noRecord')" />
          <div v-else class="game-grid">
            <div
              v-for="(item, idx) in list['2']"
              :key="idx"
              class="game-item"
            >
              <el-image
                :src="item.img_url"
                fit="contain"
                class="game-image"
              />
              <div class="game-info">
                <div class="game-title">{{ item.name }}</div>
                <div class="game-code">{{ item.api_name }}</div>
              </div>
              <div class="game-action">
                <el-button
                  type="danger"
                  :icon="Star"
                  circle
                  @click="cancelFavor(item)"
                />
              </div>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { onMounted, ref } from 'vue'
import { invokeApi } from '@/utils/tools'
import type { ApiCollectGame } from 'typings'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Star } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'PcMyCollection' })

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

function handleBack() {
  router.back()
}

async function cancelFavor(it: ApiCollectGame) {
  const resp = await invokeApi('favorDelete', {
    game_type: it.game_type,
    api_name: it.api_name,
    model_id: it.id,
  })
  if (!resp) {
    return
  }
  await getMyGames()
  ElMessage.success(t('success'))
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
  }
}

onMounted(async () => {
  await getMyGames()
})
</script>

<style lang="less" scoped>
.pc-collection {
  min-height: 100vh;
  background: #f5f7fa;
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

  .collection-tabs {
    :deep(.el-tabs__header) {
      margin-bottom: 30px;
    }

    :deep(.el-tabs__nav-wrap) {
      &::after {
        height: 1px;
      }
    }

    :deep(.el-tabs__item) {
      font-size: 16px;
      padding: 0 30px;
      height: 50px;
      line-height: 50px;

      &.is-active {
        color: #409eff;
        font-weight: 600;
      }
    }

    :deep(.el-tabs__active-bar) {
      height: 3px;
      background: #409eff;
    }

    :deep(.el-tabs__content) {
      min-height: 500px;
    }
  }

  .game-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 20px;

    .game-item {
      display: flex;
      align-items: center;
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 12px;
      padding: 20px;
      transition: all 0.3s;
      cursor: pointer;

      &:hover {
        transform: translateY(-3px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
        border-color: #409eff;
      }

      .game-image {
        width: 100px;
        height: 140px;
        border-radius: 8px;
        overflow: hidden;
        flex-shrink: 0;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      }

      .game-info {
        flex: 1;
        margin: 0 20px;
        min-width: 0;

        .game-title {
          font-size: 18px;
          font-weight: 600;
          color: #303133;
          margin-bottom: 10px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .game-code {
          background: #e0f2fe;
          color: #409eff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          display: inline-block;
        }
      }

      .game-action {
        flex-shrink: 0;

        :deep(.el-button) {
          &:hover {
            transform: scale(1.1);
          }
        }
      }
    }
  }

  :deep(.el-empty) {
    padding: 80px 0;

    .el-empty__description {
      font-size: 16px;
      color: #909399;
    }
  }
}

@media (min-width: 1600px) {
  .pc-collection {
    max-width: 1400px;

    .pc-content {
      .game-grid {
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 24px;
      }
    }
  }
}
</style>
