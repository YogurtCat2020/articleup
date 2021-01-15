import {base, container} from '@yogurtcat/lib'
import {Element, Parser, Sifter, appends} from './util'
import newSyms from './newSyms'

const {is, to} = base
const {Dict} = container

export type Dict<K, V> = container.Dict<K, V>


function isClosureFirstLine(element: Element, sym: string): boolean {
  return element.children.length >= 1 && isParagraphOneElem(<Element> element.children[0], sym)
}
function isParagraphOneElem(element: Element, sym?: string): boolean {
  if(element.children.length === 1) {
    const elem = element.children[0]
    if(!is.obj(elem)) return false
    return is.un(sym) || elem.elems.length >= 1 && elem.elems[0].elem === sym
  }
  return false
}
function isParagraphOneStr(element: Element): boolean {
  if(element.children.length === 1) {
    const elem = element.children[0]
    return is.str(elem)
  }
  return false
}


const article: Parser = (context, element) => {
  if(!is.un(element.status.chapter)) return null

  let sym = context.syms.get('headline')
  if(!isClosureFirstLine(element, sym)) return null

  element.status.chapter = 1
  element.status.figure = null
  element.status.paragraph = null
  element = context.parseChildrenCopyStatus(element)
  const children = context.parseChildrenParsers(element)

  sym = context.syms.get('article')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}
const section: Parser = (context, element) => {
  if(is.un(element.status.chapter)) return null

  let sym = context.syms.get('headline')
  if(!isClosureFirstLine(element, sym)) return null

  element.status.chapter += 1
  element.status.paragraph = null
  element = context.parseChildrenCopyStatus(element)
  const children = context.parseChildrenParsers(element)

  sym = context.syms.get('section')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}
const figure: Parser = (context, element) => {
  if(!is.un(element.status.figure)) return null

  let sym = context.syms.get('caption')
  if(!isClosureFirstLine(element, sym)) return null

  element.status.figure = true
  element.status.paragraph = null
  element = context.parseChildrenCopyStatus(element)
  const children = context.parseChildrenParsers(element)

  sym = context.syms.get('figure')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}

const oneStr: Parser = (context, element) => {
  if(!isParagraphOneStr(element)) return null

  const children = [to.str(element.children[0])]
  if(!is.un(element.status.paragraph)) return children

  element.status.paragraph = 1
  const sym = context.syms.get('paragraph')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}
const oneElemLine: Parser = (context, element) => {
  if(!isParagraphOneElem(element)) return null

  const elem = (<Element> element.children[0]).elems[0].elem
  const set = context.paragraph.line
  if(!set.has(elem)) return null

  let p = true
  if(is.un(element.status.paragraph)) {
    element.status.paragraph = 1
    p = false
  }

  element.status.line_block = false
  element = context.parseChildrenCopyStatus(element)
  const children = context.parseChildrenParsers(element)
  if(p) return children

  const sym = context.syms.get('paragraph')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}
const oneElemBlock: Parser = (context, element) => {
  if(!isParagraphOneElem(element)) return null

  const elem = (<Element> element.children[0]).elems[0].elem
  const set = context.paragraph.block
  if(!set.has(elem)) return null

  if(!is.un(element.status.paragraph)) return null

  element.status.line_block = true
  element.status.paragraph = 1
  element = context.parseChildrenCopyStatus(element)
  return context.parseChildrenParsers(element)
}
const many: Parser = (context, element) => {
  if(element.children.length <= 1) return null

  let p = true
  if(is.un(element.status.paragraph)) {
    element.status.paragraph = element.children.length
    p = false
  }

  element = context.parseChildrenCopyStatus(element)

  const set = context.paragraph.line
  const children: (string|object)[] = []
  for(let i of element.children) {
    if(is.str(i)) children.push(to.str(i))
    else if(set.has(i.elems[0].elem))
      appends(children, context.parseParsers(i))
  }

  if(p) return children

  const sym = context.syms.get('paragraph')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}


export default function(syms?: any): Dict<string, Sifter[]> {
  if(is.un(syms)) syms = newSyms()

  syms = to.obj(syms)
  
  return new Dict<string, Sifter[]>({
    [syms.closure]: [
      {parser: figure, desc: 'figure'},
      {parser: section, desc: 'section'},
      {parser: article, desc: 'article'}
    ],
    [syms.paragraph]: [
      {parser: many, desc: 'many'},
      {parser: oneElemBlock, desc: 'one elem block'},
      {parser: oneElemLine, desc: 'one elem line'},
      {parser: oneStr, desc: 'one str'}
    ]
  })
}
