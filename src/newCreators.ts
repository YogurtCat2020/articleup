import {base, container} from '@yogurtcat/lib'
import {Creator, newElement, mount, addClass, addAttrs} from './util'
import newSyms from './newSyms'

const {is, to} = base
const {Dict} = container

export type Dict<K, V> = container.Dict<K, V>


const article: Creator = (status, attrs, children) => [newElement(`'article'`, children)]
const section: Creator = (status, attrs, children) => [newElement(`'section'`, children)]
const figure: Creator = (status, attrs, children) => [newElement(`'figure'`, children)]
const paragraph: Creator = (status, attrs, children) => [newElement(`'p'`, children)]
const headline: Creator = (status, attrs, children) => [newElement(`'h${status.chapter}'`, children)]
const caption: Creator = (status, attrs, children) => [newElement(`'caption'`, children)]

const align: Creator = (status, attrs, children) => {
  let name: string
  if(status.paragraph === 1 && status.line_block === true) name = `'p'`
  else name = `'span'`

  let [cls] = attrs
  if(is.un(cls)) cls = '0'

  return [mount(newElement(name, children),
    addClass('a'),
    addClass('a'+cls)
  )]
}
const color: Creator = (status, attrs, children) => {
  let [cls] = attrs
  if(is.un(cls)) cls = '0'

  return [mount(newElement(`'span'`, children),
    addClass('c'),
    addClass('c'+cls)
  )]
}
const highlight: Creator = (status, attrs, children) => {
  let [cls] = attrs
  if(is.un(cls)) cls = '0'

  return [mount(newElement(`'mark'`, children),
    addClass('h'+cls)
  )]
}
const bold: Creator = (status, attrs, children) => [newElement(`'strong'`, children)]
const italic: Creator = (status, attrs, children) => [newElement(`'em'`, children)]
const underline: Creator = (status, attrs, children) => [newElement(`'ins'`, children)]
const strike: Creator = (status, attrs, children) => [newElement(`'del'`, children)]
const superscript: Creator = (status, attrs, children) => [newElement(`'sup'`, children)]
const subscript: Creator = (status, attrs, children) => [newElement(`'sub'`, children)]
const hyperlink: Creator = (status, attrs, children) => {
  let [url, target] = attrs
  if(is.un(url)) return []
  if(is.un(target)) target = '_blank'

  url = to.str(url)
  target = to.str(target)

  if(children.length <= 0) children = [url]

  return [mount(newElement(`'a'`, children),
    addAttrs('href', url),
    addAttrs('target', target)
  )]
}
const space: Creator = (status, attrs, children) => {
  const c = '\u00A0'

  let [num] = attrs
  num = Number(num)
  if(is.nan(num) || num < 0) num = 0

  const n = 10
  const m = Math.floor(num/n)
  const q = num%n

  const r = new Array(m).fill(to.str(c.repeat(n)))
  if(q > 0) r.push(to.str(c.repeat(q)))
  return r
}
const newline: Creator = (status, attrs, children) => {
  let [num] = attrs
  num = Number(num)
  if(is.nan(num) || num < 0) num = 0
  return new Array(num).fill(newElement(`'br'`))
}
const separate: Creator = (status, attrs, children) => {
  let [num] = attrs
  num = Number(num)
  if(is.nan(num) || num < 0) num = 0
  return new Array(num).fill(newElement(`'hr'`))
}

const image: Creator = (status, attrs, children) => {
  let [img, width, height] = attrs
  let [txt] = children
  if(is.un(img)) return []
  if(is.un(width)) width = '0'
  if(is.un(height)) height = '0'

  img = to.str(img)
  txt = is.un(txt)? null: addAttrs('alt', to.str(txt))
  width = width === '0'? null: addAttrs('width', to.str(width))
  height = height === '0'? null: addAttrs('height', to.str(height))

  return [mount(newElement(`'img'`),
    addAttrs('src', img),
    txt,
    width, height
  )]
}
const formula: Creator = (status, attrs, children) => {
  let [width, height, mode] = attrs
  let [txt] = children
  if(is.un(txt)) return []
  if(is.un(mode)) mode = 'svg'
  if(is.un(width)) width = '0'
  if(is.un(height)) height = '0'

  const img = to.str('https://latex.codecogs.com/'+mode+'.latex?'+encodeURIComponent(txt))
  width = width === '0'? null: addAttrs('width', to.str(width))
  height = height === '0'? null: addAttrs('height', to.str(height))

  return [mount(newElement(`'img'`),
    addClass('f'),
    addAttrs('src', img),
    width, height
  )]
}
const quote: Creator = (status, attrs, children) => [newElement(`'blockquote'`, children)]
const code: Creator = (status, attrs, children) => {
  if(status.paragraph === 1 && status.line_block === true) {
    let [lang] = attrs
    let [txt] = children

    lang = is.un(attrs)? null: addClass(lang)
    txt = to.str(txt)

    return [newElement(`'pre'`, [
      mount(newElement(`'code'`, [txt]),
        lang
      )
    ])]
  }

  let [mode] = attrs
  let [txt] = children

  if(is.un(mode)) mode = 'c'
  mode = {
    c: 'code',
    s: 'samp',
    v: 'var'
  }[mode] || 'code'

  mode = to.str(mode)
  txt = to.str(txt)

  return [newElement(mode, [txt])]
}
const keyboard: Creator = (status, attrs, children) => [newElement(`'kbd'`, children)]
const list: Creator = (status, attrs, children) => []
const table: Creator = (status, attrs, children) => []
const audio: Creator = (status, attrs, children) => []
const video: Creator = (status, attrs, children) => []


export default function(syms?: any): Dict<string, Creator> {
  if(is.un(syms)) syms = newSyms()

  syms = to.obj(syms)

  return new Dict<string, Creator>({
    [syms.article]: article,
    [syms.section]: section,
    [syms.figure]: figure,
    [syms.paragraph]: paragraph,
    [syms.headline]: headline,
    [syms.caption]: caption,

    [syms.align]: align,
    [syms.color]: color,
    [syms.highlight]: highlight,
    [syms.bold]: bold,
    [syms.italic]: italic,
    [syms.underline]: underline,
    [syms.strike]: strike,
    [syms.superscript]: superscript,
    [syms.subscript]: subscript,
    [syms.hyperlink]: hyperlink,
    [syms.space]: space,
    [syms.newline]: newline,
    [syms.separate]: separate,

    [syms.image]: image,
    [syms.formula]: formula,
    [syms.quote]: quote,
    [syms.code]: code,
    [syms.keyboard]: keyboard,
    [syms.list]: list,
    [syms.table]: table,
    [syms.audio]: audio,
    [syms.video]: video
  })
}
