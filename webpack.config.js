var webpack = require('webpack');
var path = require('path');

module.exports = {
    entry: {
      app: path.resolve(__dirname, 'src/apexcharts.js') ,
    },
    output: {
        library: 'ApexCharts',
        libraryTarget: 'umd',
        umdNamedDefine: true,
      	path: path.resolve(__dirname, 'dist/'),
        filename: 'apexcharts.min.js' ,
    },
    module: {
      rules: [
        {
          test: /\.(js)$/,
          enforce: 'pre',
          exclude: [/node_modules/, path.resolve(__dirname, 'src/utils/ClassListPolyfill.js'), path.resolve(__dirname, 'src/utils/Utils.js')],
          include: path.resolve(__dirname, 'src/'),
          use: [
            {
              options: {
                fix: true,
                eslintPath: require.resolve('eslint'),
                parser: require.resolve('babel-eslint'),
              },
              loader: require.resolve('eslint-loader'),
            },
          ],
        },
        {
          test: /\.js?$/,
          loader:'babel-loader',
          options: {
            presets: ['es2015', 'stage-0'],
            plugins: ['transform-class-properties', 'transform-decorators-legacy']
          }
        },
        
        {
          test: /\.css$/,
          use: [ 'style-loader', 'css-loader' ]
        },
        {
          test: /\.svg$/,
          loader: 'svg-inline-loader'
        }
      ],
      
    },
    watchOptions: {
      poll: true
    },
    resolve: {
        modules: [
          __dirname,
          "src",
          "node_modules"
        ],

        extensions: ['.js', '.json']
    },
};
