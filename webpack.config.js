var webpack = require('webpack')
var Clean = require('clean-webpack-plugin')

module.exports = {
  entry: {
    application: './source/assets/javascripts/application.js'
  },

  resolve: {
    root: __dirname + '/source/assets/javascripts'
  },

  output: {
    path: __dirname + '/.tmp/dist',
    filename: 'assets/javascripts/[name].js'
  },

  module: {
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
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/)
  ]
}
