import { showToast } from "vant";
import { useAppStore } from '@/stores/app'

function logout() {
  const store = useAppStore()
  store.logout()
}

let isConfirming = false;

export function resolveResError(code, message) {
  switch (code) {
    case 401:
      logout()
      showToast({
        message: '鉴权失败，请重新登录',
        onClose: () => {
          window.location.href = '/'
        }
      })
      return false;
    case 11007:
    case 11008:
      if (isConfirming) return;
      isConfirming = true;
      if (typeof $dialog !== 'undefined') {
        $dialog.confirm({
          title: '提示',
          type: 'info',
          content: `${message}，是否重新登录？`,
          confirm() {
            logout();
            showToast('已退出登录');
            isConfirming = false;
          },
          cancel() {
            isConfirming = false;
          },
        });
      } else {
        // 如果没有 $dialog，使用简单的确认框
        const confirmed = confirm(`${message}，是否重新登录？`);
        if (confirmed) {
          logout();
          showToast('已退出登录');
        }
        isConfirming = false;
      }
      return false;
    case 403:
      message = '请求被拒绝';
      break;
    case 404:
      message = '请求资源或接口不存在';
      break;
    case 500:
      message = message || '服务器发生异常';
      if(message == '用户不存在'){
        localStorage.clear()
      }
      break;
    default:
      message = message ?? `【${code}】: 未知异常!`;
      break;
  }
  return message;
}
