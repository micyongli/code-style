const path = require('path')
const webpack = require('webpack')
let config = {
  entry: { 'js/index': `./src/index.js` },
  output: {
    filename: '[name].js',
    path: `${__dirname}/../server/public`
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['env', 'react', 'es2015', 'es2017', 'stage-0']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(ttf|svg|eot|woff|woff2|png|jpe?g|gif)(\?\S*)?$/,
        loader: 'file-loader',
        options: {
          name: 'css/[name].[ext]'
        }
      }
    ]
  },
  plugins: [
    new webpack.ProvidePlugin({
      jQuery: 'jquery',
      $: 'jquery',
      jquery: 'jquery',
      echarts: 'echarts',
      moment: 'moment'
    })]
}
module.exports = config
