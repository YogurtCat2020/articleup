import {is, to, arr} from '@yogurtcat/lib'
import {element, parser} from './util'
import newSyms from './newSyms'


function isClosureFirstLine(element: element, sym: string): boolean {
  return element.children.length >= 1 && isParagraphOneElem(<element> element.children[0], sym)
}
function isClosureLastLine(element: element, sym: string): boolean {
  return element.children.length >= 1 && isParagraphOneElem(<element> arr.last(element.children), sym)
}
function isParagraphOneElem(element: element, sym?: string): boolean {
  if(element.children.length === 1) {
    const elem = element.children[0]
    if(!is.obj(elem)) return false
    return is.un(sym) || elem.elems.length >= 1 && elem.elems[0].elem === sym
  }
  return false
}
function isParagraphOneStr(element: element): boolean {
  if(element.children.length === 1) {
    const elem = element.children[0]
    return is.str(elem)
  }
  return false
}

const article: parser = async(context, element) => {
  if(!is.un(element.status.chapter)) return null

  let sym = context.syms.get('headline')
  if(!isClosureFirstLine(element, sym)) return null

  element.status.chapter = 1
  element.status.figure = null
  element.status.paragraph = null
  element = context.parseChildrenCopyStatus(element)
  const children = await context.parseChildrenParsers(element)

  sym = context.syms.get('article')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}
const section: parser = async(context, element) => {
  if(is.un(element.status.chapter)) return null

  let sym = context.syms.get('headline')
  if(!isClosureFirstLine(element, sym)) return null

  element.status.chapter += 1
  element.status.paragraph = null
  element = context.parseChildrenCopyStatus(element)
  const children = await context.parseChildrenParsers(element)

  sym = context.syms.get('section')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}
const figure: parser = async(context, element) => {
  if(!is.un(element.status.figure)) return null

  let sym = context.syms.get('caption')
  if(!isClosureFirstLine(element, sym) || !isClosureLastLine(element, sym)) return null

  element.status.figure = true
  element.status.paragraph = null
  element = context.parseChildrenCopyStatus(element)
  const children = await context.parseChildrenParsers(element)

  sym = context.syms.get('figure')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}

const oneStr: parser = async(context, element) => {
  if(!isParagraphOneStr(element)) return null

  const children = [to.str(element.children[0])]
  if(!is.un(element.status.paragraph)) return children

  element.status.paragraph = 1
  const sym = context.syms.get('paragraph')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}
const oneElemLine: parser = async(context, element) => {
  if(!isParagraphOneElem(element)) return null

  const elem = (<element> element.children[0]).elems[0].elem
  const set = context.paramode.line
  if(!set.has(elem)) return null

  let p = true
  if(is.un(element.status.paragraph)) {
    element.status.paragraph = 1
    p = false
  }

  element.status.line_block = false
  element = context.parseChildrenCopyStatus(element)
  const children = await context.parseChildrenParsers(element)
  if(p) return children

  const sym = context.syms.get('paragraph')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}
const oneElemBlock: parser = async(context, element) => {
  if(!isParagraphOneElem(element)) return null

  const elem = (<element> element.children[0]).elems[0].elem
  const set = context.paramode.block
  if(!set.has(elem)) return null

  if(!is.un(element.status.paragraph)) return null

  element.status.line_block = true
  element.status.paragraph = 1
  element = context.parseChildrenCopyStatus(element)
  return await context.parseChildrenParsers(element)
}
const many: parser = async(context, element) => {
  if(element.children.length <= 1) return null

  let p = true
  if(is.un(element.status.paragraph)) {
    element.status.paragraph = element.children.length
    p = false
  }

  element = context.parseChildrenCopyStatus(element)

  const set = context.paramode.line
  const children: (string|object)[] = []
  for(let i of element.children) {
    if(is.str(i)) children.push(to.str(i))
    else if(set.has(i.elems[0].elem))
      arr.appends(children, await context.parseParsers(i))
  }

  if(p) return children

  const sym = context.syms.get('paragraph')
  const status = element.status
  const attrs = element.elems[0].attrs
  return context.createElement(sym, status, attrs, children)
}

export default (syms?: any) => {
  if(is.un(syms)) syms = newSyms()

  return {
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
  }
}
