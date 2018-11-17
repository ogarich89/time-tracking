import webpack from 'webpack';
import config from '../config';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
const { server: { production } } = config;
const isDevelopment = !production;

const common = {
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devtool: isDevelopment ? 'source-map' : false,
  stats: {
    assets  : true,
    modules : false,
    hash    : false,
    children: false,
    warnings: false
  },
  mode: isDevelopment ? 'development' : 'production',
  optimization: {
    splitChunks: false
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'eslint-loader'
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.(svg)$/,
        use: [
          {
            loader: 'svg-inline-loader?idPrefix&classPrefix'
          }
        ]
      }
    ]
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      isDevelopment,
      timestamp: JSON.stringify(+ new Date())
    }),
    new webpack.LoaderOptionsPlugin({ options: { failOnError: !isDevelopment } })
  ]
};

const loaders = (() => ({ modules = false, isServer = false }) => {
  const arr = [
    {
      loader: `css-loader${isServer ? '/locals' : ''}`,
      options: {
        sourceMap: isDevelopment,
        modules,
        camelCase: modules,
        importLoaders: 2,
        localIdentName: modules ? '[local]_[hash:base64:5]' : false
      }
    },
    {
      loader: 'postcss-loader',
      options: {
        sourceMap: isDevelopment
      }
    },
    {
      loader: 'sass-loader',
      options: {
        sourceMap: isDevelopment,
        outputStyle: 'compressed'
      }
    }
  ];

  if(!isServer) {
    arr.unshift(MiniCssExtractPlugin.loader);
  }
  return arr;
})();

export { common, loaders };
