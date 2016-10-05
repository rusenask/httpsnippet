var path = require('path');
var webpack = require('webpack');
var UnminifiedWebpackPlugin = require('unminified-webpack-plugin');

module.exports = {
  entry: './browser.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'httpsnippet.browser.ie11.min.js',
    library: 'HTTPSnippet'
  },
  module: {
    loaders: [
      {
        test: /\.json$/,
        loader: 'json-loader'
      },
      {
        test: /\.js$/,
        loader: 'webpack-replace',
        query: {
          replace: [
            {
              from: 'MultiPartForm',
              to: 'FormData'
            }, {
              from: "var es = require('event-stream')",
              to: ''
            },
            // Dirty & temporary fix for har-validator/lib/async compatibility issues.
            {
              from: 'throw err',
              to: ''
            }
          ]
        }
      }
    ]
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      }
    }),
    new UnminifiedWebpackPlugin()
  ]
};
