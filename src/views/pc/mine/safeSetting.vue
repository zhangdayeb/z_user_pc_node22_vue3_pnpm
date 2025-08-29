<template>
  <div class="m-safe-setting">
    <van-nav-bar
      left-arrow
      :title="$t('mine.safeSetting')"
      @click-left="onClickLeft"
      class="nav-bar"
    />
    <van-cell-group class="m-mt10">
      <van-cell :title="$t('mine.loginPwd')" is-link to="/modifyPwd">
        <template #icon>
          <div class="icon-lock"></div>
        </template>
      </van-cell>
      <van-cell :title="$t('mine.withdrawPwd')" is-link to="/withdrawalPwd">
        <template #icon>
          <div class="icon-shield"></div>
        </template>
      </van-cell>
    </van-cell-group>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

defineOptions({ name: 'MineSafeSetting' })

const router = useRouter()

function onClickLeft() {
  router.back()
}
</script>

<style lang="less" scoped>
.m-safe-setting {
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
  min-height: 100vh;

  .nav-bar {
    background-color: #fff;
    border-bottom: 1px solid #ebedf0;
  }

  .m-mt10 {
    margin-top: 10px;
  }

  /* CSS图标样式 */
  .icon-lock,
  .icon-shield {
    width: 20px;
    height: 20px;
    margin-right: 12px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }

  .icon-lock {
    background: linear-gradient(135deg, #4ecdc4, #44a08d);

    &::before {
      content: '';
      width: 8px;
      height: 10px;
      border: 2px solid #fff;
      border-radius: 2px;
      border-top: 3px solid #fff;
      border-bottom: 3px solid #fff;
    }

    &::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      border: 2px solid #fff;
      border-radius: 50% 50% 0 0;
      border-bottom: none;
      top: 4px;
    }
  }

  .icon-shield {
    background: linear-gradient(135deg, #667eea, #764ba2);

    &::before {
      content: '';
      width: 10px;
      height: 12px;
      background: #fff;
      clip-path: polygon(50% 0%, 0% 40%, 50% 100%, 100% 40%);
    }
  }

  /* 移动端样式 */
  .m-safe-setting :deep(.van-cell) {
    margin-bottom: 8px;
    background-color: #fff;
    border-radius: 8px;
    margin-left: 16px;
    margin-right: 16px;
    padding: 16px 20px;
  }

  .m-safe-setting :deep(.van-cell:first-child) {
    margin-top: 0;
  }

  .m-safe-setting :deep(.van-cell__title) {
    font-size: 16px;
    color: #333;
    font-weight: 500;
  }

  .m-safe-setting :deep(.van-cell__right-icon) {
    color: #969799;
    font-size: 16px;
  }
}

/* PC端适配样式 */
@media (min-width: 768px) {
  .m-safe-setting {
    max-width: 800px;
    margin: 0 auto;
    background-color: #fff;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);

    .nav-bar {
      border-radius: 8px 8px 0 0;
    }

    .m-mt10 {
      margin-top: 24px;
      padding: 0 24px;
    }

    .m-safe-setting :deep(.van-cell-group) {
      background-color: transparent;
    }

    .m-safe-setting :deep(.van-cell) {
      margin-left: 0;
      margin-right: 0;
      margin-bottom: 12px;
      padding: 20px 24px;
      border: 1px solid #ebedf0;
      transition: all 0.3s ease;
    }

    .m-safe-setting :deep(.van-cell:hover) {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
      border-color: #d0d0d0;
      background-color: #fafbfc;
    }

    .m-safe-setting :deep(.van-cell__title) {
      font-size: 18px;
      font-weight: 600;
    }

    .m-safe-setting :deep(.van-cell__right-icon) {
      font-size: 18px;
    }

    /* PC端图标尺寸调整 */
    .icon-lock,
    .icon-shield {
      width: 24px;
      height: 24px;
      margin-right: 16px;
    }

    .icon-lock {
      &::before {
        width: 10px;
        height: 12px;
        border-width: 2px;
        border-top-width: 4px;
        border-bottom-width: 4px;
      }

      &::after {
        width: 8px;
        height: 8px;
        border-width: 2px;
        top: 5px;
      }
    }

    .icon-shield {
      &::before {
        width: 12px;
        height: 14px;
      }
    }
  }
}

/* 大屏PC端适配 */
@media (min-width: 1200px) {
  .m-safe-setting {
    max-width: 1000px;

    .m-mt10 {
      margin-top: 32px;
      padding: 0 32px;
    }

    .m-safe-setting :deep(.van-cell) {
      padding: 24px 32px;
      margin-bottom: 16px;
    }

    .m-safe-setting :deep(.van-cell__title) {
      font-size: 20px;
    }

    .m-safe-setting :deep(.van-cell__right-icon) {
      font-size: 20px;
    }

    /* 大屏图标尺寸调整 */
    .icon-lock,
    .icon-shield {
      width: 28px;
      height: 28px;
      margin-right: 20px;
    }

    .icon-lock {
      &::before {
        width: 12px;
        height: 14px;
        border-width: 3px;
        border-top-width: 4px;
        border-bottom-width: 4px;
      }

      &::after {
        width: 10px;
        height: 10px;
        border-width: 3px;
        top: 6px;
      }
    }

    .icon-shield {
      &::before {
        width: 14px;
        height: 16px;
      }
    }
  }
}

/* 超大屏适配 */
@media (min-width: 1600px) {
  .m-safe-setting {
    max-width: 1200px;
  }
}
</style>
