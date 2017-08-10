var webpack = require('webpack')
var Clean = require('clean-webpack-plugin')

module.exports = {
  entry: {
    application: './source/assets/javascripts/application.js'
  },

  resolve: {
    root: __dirname + '/source/assets/javascripts',
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },

  output: {
    path: __dirname + '/.tmp/dist',
    filename: 'assets/javascripts/[name].js'
  },

  module: {
    noParse: /node_modules\/localforage\/dist\/localforage.js/,
    loaders: [
      {
        test: /source\/assets\/javascripts\/.*\.js$/,
        exclude: /node_modules|\.tmp|vendor/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'stage-0']
        }
      }
    ]
  },

  node: {
    console: true
  },

  plugins: [
    new Clean(['.tmp']),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery'
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}
