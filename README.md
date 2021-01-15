# articleup

A component-oriented, customizable component, customizable partial syntax, lightweight, and easy to learn markup language.

Articleup is a component-oriented markup language, developed based on TypeScript. It allows users to write documents in plain text format with special articleup syntax, and compiles them into Vue components. Articleup supports customizable component and customizable partial syntax.

## Installation

```sh
npm i -S articleup
```

## Usage

Add in webpack.config.js

```JavaScript
externals: {
  'articleup': 'articleup'
}
```

Import modules by adding tags in index.html

```HTML
<link rel="stylesheet" href="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.5.0/build/styles/default.min.css">
<script src="//cdn.jsdelivr.net/gh/highlightjs/cdn-release@10.5.0/build/highlight.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@yogurtcat/lib@1.0.10/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/dasta@1.0.30/dist/index.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/articleup@1.0.0/dist/index.min.js"></script>
```

Import in TypeScript (or JavaScript)

```TypeScript
import {Component} from 'dasta'
import {Context} from 'articleup'
```

## Examples

```TypeScript
const doc = `
$:{Here you can define a variable, which can be a string or an element. Multiple lines should be wrapped with .{}}
$#{
  ~hello  Hello world!
  ~url  https://i0.hdslb.com/bfs/archive/c9383573ee0f1beea105b1a83862357d88210388.jpg
  ~pretty  $.{
    Ganyu is so cool!
    $I:(~url  50%)
  }
}

$:{The article is wrapped with .{}}
$.{ $H{headline}

  $:{The .{} in the article represents the section}
  $.{ $H{Chapter one}
    $:(~hello)
  }

  $.{ $H{Chapter two}
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

The component variable is a Vue component object generated after compiling the doc.
