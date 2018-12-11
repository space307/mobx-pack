// Чтобы отключить css source maps, добавь параметр --env.disableCssSourceMap к вызову вебпака

const webpack = require('webpack');
const path = require('path');

const makeAppConfig = () => ({
  mode: 'development',
  entry: {
    main: ['./platform/index.js'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: '/dist/',
  },
  watchOptions: {
    aggregateTimeout: 100,
  },
  plugins: [new webpack.IgnorePlugin(/\.\/locale/)],
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-flow',
              ],
              plugins: [
                [
                  '@babel/plugin-proposal-decorators',
                  {
                    legacy: true,
                  },
                ],
                [
                  '@babel/plugin-proposal-class-properties',
                  {
                    loose: true,
                  },
                ],
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-syntax-import-meta',
                '@babel/plugin-proposal-json-strings',
                '@babel/plugin-proposal-function-sent',
                '@babel/plugin-proposal-export-namespace-from',
                '@babel/plugin-proposal-numeric-separator',
                '@babel/plugin-proposal-throw-expressions',
                '@babel/plugin-proposal-export-default-from',
                '@babel/plugin-proposal-logical-assignment-operators',
                '@babel/plugin-proposal-optional-chaining',
                [
                  '@babel/plugin-proposal-pipeline-operator',
                  {
                    proposal: 'minimal',
                  },
                ],
                '@babel/plugin-proposal-nullish-coalescing-operator',
                '@babel/plugin-proposal-do-expressions',
              ],
            },
          },
        ],
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
    modules: [path.resolve('../'), 'node_modules'],
    alias: {},
    extensions: ['.js', '.jsx'],
  },
  devServer: {
    open: true,
    port: 9000,
  },
});

module.exports = makeAppConfig();
