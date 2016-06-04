module.exports = {
  entry: './browser.js',
  output: {
    path: './bin',
    filename: 'httpsnippet.browser.js',
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
            }
          ]
        }
      }
    ]
  }
};
