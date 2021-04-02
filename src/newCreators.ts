import {is, to, decor} from '@yogurtcat/lib'
import {creator, newCode, addClass, addAttrs} from './util'
import newSyms from './newSyms'


const comment: creator = (status, attrs, children) => {
  if(status.chapter) return []
  return [decor.$(newCode(`'div'`, children),
    addClass('comment')
  )]
}

const article: creator = (status, attrs, children) => {
  if(!status.chapter) return []
  return [newCode(`'article'`, children)]
}
const section: creator = (status, attrs, children) => {
  if(!status.chapter) return []
  return [newCode(`'section'`, children)]
}
const figure: creator = (status, attrs, children) => {
  if(!status.chapter) return []
  return [newCode(`'figure'`, children)]
}
const paragraph: creator = (status, attrs, children) => [newCode(`'p'`, children)]
const headline: creator = (status, attrs, children) => {
  if(!status.chapter) return []
  return [newCode(`'h${status.chapter}'`, children)]
}
const caption: creator = (status, attrs, children) => {
  if(!status.chapter) return []
  return [newCode(`'caption'`, children)]
}

const align: creator = (status, attrs, children) => {
  let name: string
  if(status.paragraph === 1 && status.line_block === true) name = `'p'`
  else name = `'span'`

  let [cls] = attrs
  if(is.un(cls)) cls = '0'

  return [decor.$(newCode(name, children),
    addClass('a'),
    addClass('a'+cls)
  )]
}
const color: creator = (status, attrs, children) => {
  let [cls] = attrs
  if(is.un(cls)) cls = '0'

  return [decor.$(newCode(`'span'`, children),
    addClass('c'),
    addClass('c'+cls)
  )]
}
const highlight: creator = (status, attrs, children) => {
  let [cls] = attrs
  if(is.un(cls)) cls = '0'

  return [decor.$(newCode(`'mark'`, children),
    addClass('h'+cls)
  )]
}
const bold: creator = (status, attrs, children) => [newCode(`'strong'`, children)]
const italic: creator = (status, attrs, children) => [newCode(`'em'`, children)]
const underline: creator = (status, attrs, children) => [newCode(`'ins'`, children)]
const strike: creator = (status, attrs, children) => [newCode(`'del'`, children)]
const superscript: creator = (status, attrs, children) => [newCode(`'sup'`, children)]
const subscript: creator = (status, attrs, children) => [newCode(`'sub'`, children)]
const hyperlink: creator = (status, attrs, children) => {
  let [url, target] = attrs
  if(is.un(url)) return []
  if(is.un(target)) target = '_blank'

  url = to.str(url)
  target = to.str(target)

  if(children.length <= 0) children = [url]

  return [decor.$(newCode(`'a'`, children),
    addAttrs('href', url),
    addAttrs('target', target)
  )]
}
const space: creator = (status, attrs, children) => {
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
const newline: creator = (status, attrs, children) => {
  let [num] = attrs
  num = Number(num)
  if(is.nan(num) || num < 0) num = 0
  return new Array(num).fill(newCode(`'br'`))
}
const separate: creator = (status, attrs, children) => {
  let [num] = attrs
  num = Number(num)
  if(is.nan(num) || num < 0) num = 0
  return new Array(num).fill(newCode(`'hr'`))
}

const image: creator = (status, attrs, children) => {
  let [img, width, height] = attrs
  let [txt] = children
  if(is.un(img)) return []
  if(is.un(txt)) txt = ''
  if(is.un(width)) width = '0'
  if(is.un(height)) height = '0'

  img = to.str(img)
  txt = to.str(txt)
  width = width === '0'? null: addAttrs('width', to.str(width))
  height = height === '0'? null: addAttrs('height', to.str(height))

  return [decor.$(newCode(`'img'`),
    addAttrs('src', img),
    addAttrs('alt', txt),
    width, height
  )]
}
const formula: creator = (status, attrs, children) => {
  let [width, height, mode] = attrs
  let [txt] = children
  if(is.un(txt)) return []
  if(is.un(mode)) mode = 'svg'
  if(is.un(width)) width = '0'
  if(is.un(height)) height = '0'

  const img = to.str('https://latex.codecogs.com/'+mode+'.latex?'+encodeURIComponent(txt))
  width = width === '0'? null: addAttrs('width', to.str(width))
  height = height === '0'? null: addAttrs('height', to.str(height))

  return [decor.$(newCode(`'img'`),
    addClass('f'),
    addAttrs('src', img),
    width, height
  )]
}
const quote: creator = (status, attrs, children) => [newCode(`'blockquote'`, children)]
const code: creator = (status, attrs, children) => {
  if(status.paragraph === 1 && status.line_block === true) {
    let [lang] = attrs
    let [txt] = children

    lang = is.un(attrs)? null: addClass(lang)
    txt = to.str(txt)

    return [newCode(`'pre'`, [
      decor.$(newCode(`'code'`, [txt]),
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

  return [newCode(mode, [txt])]
}
const keyboard: creator = (status, attrs, children) => [newCode(`'kbd'`, children)]
const list: creator = (status, attrs, children) => []
const table: creator = (status, attrs, children) => []
const audio: creator = (status, attrs, children) => []
const video: creator = (status, attrs, children) => []


export default (syms?: any) => {
  if(is.un(syms)) syms = newSyms()

  return {
    [syms.comment]: comment,

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
  }
}
