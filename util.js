const _path = require('path')
const path = dir => s => _path.resolve(dir, s)


const license = ({
  author,
  date,
  name,
  version,
  repository
}) => {
  let r = `${name}.js${version? " v"+version: ""}\n`
    + `(c) ${date} ${author}\n`

  if(repository)
    for(let k in repository) {
      let v = repository[k]
      r += `${k}: ${v}\n`
    }

  r += 'Released under the MIT License.'
  return r
}


const configWebpack = ({
  path,
  config,
  webpack,
  TerserPlugin,
  entry,
  filename,
  libraryTarget,
  library,
  rules,
  min,
  externals
}) => {
  const r = {
    output: {
      path: path('dist')
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js']
    },
    module: {
      rules: [{
        test: /\.tsx?$/,
        use: 'ts-loader'
      }]
    }
  }

  if(entry) r.entry = path(entry)
  if(filename) r.output.filename = filename
  if(libraryTarget) r.output.libraryTarget = libraryTarget
  if(library) r.output.library = library

  if(rules)
    for(let i of rules)
      r.module.rules.push(i)

  if(webpack && config) r.plugins = [
    new webpack.BannerPlugin({
      entryOnly: true,
      banner: license(config)
    })]

  if(min !== undefined && min !== null) {
    if(!min) {
      r.mode = 'development'
      r.devtool = false
    } else {
      r.mode = 'production'
      r.optimization = {
        minimize: true
      }

      if(TerserPlugin) r.optimization.minimizer = [
        new TerserPlugin({
          extractComments: false
        })
      ]
    }
  }

  if(externals) r.externals = externals

  return r
}


module.exports = {
  path,
  license,
  configWebpack
}
