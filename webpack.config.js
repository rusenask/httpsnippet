module.exports = {
  entry: './browser.js',
  output: {
    path: './bin',
    filename: 'httpsnippet.browser.js',
    library: 'HTTPSnippet'
  },
  module: {
    loaders: [{
      test: /\.json$/,
      loader: 'json-loader'
    }
    ]
  }
};
