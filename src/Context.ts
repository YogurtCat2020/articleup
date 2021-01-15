import {base, container} from '@yogurtcat/lib'
import {
  Element, Parser, Sifter, Creator, Paragraph,
  last, appends,
  trimLeft, trimRight, trim,
  split, splitLines, tightSpaces,
  copyStatus
} from './util'
import newSyms from './newSyms'
import newParsers from './newParsers'
import newSifters from './newSifters'
import newCreators from './newCreators'
import newParagraph from './newParagraph'
import parse from './parse'
import preproc from './preproc';

const {is, to} = base
const {Dict} = container

export type Dict<K, V> = container.Dict<K, V>


export default class Context {
  public readonly syms: Dict<string, string>
  public readonly vars: Dict<string, (string|Element)[]>
  public readonly parsers: Dict<string, Parser>
  public readonly sifters: Dict<string, Sifter[]>
  public readonly creators: Dict<string, Creator>
  public readonly paragraph: Paragraph


  public constructor(args?: {
    syms?: any,
    parsers?: Dict<string, Parser>,
    sifters?: Dict<string, Sifter[]>,
    creators?: Dict<string, Creator>,
    paragraph?: Paragraph
  }) {
    let {syms, parsers, sifters, creators, paragraph} = args || {}

    if(is.un(syms)) syms = newSyms()
    if(is.un(parsers)) parsers = newParsers(syms)
    if(is.un(sifters)) sifters = newSifters(syms)
    if(is.un(creators)) creators = newCreators(syms)
    if(is.un(paragraph)) paragraph = newParagraph(syms)

    this.syms = new Dict<string, string>(syms)
    this.vars = new Dict<string, (string|Element)[]>()
    this.parsers = parsers
    this.sifters = sifters
    this.creators = creators
    this.paragraph = paragraph
  }

  public parse(text: string): (string|object)[] {
    const sym = this.syms.get('main')

    const parser = this.parsers.get(sym)
    if(is.un(parser)) return []

    text = preproc(this, text)
    const element = parse(text)
    return parser(this, element)
  }

  public parseVars(element: Element): Element {  // 替换属性变量
    const sym = this.syms.get('var')
    const vars = this.vars

    if(element.elems.length >= 2 && element.elems[1].elem === sym) {
      const r: string[] = []
      for(let i of element.elems[1].attrs) {
        let t = to.obj(vars.get(i))
        if(is.un(t)) r.push(i)
        else {
          let e: Element = {
            elems: [],
            children: t,
            level: -1,
            status: {}
          }
          e = this.parseChildrenDelElems(e)
          e = this.parseChildrenJoin(e)
          if(e.children.length <= 0) continue
          let s = <string> e.children[0]
          appends(r, split(trim(s)))
        }
      }
      element.elems[0].attrs = r
      element.elems.splice(1, 1)
    }
    return element
  }
  public parseElems(element: Element): Element {  // 展开元素简写
    if(element.elems.length <= 1) return element

    const child: Element = {
      elems: element.elems.splice(1),
      children: element.children,
      level: -1,
      status: {}
    }
    element.children = [child]
    return element
  }

  public parseChildrenVars(element: Element): Element {  // 替换变量
    const sym = this.syms.get('var')
    const vars = this.vars

    const r: (string|Element)[] = []
    for(let i of element.children) {
      if(is.str(i) || i.elems[0].elem !== sym) r.push(i)
      else for(let j of i.elems[0].attrs) {
        let t = to.obj(vars.get(j))
        if(is.un(t)) r.push(j)
        else appends(r, t)
      }
    }
    element.children = r
    return element
  }
  public parseChildrenContinue(element: Element): Element {  // 去掉下一个字符串前导的空格换行
    const sym = this.syms.get('continue')

    const r: (string|Element)[] = []
    let b = false
    for(let i of element.children) {
      if(is.obj(i) && i.elems[0].elem === sym) b = true
      else if(b) {
        if(is.str(i)) i = trimLeft(i)
        r.push(i)
        b = false
      } else r.push(i)
    }
    element.children = r
    return element
  }

  public parseChildrenJoin(element: Element, sep?: string): Element {  // 连续的字符串拼成一个字符串
    if(is.un(sep)) sep = ''

    const r: (string|Element)[] = []
    for(let i of element.children) {
      if(is.str(i) && is.str(last(r))) last(r, last(r)+sep+i)
      else r.push(i)
    }
    element.children = r
    return element
  }
  public parseChildrenSplit(element: Element): Element {  // 行分割，连续的空格替换成一个空格，去掉每行前后空格
    let r: (string|Element)[] = []
    for(let i of element.children) {
      if(is.str(i)) appends(r, splitLines(i).map(tightSpaces))
      else r.push(i)
    }
    element.children = r

    r = []
    for(let i of element.children) {
      if(is.str(i)) {
        if(r.length <= 0) r.push(trimLeft(i))
        else if(is.str(last(r))) {
          last(r, trimRight(<string> last(r)))
          r.push(trimLeft(i))
        } else r.push(i)
      } else r.push(i)
    }
    if(is.str(last(r))) last(r, trimRight(<string> last(r)))
    element.children = r

    return element
  }
  public parseChildrenDelEmpty(element: Element): Element {  // 去掉空行
    const r: (string|Element)[] = []
    for(let i of element.children) {
      if(is.str(i)) {
        if(i === '') {
          if(r.length <= 0 || last(r) === '' && is.str(r[r.length-2])) continue
          r.push(i)
        } else {
          if(last(r) === '' && is.str(r[r.length-2])) last(r, i)
          else r.push(i)
        }
      } else r.push(i)
    }
    while(last(r) === '') r.pop()
    element.children = r
    return element
  }

  public parseChildrenLines(element: Element): Element {  // 打包成行，去掉每行里前后空行
    const sym = this.syms.get('paragraph')
    const newLine = (children: (string|Element)[]) =>
      this.parseChildrenDelEmpty({
        elems: [{
          elem: sym,
          attrs: []
        }],
        children: children,
        level: -1,
        status: {}
      })

    let r: (string|Element)[] = []
    let t: (string|Element)[] = []
    let b = false
    for(let i of element.children) {
      if(is.str(i)) {
        if(b) {
          r.push(newLine(t))
          t = [i]
        } else {
          t.push(i)
          b = true
        }
      } else {
        t.push(i)
        b = false
      }
    }
    if(t.length > 0) r.push(newLine(t))
    element.children = r
    return element
  }
  public parseChildrenNewLines(element: Element): Element {
    const sym = this.syms.get('newline')
    const newLine = {
      elems: [{
        elem: sym,
        attrs: ['1']
      }],
      children: [],
      level: -1,
      status: {}
    }

    let r: (string|Element)[] = []
    let b = true
    for(let i of element.children) {
      if(b) b = false
      else r.push(newLine)
      r.push(i)
    }
    element.children = r
    return element
  }
  public parseChildrenJoinLines(element: Element): Element {  // 连续的字符串拼成一个字符串，用 \n 连接
    return this.parseChildrenJoin(element, '\n')
  }

  public parseChildrenDelStrs(element: Element): Element {  // 删除字符串
    const r: (string|Element)[] = []
    for(let i of element.children)
      if(is.obj(i)) r.push(i)
    element.children = r
    return element
  }
  public parseChildrenDelElems(element: Element): Element {  // 删除元素
    const r: (string|Element)[] = []
    for(let i of element.children)
      if(is.str(i)) r.push(i)
    element.children = r
    return element
  }

  public parseChildrenClosure(element: Element): Element {  // 展开闭包
    const sym = this.syms.get('closure')

    const r: (string|Element)[] = []
    for(let i of element.children)
      if(is.obj(i) && i.elems[0].elem === sym) {
        i = this.parseVars(i)
        i = this.parseElems(i)
        i = this.parseChildrenVars(i)
        i = this.parseChildrenContinue(i)
        i = this.parseChildrenJoin(i)
        i = this.parseChildrenSplit(i)
        i = this.parseChildrenDelEmpty(i)
        i = this.parseChildrenJoinLines(i)
        appends(r, i.children)
      } else r.push(i)
    element.children = r
    return element
  }

  public parseChildrenCopyStatus(element: Element): Element {
    for(let i of element.children)
      if(is.obj(i)) copyStatus(i, element)
    return element
  }
  public parseChildrenParsers(element: Element): (string|object)[] {
    const r: (string|object)[] = []
    for(let i of element.children)
      if(is.str(i)) r.push(i)
      else appends(r, this.parseParsers(i))
    return r
  }

  public parseParsers(element: Element): (string|object)[] {
    if(element.elems.length < 1) return []

    const parser = this.parsers.get(element.elems[0].elem)
    if(is.un(parser)) return []

    return parser(this, element)
  }
  public parseSifters(element: Element): (string|object)[] {
    if(element.elems.length < 1) return []

    const sifter = this.sifters.get(element.elems[0].elem)
    if(is.un(sifter)) return []

    for(let i of sifter) {
      let r = i.parser(this, element)
      if(!is.un(r)) return r
    }
    return []
  }

  public createElement(sym: string, status: any,
                       attrs: any[], children: any[]): (string|object)[] {
    const creator = this.creators.get(sym)
    if(is.un(creator)) return []

    return creator(status, attrs, children)
  }

  public parseCreate(element: Element): (string|object)[] {
    if(element.elems.length < 1) return []

    element = this.parseVars(element)
    element = this.parseElems(element)
    element = this.parseChildrenVars(element)
    element = this.parseChildrenContinue(element)
    element = this.parseChildrenJoin(element)
    element = this.parseChildrenSplit(element)
    element = this.parseChildrenDelEmpty(element)
    element = this.parseChildrenLines(element)
    element = this.parseChildrenNewLines(element)
    element = this.parseChildrenCopyStatus(element)
    const children = this.parseChildrenParsers(element)

    const sym = element.elems[0].elem
    const attrs = element.elems[0].attrs
    const status = element.status
    return this.createElement(sym, status, attrs, children)
  }
}
