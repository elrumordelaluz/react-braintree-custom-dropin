const webpack = require('webpack')
const { join } = require('path')

const config = {
  mode: 'development',
  entry: {
    main: __dirname + '/docs.js',
  },
  output: {
    path: join(__dirname, 'docs'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        loader: 'babel-loader',
        test: /\.jsx?$/,
        exclude: /node_modules/,
      },
    ],
  },
  devtool: 'source-map',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development'
      ),
    }),
  ],
  node: {
    fs: 'empty',
  },
  devServer: {
    hot: false,
    inline: true,
    port: 3721,
    historyApiFallback: true,
    contentBase: 'docs/',
    stats: {
      colors: true,
      profile: true,
      hash: false,
      version: false,
      timings: false,
      assets: true,
      chunks: false,
      modules: false,
      reasons: true,
      children: false,
      source: true,
      errors: true,
      errorDetails: false,
      warnings: true,
      publicPath: false,
    },
  },
}

// console.log(config)

module.exports = config
