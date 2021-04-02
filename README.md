# **articleup**

**articleup**，基于 TypeScript 开发，
是一种面向组件、可自定义组件、可自定义部分语法、轻量级、简单易学的标记语言。



## **安装**

首先通过 npm 安装，
`articleup` 依赖于 `@yogurtcat/lib`、`dasta`

```sh
npm i -S @yogurtcat/lib
npm i -S dasta
npm i -S articleup
```

另外，如果需要 代码高亮，需要安装 Highlight.js 。

### **直接和目标代码打包**

啥也不加。

### **通过标签引入**

在 webpack.config.js 文件中添加

```JavaScript
externals: {
  '@yogurtcat/lib': 'global $yogurtcat$lib',
  'dasta': 'global dasta',
  'articleup': 'global articleup'
}
```

在 html 文件中添加

```HTML
<script src="https://cdn.jsdelivr.net/npm/@yogurtcat/lib@{版本号}/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dasta@{版本号}/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/articleup@{版本号}/dist/index.min.js"></script>
```

其中的 `{版本号}` 请查询最新版本号后替换。

### **在 Vue 项目中使用**

在 webpack.config.js 文件中添加

```JavaScript
externals: {
  '@yogurtcat/lib': 'global $yogurtcat$lib',
  'dasta': 'global dasta',
  'articleup': 'global articleup'
}
```

在 main.js 文件中添加

```JavaScript
import '@yogurtcat/lib/dist/index.min.js'
import 'dasta/dist/index.min.js'
import 'articleup/dist/index.min.js'
```

### **二次开发 npm 包**

如果目标包通过 webpack 打包，
则在 webpack.config.js 文件中添加

```JavaScript
externals: {
  '@yogurtcat/lib': 'commonjs2 @yogurtcat/lib',
  'dasta': 'commonjs2 dasta',
  'articleup': 'commonjs2 articleup'
}
```

或者
如果目标包通过标签引入，
则在 webpack.config.js 文件中添加

```JavaScript
externals: {
  '@yogurtcat/lib': 'global $yogurtcat$lib',
  'dasta': 'global dasta',
  'articleup': 'global articleup'
}
```



## **使用**

```TypeScript
const doc = `
$:{这里定义变量，变量可以是字符串，也可以是组件，多行的要用.{}包起来}
$#{
  ~hello  Hello world!
  ~url  https://i0.hdslb.com/bfs/archive/c9383573ee0f1beea105b1a83862357d88210388.jpg
  ~pretty  $.{
    许愿椰羊
    $I:(~url  50%)
  }
}

$:{文章用.{}包起来}
$.{ $H{标题}

  $:{文章内的.{}表示章节}
  $.{ $H{第一章}
    $:(~hello)
  }

  $.{ $H{第二章}
  }

  $:(~pretty)
  $:(~pretty)
}
`
const context = new Context()
const render = context.parse(doc)
const component = new Component({
  name: 'myArticle',
  render
}).component
```

其中的 component 变量就是将 doc 编译后得到的 Vue 组件对象。
