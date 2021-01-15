
const _path = require('path')
const _dir = __dirname
const path = str => _path.resolve(_dir, str)

const config = require(path('config.js'))

webpack = require('webpack')
TerserPlugin = require('terser-webpack-plugin')

const webpackConfig = require(path('webpackConfig.js'))


module.exports = [
  webpackConfig({
    path,
    config,
    webpack,
    TerserPlugin,
    entry: 'src/index.ts',
    filename: 'index.js',
    min: false,
    externals: config.externals
  }),
  webpackConfig({
    path,
    config,
    webpack,
    TerserPlugin,
    entry: 'src/index.min.ts',
    filename: 'index.min.js',
    min: true,
    externals: config.externalsMin
  })
]
