# articleup

一种面向组件、可自定义组件、可自定义部分语法、轻量级、简单易学的标记语言。

articleup 是面向组件的标记语言，基于 TypeScript 开发，允许用户采用 articleup 语法的纯文本格式编写文档，并能将其编译成 Vue 组件。 articleup 支持自定义组件、自定义部分语法。

## 安装

```sh
npm i -S articleup
```

## 使用

在 webpack.config.js 中添加

```JavaScript
externals: {
  'articleup': 'articleup'
}
```

在 index.html 中用标签引入模块

```HTML
<link rel="stylesheet" href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.5.0/build/styles/default.min.css">
<script src="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.5.0/build/highlight.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@yogurtcat/lib@1.0.10/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dasta@1.0.30/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/articleup@1.0.0/dist/index.min.js"></script>
```

在 TypeScript（或 JavaScript）中导入

```TypeScript
import {Component} from 'dasta'
import {Context} from 'articleup'
```

## 示例

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
