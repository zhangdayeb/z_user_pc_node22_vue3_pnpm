<template>
  <CommonHeader />
  <RouterView />
  <CommonFooter />
</template>

<script setup lang="ts">
import CommonHeader from '../components/CommonHeader.vue'
import CommonFooter from '../components/CommonFooter.vue'
defineOptions({ name: 'WebHomeIndex' })
</script>

<style lang="less" scoped></style>
<style lang="less">
@import url('../common.less');

#app {
  min-width: 1300px;
}
</style>
