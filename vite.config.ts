import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          // 自定义元素白名单
          isCustomElement: tag => tag === 'marquee',
        },
      },
    }),
    // 自动导入 API
    AutoImport({
      // 自动导入 Vue 相关函数，如：ref, reactive, toRef 等
      imports: ['vue', 'vue-router', 'pinia'],
      // 自动导入 Element Plus 相关函数，如：ElMessage, ElMessageBox 等
      resolvers: [
        ElementPlusResolver(),
      ],
      // 生成自动导入的类型声明文件
      dts: 'src/auto-imports.d.ts',
      // eslint 配置
      eslintrc: {
        enabled: true,
        filepath: './.eslintrc-auto-import.json',
        globalsPropValue: true,
      },
    }),
    // 自动注册组件
    Components({
      // 组件自动导入的目录
      dirs: ['src/components'],
      // 组件的有效文件扩展名
      extensions: ['vue'],
      // 配置文件生成位置
      dts: 'src/components.d.ts',
      // 自动导入 Element Plus 组件
      resolvers: [
        ElementPlusResolver({
          // 自动引入样式
          importStyle: 'sass',
        }),
      ],
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@api': fileURLToPath(new URL('./src/api', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@views': fileURLToPath(new URL('./src/views', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@hooks': fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
    },
  },

  css: {
    preprocessorOptions: {
      // 配置 less
      less: {
        javascriptEnabled: true,
        // 全局变量文件
        additionalData: `@import "@/styles/variables.less";`,
      },
      // 配置 scss (Element Plus 使用)
      scss: {
        additionalData: `
          @use "@/styles/element-variables.scss" as *;
        `,
      },
    },
  },

  build: {
    // 构建目标
    target: 'es2015',
    // 输出目录
    outDir: 'dist',
    // 静态资源目录
    assetsDir: 'assets',
    // 小于此阈值的导入或引用资源将内联为 base64 编码
    assetsInlineLimit: 4096,
    // 启用/禁用 CSS 代码拆分
    cssCodeSplit: true,
    // 构建后是否生成 source map 文件
    sourcemap: false,
    // 打包配置
    rollupOptions: {
      output: {
        // 分包策略
        manualChunks: {
          // 将 vue 相关库打包到一个 chunk 中
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // 将 Element Plus 打包到一个 chunk 中
          'element-plus': ['element-plus'],
          // 将工具库打包到一个 chunk 中
          'utils': ['axios', 'dayjs', 'lodash-es'],
        },
        // 用于命名代码拆分时创建的共享块
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : []
          const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]'
          return `js/${fileName}/[name].[hash].js`
        },
        // 用于输出静态资源的命名
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.')
          let extType = info[info.length - 1]
          if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(assetInfo.name)) {
            extType = 'images'
          } else if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            extType = 'fonts'
          } else if (/\.css$/i.test(assetInfo.name)) {
            extType = 'css'
          }
          return `${extType}/[name].[hash].[ext]`
        },
        // 入口文件名
        entryFileNames: 'js/[name].[hash].js',
      },
    },
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生产环境移除 console
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  server: {
    // 服务器主机名
    host: true,
    // 端口号
    port: 3000,
    // 自动打开浏览器
    open: true,
    // 开启 CORS
    cors: true,
    // 代理配置
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8080',
        changeOrigin: true,
        // 可选：重写路径
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
      '/storage': {
        target: process.env.VITE_STORAGE_URL || 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },

  // 预览服务器配置
  preview: {
    port: 4173,
    host: true,
    open: true,
  },

  // 依赖优化配置
  optimizeDeps: {
    // 预构建包含的依赖
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'element-plus',
      'dayjs',
      '@element-plus/icons-vue',
    ],
    // 预构建中强制排除的依赖项
    exclude: [],
  },

  // 定义全局常量替换方式
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
})
