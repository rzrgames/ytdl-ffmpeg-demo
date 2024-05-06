const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/entry.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'static.js',
    clean: true,
  },


// Plugins
  plugins: [
    new HtmlWebpackPlugin({
        minify: false,
      hash: false,
      title : 'Live Reload - Webpack',
      template : './src/index.html'
    })
  ],

  // Set node modules to use for various file types
  module: {
    rules: [

      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|gif)$/i,
        type: 'asset'
     }
    ]
  },

  devServer: {
    static: {
      directory: path.join(__dirname, 'src'),
    },

    compress: true,
    port: 9000,
static: './',
   },
};

