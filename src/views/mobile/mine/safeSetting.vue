<template>
  <div class="m-safe-setting">
    <van-nav-bar
      left-arrow
      :title="$t('mine.safeSetting')"
      @click-left="onClickLeft"
    />
    <van-cell-group class="m-mt10">
      <van-cell :title="$t('mine.loginPwd')" is-link to="/modifyPwd"></van-cell>
      <van-cell
        :title="$t('mine.withdrawPwd')"
        is-link
        to="/withdrawalPwd"
      ></van-cell>
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
  background: #eef3f8;
  flex: 1;

  .m-mt10 {
    margin-top: 10px;
  }
}
</style>
