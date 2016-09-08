const webpack = require('webpack'),
  autoprefixer = require('autoprefixer'),
  path = require('path'),
  DefinePlugin = require('webpack/lib/DefinePlugin'),
  ExtractTextPlugin = require('extract-text-webpack-plugin'),
  CopyWebpackPlugin = require('copy-webpack-plugin'),
  HtmlWebpackPlugin = require('html-webpack-plugin'),
  precss = require('precss'),
  fs = require('fs')
  ;

module.exports = {
  target: 'web',
  entry: {
    main: [__root('../client/app/main.ts')],
    polyfills: [__root('../client/app/polyfills.ts')],
    vendor: [__root('../client/app/vendors.ts')],
  },
  output: {
    path: __root('../build'),
    publicPath: '/static',
    pathinfo: false,
  },
  externals: [__root('node_modules')],
  resolve: {
    root: [__root("node_modules")],
    extensions: ['', '.ts', '.js', '.scss'],
    cache: true,
    modulesDirectories: ['node_modules'],
  },
  module: {
    loaders: [
      { test: /\.html$/, loader: 'html' },     
      {
        test: /\.css$/,
        include: __root("../client/assets"),
        loader: ExtractTextPlugin.extract(['css', 'postcss'])
      },
      { test: /\.css$/, include: __root('../client/app'), loader: 'raw!postcss' },
      {
        test: /\.scss$/,
        include: __root("../client/assets"),
        loader: ExtractTextPlugin.extract(['css', 'postcss', 'sass'])
      },
      { test: /\.scss$/, include: __root('../client/app'), loader: 'raw!postcss!sass' },       
      {
        test: /\.ts$/,
        loaders: [
          'awesome-typescript-loader'        
        ],
        exclude: [/\.(spec|e2e)\.ts$/]
      }     
    ]
  },
  plugins: [    
     new webpack.optimize.CommonsChunkPlugin({
      name: ['polyfills', 'vendor'].reverse()
    }),
    new HtmlWebpackPlugin({
      template: __root('../client/index.html'),
      chunksSortMode: 'dependency'
    }),
    new DefinePlugin({
      ENV: JSON.stringify(process.env.NODE_ENV)
    }),
    new CopyWebpackPlugin([
      { from: __root('../client/assets/images'), to: 'assets/images' },
      { from: __root('../client/assets/vendors'), to: 'assets/vendors' }
    ]),
  ],
  postcss: () => {
    return [
      autoprefixer({ browsers: ['last 2 versions'] }),
      precss
    ];
  }
};

function __root() {
  var _root = path.resolve(__dirname);
  var args = Array.prototype.slice.call(arguments);
  return path.join.apply(path, [_root].concat(args));
}
