<template>
  <!-- 底部弹出 -->
  <van-popup
    class="m-pop"
    v-model:show="showBottom"
    closeable
    position="bottom"
    :style="{ height: '79%' }"
    :before-close="closeLoginPop"
  >
    <div class="m-pop-body">
      <van-image
        :src="getImgUrl(store.systemConf?.site_wap_logo ?? '')"
        class="m-pop-logo"
        fit="contain"
      ></van-image>
      <div class="m-pop-title">{{ $t('login.openFixed') }}</div>

      <van-form class="m-login-frm" ref="frmRefs">
        <van-cell-group inset>
          <!-- 通过 pattern 进行正则校验 -->
          <van-field
            v-model="username"
            name="username"
            left-icon="contact"
            :placeholder="$t('login.inputAccount')"
            :rules="[{ required: true, message: $t('login.inputRight') }]"
          />
          <!-- 通过 validator 进行函数校验 -->
          <van-field
            v-model="pwd"
            name="validator"
            type="password"
            left-icon="lock"
            :placeholder="$t('login.inputPwd')"
            :rules="[{ required: true, message: $t('login.inputRight') }]"
          />
        </van-cell-group>
      </van-form>
      <van-cell class="m-cell-checkbox">
        <van-checkbox v-model="remember" name="1" shape="square">{{
          $t('rememberMe')
        }}</van-checkbox>
      </van-cell>
      <van-cell class="m-cell">
        <van-button
          round
          block
          @click.stop="loginHandler"
          type="primary"
          native-type="submit"
          class="m-sub-btn"
          >{{ $t('login.login') }}</van-button
        >
      </van-cell>
      <van-cell class="m-cell-link">
        <span class="m-link-label" @click.stop="fotgetPwdHandler">{{
          $t('login.forgetPwd')
        }}</span>
        <div>|</div>
        <span class="m-link-label m-border" @click.stop="registerHandler">{{
          $t('login.registerNow')
        }}</span>
      </van-cell>
    </div>
  </van-popup>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useAppStore } from '@/stores/app'
import { getImgUrl } from '@/utils/tools'
import { showDialog, showToast } from 'vant'
import { useRouter } from 'vue-router'
import api from '@/api'
import { useI18n } from 'vue-i18n'

interface UserData {
  name?: string
  password?: string
}

const router = useRouter()
const { t } = useI18n()
const frmRefs = ref()
const props = defineProps({
  isShow: {
    type: Boolean,
    defalut: false,
  },
})
defineOptions({ name: 'LoginPop' })
const store = useAppStore()
const showBottom = ref(props.isShow)

// 校验函数返回 true 表示校验通过，false 表示不通过
// const validator = val => /1\d{10}/.test(val)
const username = ref('')
const pwd = ref('')
const remember = ref(false)
const captcha = ref({ key: '', value: '' })

function fotgetPwdHandler() {
  showDialog({ message: t('login.resetpwdForCustomer') })
}
function registerHandler() {
  router.push({ name: 'register' })
}
function closeLoginPop() {
  showBottom.value = false
  store.$patch({ loginShow: false })
}

async function loginHandler() {
  store.loading()

  try {
    // 表单验证
    await frmRefs.value?.validate()

    // 调用登录 API
    const resp = await api.login({
      name: username.value,
      password: pwd.value,
      key: captcha.value?.key ?? '',
      captcha: captcha.value?.value ?? '',
    })

    console.log('login resp', resp)

    if (resp && resp.code === 200) {
      const { access_token, user_info } = resp.data || {}

      if (!access_token) {
        showToast('登录失败：未获取到访问令牌')
        return
      }

      // 设置 token
      store.setToken(access_token)
      console.log('Token 设置成功:', access_token)

      // 直接使用登录响应中的用户信息，避免额外的 API 调用
      if (user_info) {
        // 转换用户信息格式以匹配 store 期望的格式
        const userForStore = {
          id: user_info.id,
          name: user_info.name,
          nick_name: user_info.nick_name,
          money: user_info.money,
          level: user_info.vip_grade, // 将 vip_grade 映射为 level
          vip_grade: user_info.vip_grade
        }

        store.setUser(userForStore)
        console.log('用户信息设置成功:', userForStore)
      }

      // 保存记住我选项
      if (remember.value) {
        localStorage.setItem(
          'rememberMe',
          JSON.stringify({
            name: username.value,
            password: pwd.value,
          }),
        )
      } else {
        // 如果取消记住我，清除之前保存的信息
        localStorage.removeItem('rememberMe')
      }

      // 显示登录成功消息
      showToast(t('login.loginSuccess'))

      // 关闭登录弹窗
      store.$patch({ loginShow: false })

      console.log('登录流程完成')

    } else {
      // 登录失败
      const errorMessage = resp?.data || resp?.message || '登录失败'
      showToast(errorMessage)
      console.error('登录失败:', resp)
    }

  } catch (error) {
    console.error('登录过程中发生错误:', error)

    // 显示错误信息
    const errorMessage = (error as any)?.message || '登录过程中发生错误'
    showToast(errorMessage)

    // 如果是验证码相关错误，刷新验证码
    if (errorMessage.includes('验证码')) {
      await getCaptcha()
    }
  } finally {
    store.stopLoad()
  }
}

async function getCaptcha() {
  try {
    const resp = await api.authCaptcha()
    if (resp && resp.code === 200 && resp.data) {
      captcha.value.key = resp.data
    }
  } catch (err: unknown) {
    console.log('获取验证码失败:', err)
  }
}

watch(
  () => store.loginShow,
  (n, o) => {
    console.log('loginShow:', n, o)
    showBottom.value = n
  },
  { immediate: true, deep: true },
)

onMounted(async () => {
  // 恢复记住的登录信息
  const rm = localStorage.getItem('rememberMe')
  if (rm) {
    try {
      const user: UserData = JSON.parse(rm)
      username.value = user?.name ?? ''
      pwd.value = user?.password ?? ''
      remember.value = true // 如果有记住的信息，勾选记住我
    } catch (err: unknown) {
      console.log('恢复记住的登录信息失败:', err)
      // 清除损坏的数据
      localStorage.removeItem('rememberMe')
    }
  }

  // 获取验证码
  await getCaptcha()
})
</script>

<style lang="less" scoped>
.m-pop {
  .m-pop-body {
    padding: 50px 40px;
    display: flex;
    flex-direction: column;
    flex: 1;
    flex-wrap: nowrap;
    align-content: space-around;
    justify-content: flex-start;
    align-items: flex-start;
    .m-pop-logo {
      height: 35px;
    }
    .m-pop-title {
      margin: 10px 0px 45px 0px;
      font-size: 21px;
      font-weight: 400;
      color: var(--van-text-color);
    }
    .m-login-frm {
      border: 1px solid #e0e4e8;
      border-radius: 0.13333rem;
      overflow: hidden;
      box-shadow: 0 0.16rem 0.42667rem 0.02667rem rgba(0, 0, 0, 0.04);
      width: 100%;
      margin: 0px;
    }
    .m-cell-checkbox {
      padding: 10px 0px;
      &::after {
        border: 0px;
      }
    }
    .m-cell {
      padding: 40px 0 0 0;
    }
    .m-sub-btn {
      height: 48px;
      font-size: 16px;
    }
    .m-cell-link {
      padding: 30px 0px 10px 0px;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
    }
    .m-link-label {
      display: flex;
      justify-content: center;
      align-items: center;
      -webkit-box-flex: 1;
      -webkit-flex: 1;
      -ms-flex: 1;
      flex: 1;
      text-align: center;
      color: #0091ff;
      white-space: nowrap;
      &::before {
        border-left: 1px solid #c8c8c8;
      }
    }
    .m-border {
    }
  }
}
</style>
<style lang="less">
.m-pop {
  .van-popup__close-icon {
    font-size: 14px;
    color: #737373;
  }
  .m-login-frm {
    .van-cell-group--inset {
      margin: 0px;
      .van-field__left-icon {
        .van-icon {
          color: var(--van-image-placeholder-text-color);
        }
      }
    }
    .van-cell:after {
      left: 0px;
      right: 0px;
      border: 0.5px solid #e0e4e8;
    }
  }
  .m-cell-link {
    .van-cell__value {
      display: flex;
      flex-direction: row;
    }
  }
}
</style>
