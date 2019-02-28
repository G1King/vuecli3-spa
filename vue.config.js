const fs = require('fs');
const path = require('path');;
const SizePlugin = require('size-plugin')
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const isProductionEnvFlag = process.env.NODE_ENV === 'production'
function resolveRealPath(dir) {
    return path.join(__dirname,dir)
}
function loadGlobalStyles() {
    // const variables = fs.readFileSync('src/assets/styles/variables.scss', 'utf-8')
    // const mixins = fs.readFileSync('src/assets/styles/mixins.scss', 'utf-8')
    // return variables + mixins
}
module.exports = {
  publicPath:'/',
  outputDir: 'dist',
  lintOnSave: true,
  runtimeCompiler: false,
  transpileDependencies: [
      /* string or regex */
  ],
productionSourceMap: process.env.NODE_ENV !== 'production',
 css: {
    sourceMap: false,
     loaderOptions: {
         sass: {
             data: loadGlobalStyles()
         }
     }
 },
 chainWebpack:config => {
  config.resolve.alias
       .set('vue$', 'vue/dist/vue.esm.js')
       .set('@helper', resolveRealPath('src/helper'))
       .set('@v', resolveRealPath('src/views'))
       .set('@assets', resolveRealPath('src/assets'))
       .set('@router', resolveRealPath('src/router'))
       .set('@c', resolveRealPath('src/components'))


        config.module.rules.delete('svg')
        config.module
            .rule('svg')
            .test(/\.svg$/)
            .use('svg-sprite-loader')
            .loader('svg-sprite-loader')
            .options({
                name: '[name]-[hash:7]',
                prefixize: true
            })

        const splitOptions = config.optimization.get('splitChunks')
        config.optimization.splitChunks(
            Object.assign({}, splitOptions, {
                // （缺省值5）按需加载时的最大并行请求数
                maxAsyncRequests: 16,
                // （默认值3）入口点上的最大并行请求数
                maxInitialRequests: 16,
                // （默认值：1）分割前共享模块的最小块数
                minChunks: 1,
                // （默认值：30000）块的最小大小
                minSize: 30000,
                // webpack 将使用块的起源和名称来生成名称: `vendors~main.js`,如项目与"~"冲突，则可通过此值修改，Eg: '-'
                automaticNameDelimiter: '~',
                // cacheGroups is an object where keys are the cache group names.
                name: true,
                cacheGroups: {
                    default: false,
                    common: {
                        name: `chunk-common`,
                        minChunks: 2,
                        priority: -20,
                        chunks: 'initial',
                        reuseExistingChunk: true
                    },
                    // element: {
                    //     name: 'element',
                    //     test: /[\\/]node_modules[\\/]element-ui[\\/]/,
                    //     chunks: 'initial',
                    //     // 默认组的优先级为负数，以允许任何自定义缓存组具有更高的优先级（默认值为0）
                    //     priority: -30
                    // }
                }
            })
        )

        // https://github.com/webpack-contrib/webpack-bundle-analyzer
        if (process.env.npm_config_report) {
            config
                .plugin('webpack-bundle-analyzer')
                .use(require('webpack-bundle-analyzer').BundleAnalyzerPlugin)
        }
 },
configureWebpack: {
        plugins: [
            isProductionEnvFlag ? new PrerenderSPAPlugin({
                // Required - The path to the webpack-outputted app to prerender.
                staticDir: path.join(__dirname, 'dist'),
                // Required - Routes to render.
                routes: ['/', '/explore']
            }) : () => {},
            // NEED FIX 🚧 : HardSourceWebpackPlugin Will Cause Error.
            // new HardSourceWebpackPlugin(),
            isProductionEnvFlag ? new SizePlugin() : () => {},
            isProductionEnvFlag ? new BundleAnalyzerPlugin():()=>{}
        ]
    },

    // use thread-loader for babel & TS in production build
    // enabled by default if the machine has more than 1 cores

    devServer: {
            open: process.platform === 'darwin',
            host: 'localhost',
            port: 8080,
            https: false,
            hotOnly: false,
            // See https://github.com/vuejs/vue-cli/blob/dev/docs/cli-service.md#configuring-proxy
            proxy: null, // string | Object
            before: app => {}
        },

        // options for 3rd party plugins
        pluginOptions: {}


}