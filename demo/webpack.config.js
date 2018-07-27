// Чтобы отключить css source maps, добавь параметр --env.disableCssSourceMap к вызову вебпака

const webpack = require('webpack');
const path = require('path');


const makeAppConfig = () => ({
  mode: 'development',
  //context: path.resolve(__dirname),

  entry: {
    main: ['./platform/index.js'],
  },
  output: {
    path: __dirname,
    filename: 'main.js',
    publicPath: '/dist/',
  },
  watchOptions: {
    aggregateTimeout: 100,
  },
  plugins: [
    new webpack.IgnorePlugin(/\.\/locale/),
  ],
  module: {
    rules: [
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.html$/,
        use: ['ignore-loader'],
      },
      {
        test: /\.scss$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'sass-loader',
          },
        ],
      },

    ],
  },
  resolve: {
    modules: [
      path.resolve('../'),
      'node_modules',
    ],
    alias: {},
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    open: true,
    port: 9000
  },
});

module.exports = makeAppConfig();
