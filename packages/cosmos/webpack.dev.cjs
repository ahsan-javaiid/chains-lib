const path = require('path');
const { merge } = require('webpack-merge');
const common = require('../../utility-packages/webpack/webpack.common.js');

module.exports = merge(common, {
  mode: 'development',
  watch: true,
  devtool: 'source-map',
  entry: {
    index: './src/index.ts',
    web: './src/signers/web.ts',
    'react-native': './src/signers/react-native.ts',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    library: {
      name: 'xdefichainscosmos',
      type: 'umd',
    },
  },
  stats: 'minimal',
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      crypto: require.resolve('crypto-browserify'),
    },
  },
})
