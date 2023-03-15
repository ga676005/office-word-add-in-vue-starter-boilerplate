const path = require('node:path')
const devCerts = require('office-addin-dev-certs')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
const webpack = require('webpack')
const { NaiveUiResolver } = require('unplugin-vue-components/resolvers')
const Components = require('unplugin-vue-components/webpack')
const AutoImport = require('unplugin-auto-import/webpack')

const urlDev = 'https://localhost:3000/'
const urlProd = 'https://www.contoso.com/' // CHANGE THIS TO YOUR PRODUCTION DEPLOYMENT LOCATION

async function getHttpsOptions() {
  const httpsOptions = await devCerts.getHttpsServerOptions()
  return { ca: httpsOptions.ca, key: httpsOptions.key, cert: httpsOptions.cert }
}

module.exports = async (env, options) => {
  const dev = options.mode === 'development'
  const config = {
    devtool: 'source-map',
    entry: {
      polyfill: ['core-js/stable', 'regenerator-runtime/runtime'],
      taskpane: ['./src/taskpane.js', './src/taskpane.html', './src/main.js'],
      commands: './src/commands/commands.js',
    },
    output: {
      clean: true,
    },
    resolve: {
      extensions: ['.html', '.js', '.vue'],
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          use: ['vue-loader'],
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
            },
          },
        },
        {
          test: /\.html$/,
          exclude: /node_modules/,
          use: 'html-loader',
        },
        {
          test: /\.(png|jpg|jpeg|gif|ico)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext][query]',
          },
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', 'postcss-loader'],
        },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: true, // If you are using the options api.
        __VUE_PROD_DEVTOOLS__: false, // If you don't want people sneaking around your components in production.
      }),
      new HtmlWebpackPlugin({
        filename: 'taskpane.html',
        template: './src/taskpane.html',
        chunks: ['taskpane', 'vendor', 'polyfill'],
      }),
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'assets/*',
            to: 'assets/[name][ext][query]',
          },
          {
            from: 'manifest*.xml',
            to: '[name]' + '[ext]',
            transform(content) {
              if (dev)
                return content

              else
                return content.toString().replace(new RegExp(urlDev, 'g'), urlProd)
            },
          },
        ],
      }),
      new HtmlWebpackPlugin({
        filename: 'commands.html',
        template: './src/commands/commands.html',
        chunks: ['polyfill', 'commands'],
      }),
      // new webpack.ProvidePlugin({
      //   Promise: ["es6-promise", "Promise"],
      // }),

      Components({
        resolvers: [
          NaiveUiResolver(),
        ],
        dts: true,
        types: [{
          from: 'vue-router',
          names: ['RouterLink', 'RouterView'],
        }],
      }),
      AutoImport({
        // targets to transform
        include: [
          /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
          /\.vue$/, /\.vue\?vue/, // .vue
          /\.md$/, // .md
        ],

        // global imports to register
        imports: [
          // presets
          'vue',
          'vue-router',
          // '@vueuse/core',
          // // custom
          // {
          //   '@vueuse/core': [
          //     // named imports
          //     'useMouse', // import { useMouse } from '@vueuse/core',
          //     // alias
          //     ['useFetch', 'useMyFetch'], // import { useFetch as useMyFetch } from '@vueuse/core',
          //   ],
          //   'axios': [
          //     // default imports
          //     ['default', 'axios'], // import { default as axios } from 'axios',
          //   ],
          //   '[package-name]': [
          //     '[import-names]',
          //     // alias
          //     ['[from]', '[alias]'],
          //   ],
          // },
          // // example type import
          // {
          //   from: 'vue-router',
          //   imports: ['RouteLocationRaw'],
          //   type: true,
          // },
        ],
        // Enable auto import by filename for default module exports under directories
        defaultExportByFilename: false,

        // Auto import for module exports under directories
        // by default it only scan one level of modules under the directory
        dirs: [
          // './hooks',
          // './composables' // only root modules
          // './composables/**', // all nested modules
          // ...
        ],

        // Filepath to generate corresponding .d.ts file.
        // Defaults to './auto-imports.d.ts' when `typescript` is installed locally.
        // Set `false` to disable.
        dts: './auto-imports.d.ts',

        // Cache the result of resolving, across multiple vite builds.
        // A custom path is supported.
        // When set to `true`, the cache will be stored in `node_modules/.cache/unplugin-auto-import.json`.
        cache: false,

        // Auto import inside Vue template
        // see https://github.com/unjs/unimport/pull/15 and https://github.com/unjs/unimport/pull/72
        vueTemplate: true,

        // Generate corresponding .eslintrc-auto-import.json file.
        // eslint globals Docs - https://eslint.org/docs/user-guide/configuring/language-options#specifying-globals
        eslintrc: {
          enabled: false, // Default `false`
          filepath: './.eslintrc-auto-import.json', // Default `./.eslintrc-auto-import.json`
          globalsPropValue: true, // Default `true`, (true | false | 'readonly' | 'readable' | 'writable' | 'writeable')
        },
      }),
    ],
    devServer: {
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      server: {
        type: 'https',
        options: (env.WEBPACK_BUILD || options.https !== undefined) ? options.https : await getHttpsOptions(),
      },
      port: process.env.npm_package_config_dev_server_port || 3000,
      // hot: true,
    },
    optimization: {
      runtimeChunk: 'single',
    },
  }

  return config
}
