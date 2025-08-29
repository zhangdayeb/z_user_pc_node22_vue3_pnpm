<template>
  <footer class="p-footer">
    <!-- 合作伙伴区域 -->
    <div class="p-footer-wrapper">
      <div class="p-partner-icons">
        <img
          v-for="i in 10"
          :key="i"
          :src="`/src/assets/web/footer/${i}.png`"
          :alt="`合作伙伴 ${i}`"
          class="p-partner-icon"
        />
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="p-footer-wrapper2">
      <!-- 品牌信息 -->
      <div class="p-brand">
        <div class="p-logo-area">
          <el-icon class="p-logo-icon">
            <Medal />
          </el-icon>
          <span class="p-logo-text">ATB</span>
        </div>
        <p>{{ $t('footer.brandInfo1') }}</p>
        <p>{{ $t('footer.brandInfo2') }}</p>
      </div>

      <!-- 认证信息 -->
      <div class="p-brand2">
        <section>
          <el-icon class="p-cert-icon">
            <Stamp />
          </el-icon>
          <p>{{ $t('footer.mga') }}</p>
        </section>
        <section>
          <el-icon class="p-cert-icon">
            <Checked />
          </el-icon>
          <p>{{ $t('footer.bvi') }}</p>
        </section>
        <section>
          <el-icon class="p-cert-icon">
            <CircleCheck />
          </el-icon>
          <p>{{ $t('footer.gc') }}</p>
        </section>
        <section>
          <el-icon class="p-cert-icon">
            <SuccessFilled />
          </el-icon>
          <p>{{ $t('footer.pagcor') }}</p>
        </section>
      </div>

      <!-- 关于我们链接 -->
      <div class="p-brand3">
        <RouterLink to="/aboutUs/1" class="p-about-link">关于我们</RouterLink>
        <RouterLink to="/aboutUs/2" class="p-about-link">使用条款</RouterLink>
        <RouterLink to="/aboutUs/3" class="p-about-link">隐私政策</RouterLink>
        <RouterLink to="/aboutUs/4" class="p-about-link">负责任博彩</RouterLink>
      </div>
    </div>

    <!-- 版权信息 -->
    <div class="p-footer-wrapper3">
      <p>{{ $t('footer.disclaimer') }}</p>
      <p>{{ $t('footer.copyright') }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
import {
  Medal,
  Stamp,
  Checked,
  CircleCheck,
  SuccessFilled
} from '@element-plus/icons-vue'

defineOptions({ name: 'PcCommonFooter' })
</script>

<style lang="less" scoped>
.p-footer {
  width: 100%;
  background: #343d4a;
  color: #828e9e;
  font-size: 14px;
  min-height: calc(370px / var(--Cardinality));
  text-align: center;
  position: relative;

  &-wrapper {
    max-width: var(--web-max-width);
    min-width: var(--web-min-width);
    width: 100%;
    box-sizing: border-box;
    border-bottom: 1px solid #4e5665;
    margin: 0 auto;
    padding: 20px 0;

    .p-partner-icons {
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-wrap: wrap;
      gap: 30px;

      .p-partner-icon {
        height: 40px;
        width: auto;
        max-width: 80px;
        object-fit: contain;
        transition: all 0.3s;
        cursor: pointer;
        filter: grayscale(100%) opacity(0.7);

        &:hover {
          filter: grayscale(0%) opacity(1);
          transform: scale(1.1);
        }
      }
    }
  }

  &-wrapper2 {
    max-width: var(--web-max-width);
    min-width: var(--web-min-width);
    width: calc(1120px / var(--Cardinality));
    min-height: calc(194px / var(--Cardinality));
    margin: 0 auto;
    display: flex;
    text-align: left;
    align-items: center;
    justify-content: space-between;
    padding: 30px 0;

    .p-brand {
      .p-logo-area {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 15px;

        .p-logo-icon {
          font-size: 40px;
          color: #fff;
        }

        .p-logo-text {
          font-size: 24px;
          font-weight: bold;
          color: #fff;
        }
      }

      p {
        font-size: calc(14px / var(--Cardinality));
        line-height: 20px;
        margin: 5px 0;
      }
    }

    .p-brand2 {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      text-align: left;
      width: calc(500px / var(--Cardinality));
      gap: 20px;

      section {
        width: calc(215px / var(--Cardinality));
        text-align: left;
        margin-bottom: calc(8px / var(--Cardinality));
        cursor: pointer;
        transition: all 0.3s;

        &:hover {
          .p-cert-icon {
            color: #409eff;
            transform: scale(1.1);
          }
          p {
            color: #fff;
          }
        }

        .p-cert-icon {
          font-size: 40px;
          color: #828e9e;
          transition: all 0.3s;
          margin-bottom: 10px;
        }

        p {
          padding-left: calc(10px / var(--Cardinality));
          font-size: calc(14px / var(--Cardinality));
        }
      }
    }

    .p-brand3 {
      display: flex;
      flex-direction: column;
      gap: 10px;

      .p-about-link {
        color: #828e9e;
        font-size: calc(14px / var(--Cardinality));
        line-height: 20px;
        text-decoration: none;
        transition: all 0.3s;

        &:hover {
          color: #fff;
          padding-left: 5px;
        }
      }
    }
  }

  &-wrapper3 {
    max-width: var(--web-max-width);
    min-width: var(--web-min-width);
    width: 100%;
    margin: 0 auto;
    font-size: calc(14px / var(--Cardinality));
    line-height: 25px;
    padding: 20px 0;
    border-top: 1px solid #4e5665;

    p {
      margin: 5px 0;
      color: #828e9e;
    }
  }
}
</style>
