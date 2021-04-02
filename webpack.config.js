const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const {path, configWebpack} = require('./util')
const config = {
  author: 'YogurtCat',
  date: '2020-',
  name: 'articleup',
  repository: {
    git: 'https://github.com/YogurtCat2020/articleup'
  }
}


module.exports = [
  configWebpack({
    path: path(__dirname),
    config,
    webpack,
    TerserPlugin,
    entry: 'src/index.ts',
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    min: false,
    externals: {
      '@yogurtcat/lib': 'commonjs2 @yogurtcat/lib',
      'dasta': 'commonjs2 dasta'
    }
  }),
  configWebpack({
    path: path(__dirname),
    config,
    webpack,
    TerserPlugin,
    entry: 'src/index.ts',
    filename: 'index.min.js',
    libraryTarget: 'global',
    library: 'articleup',
    min: true,
    externals: {
      '@yogurtcat/lib': 'global $yogurtcat$lib',
      'dasta': 'global dasta'
    }
  })
]
