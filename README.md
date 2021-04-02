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

`articleup` 主要使用了 `dasta` 中的 Code 语法 H 扩展，
请先学习 `Code`、`dasta` 等模块的使用方法：

- npm:\
  <https://www.npmjs.com/package/@yogurtcat/lib>\
  <https://www.npmjs.com/package/dasta>
- github:\
  <https://github.com/YogurtCat2020/lib>\
  <https://github.com/YogurtCat2020/dasta>

### **编译 articleup**

`articleup` 定义了 articleup 语法 的 标记语言，
可以将 符合 articleup 语法 的 字符串 解析成 Code ，
通过 `Context` 类 来实现。

```TypeScript
import {Component} from 'dasta'
import {Context} from 'articleup'

const context = new Context()
const codes = await context.parse(`
  $#{
    hi  hello
  }

  $.{
    $H{title}
    say: $:(hi)
  }
`)
Component.codeRender(codes[0])
=== `(function(h){return h('article', [h('h1', ['title']),
h('p', ['say: hello'])])})`
```

### **articleup 基本语法**

`articleup` 语法 的 标记语言 中有两种类型对象，
一种是元素，形如 `$e(){}`，另外一种是字符串。

元素 由 4个要素 组成：

- `$` 标记
- 元素名（如 e）\
  只能是单个字符
- 参数列表：`()` 部分\
  内部可以有 0 ~ 多个 字符串\
  参数列表 可以省略
- 子元素列表：`{}` 部分\
  内部可以有 0 ~ 多个 元素 或 字符串\
  子元素列表 可以省略

如果一个 元素 的 子元素 只有一个，可以简写：

```
$a{
  $c(red){
    $h(blue){
      hello
    }
  }
}
```

等价于

```
$ac(red)h(blue){
  hello
}
```

`articleup` 的基本格式如下：

```
$:{ $:{} 可以用来写注释 }
$:{ $#{} 用来定义 变量 }
$#{
  $:{ 最左边是 变量名，变量名 是没用空格的字符串 }
  $:{ 除去 变量名 后，剩下同一行的都是 值 }
  title  Hello world!
  url  https://i0.hdslb.com/bfs/vc/c1e19150b5d1e413958d45e0e62f012e3ee200af.png

  $:{ 值 可以是 字符串，也可以是 元素 }
  $:{ $e:() 在元素名后加 : ，
    会对参数列表中的变量进行变量替换，
    如果变量不存在，会被当成普通字符串解析 }
  image  $I:(url)
  
  $:{ 值 超过一行的，用 $.{} 包裹 }
  $:{ $:() 元素名就是 : ，会替换成 变量 对应的 值 }
  para  $.{
    hello $:(image)
    it's cool
  }
}

$:{ $.{} 用来定义 article 标签 }
$.{
  $:{ $.{} 内第一行必须是 $H{} ，
    $H{} 会按层级解析成 h1 ~ 6 标签}
  $:{ $H::(title) 等价于 $H:(){$:(title)} }
  $H::(title)

  $:{ $.{} 内的 $.{} 会解析成 section 标签 }
  $.{
    $H{haha}
  }

  $:(para)
  happy
  $:(para)
}
```

编译后会变成：

```TypeScript
`(function(h){return h('article', [h('h1', ['Hello world!']),
h('section', [h('h2', ['haha'])]),
h('p', ['hello ',
h('img', {attrs: {src: 'https://i0.hdslb.com/bfs/vc/c1e19150b5d1e413958d45e0e62f012e3ee200af.png',
alt: ''}})]),
h('p', ["it's cool"]),
h('p', ['happy']),
h('p', ['hello ',
h('img', {attrs: {src: 'https://i0.hdslb.com/bfs/vc/c1e19150b5d1e413958d45e0e62f012e3ee200af.png',
alt: ''}})]),
h('p', ["it's cool"])])})`
```

### **articleup 默认元素**

元素 编译后会转化成特定的 组件 或 html 标签。
元素种类 可以扩展，这也是 `articleup` 的一大特色。
`articleup` 默认提供了一些 元素种类。

```
对齐
$a(center){}

字体颜色
$c(red){}

高亮
$h(blue){}

加粗
$b{}

斜体
$i{}

下划线
$u{}

删除线
$s{}

上标
$^{}

下标
$_{}

超链接
$@(url){}

num 个 空格
$+(num)

num 个 换行
$*(num)

num 个 水平分割线
$-(num)

图片
$I(url width height)

LaTeX 公式
$F{ a^2 + b^2 = c^2 }

引用块
$Q{}

代码块
$C{
  function() {
    console.log('hello')
  }
}

按键
$K{Ctrl+F}
```
