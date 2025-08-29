import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import vueDevTools from 'vite-plugin-vue-devtools'
import postcssPxToViewport from 'postcss-px-to-viewport'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from '@vant/auto-import-resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: tag => tag === 'marquee',
        },
      },
    }),
    AutoImport({
      resolvers: [VantResolver(), ElementPlusResolver()],
    }),
    Components({
      resolvers: [VantResolver(), ElementPlusResolver()],
    }),
    // vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    postcss: {
      plugins: [
        postcssPxToViewport({
          unitToConvert: 'px',
          viewportWidth: 375,
          maxViewportWidth: 750,
          viewportHeight: 667,
          unitPortUnit: 5,
          viewportUnit: 'vw',
          fontViewportUnit: 'vw', // 字体使用的视口单位
          selectorBlackList: ['.ignore', '.hairlines'],
          minPixelValue: 1,
          mediaQuery: false,
          exclude: [/node_modules/, /src\/views\/pc/],
          include: [/src\/views\/mobile/],
        }),
        postcssPxToViewport({
          unitToConvert: 'px', // 需要转换的单位，默认为"px"
          viewportWidth: 1920, // 设计稿的视口宽度
          viewportHeight: 1080, // 视口高度，默认可不设置
          unitPrecision: 5, // 单位转换后保留的精度
          propList: ['*'], // 能转化为vw的属性列表
          viewportUnit: 'vw', // 希望使用的视口单位
          fontViewportUnit: 'vw', // 字体使用的视口单位
          selectorBlackList: [
            '.ignore',
            '.hairlines',
            '.np-',
            '.p-',
            '#app',
            'common.less',
          ], // 需要忽略的CSS选择器，不会转为视口单位，使用原有的px等单位。
          minPixelValue: 1, // 设置最小的转换数值，如果为1的话，只有大于1的值会被转换
          mediaQuery: false, // 媒体查询里的单位是否需要转换单位
          replace: true, //  是否直接更换属性值，而不添加备用属性
          exclude: [/node_modules/, /src\/views\/mobile/], // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
          include: [/src\/views\/pc/], // 如果设置了include，那将只有匹配到的文件才会被转换
          landscape: false, // 是否添加根据 landscapeWidth 生成的媒体查询条件 @media (orientation: landscape)
          landscapeUnit: 'vw', // 横屏时使用的单位
          landscapeWidth: 1920, // 横屏时使用的视口宽度
        }),
      ],
    },
  },
  server: {
    host: true,
    proxy: {
      '/api': {
        target: '',
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/api/, '/api'),
      },
      '/storage': {
        target: '',
        changeOrigin: true,
        // rewrite: path => path.replace(/^\/storage/, '/storage/'),
      },
    },
  },
})
