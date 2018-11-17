import path from 'path';
import merge from 'webpack-merge';
import { common, loaders } from './common.config';
import { ReactLoadablePlugin } from 'iso-loadable/webpack';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import ImageminPlugin from 'imagemin-webpack-plugin';
import glob from 'glob';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import StyleLintPlugin from 'stylelint-webpack-plugin';

import config from '../config';
const { server: { production } } = config;
const isDevelopment = !production;

export default merge(common, {
  context: path.resolve(__dirname, '../../src/client'),
  entry: {
    bundle: [
      '@babel/polyfill',
      './index.jsx'
    ],
    ie: './helpers/internet-explorer/ie.js'
  },
  output: {
    path: path.resolve(__dirname, '../../dist'),
    filename: '[name].js',
    chunkFilename: '[name].js',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(scss|sass)$/,
        exclude: /node_modules/,
        use: loaders({ modules: true })
      },
      {
        test: /\.(css)$/,
        use: loaders({})
      }
    ]
  },
  plugins: [
    new StyleLintPlugin({
      syntax: 'scss',
      context: path.resolve(__dirname, '../../src'),
      failOnError: !isDevelopment
    }),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[name].css'
    }),
    new ReactLoadablePlugin({
      filename: './dist/iso-loadable.json'
    }),
    new CleanWebpackPlugin(['dist'], {
      root: path.resolve(__dirname, '../../'),
      verbose: true,
      dry: false
    }),
    new ImageminPlugin({
      disable: true,
      pngquant: {
        quality: '70'
      },
      optipng: {
        optimizationLevel: 7
      },
      jpegtran: {
        progressive: true
      },
      externalImages: {
        sources: glob.sync('public/images/**/*.*')
      }
    })
  ]
});
