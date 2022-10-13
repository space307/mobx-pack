// Чтобы отключить css source maps, добавь параметр --env.disableCssSourceMap к вызову вебпака
import path from 'node:path';
import webpack from 'webpack';
import HtmlPlugin from 'html-webpack-plugin';

const makeAppConfig = () => ({
  mode: 'development',
  entry: {
    main: ['./platform/index.ts'],
  },
  output: {
    path: path.resolve('dist'),
    filename: 'main.js',
    publicPath: '/dist/',
  },
  watchOptions: {
    aggregateTimeout: 100,
  },
  plugins: [
    new webpack.IgnorePlugin({ resourceRegExp: /\.\/locale/ }),
    new HtmlPlugin({
      template: './index.html',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
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
    modules: [path.resolve('../node_modules'), 'node_modules'],
    alias: {
      'mobx-pack': path.resolve('../dist'),
    },
    extensions: ['.ts', '.tsx', '.js'],
  },
  devServer: {
    open: true,
    port: 9000,
  },
  devtool: 'source-map',
});

export default makeAppConfig();
