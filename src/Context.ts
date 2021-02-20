import {is, to, str, arr, Dict} from '@yogurtcat/lib'
import {element, elements, codes,
  parser, sifter, creator, paramode, copyStatus} from './util'
import newSyms from './newSyms'
import newParsers from './newParsers'
import newSifters from './newSifters'
import newCreators from './newCreators'
import newParamode from './newParamode'
import preproc from './preproc'
import parse from './parse'


export default class Context {
  public readonly syms: Dict<string, string>
  public readonly vars: Dict<string, (string|element)[]>
  public readonly parsers: Dict<string, parser>
  public readonly sifters: Dict<string, sifter[]>
  public readonly creators: Dict<string, creator>
  public readonly paramode: paramode


  public constructor() {
    const syms = newSyms()
    const parsers = newParsers(syms)
    const sifters = newSifters(syms)
    const creators = newCreators(syms)
    const paramode = newParamode(syms)

    this.syms = new Dict<string, string>(syms)
    this.vars = new Dict<string, elements[]>()
    this.parsers = new Dict<string, parser>(parsers)
    this.sifters = new Dict<string, sifter[]>(sifters)
    this.creators = new Dict<string, creator>(creators)
    this.paramode = paramode
  }

  public parse(text: string): codes[] {
    const sym = this.syms.get('main')

    const parser = this.parsers.get(sym)
    if(is.un(parser)) return []

    text = preproc(this.vars, text)
    const element = parse(text)
    return parser(this, element)
  }

  public parseVars(element: element): element {  // 替换属性变量
    const sym = this.syms.get('var')
    const vars = this.vars

    if(element.elems.length >= 2 && element.elems[1].elem === sym) {
      const r: string[] = []
      for(let i of element.elems[1].attrs) {
        let t = to.obj(vars.get(i))
        if(is.un(t)) r.push(i)
        else {
          let e: element = {
            elems: [],
            children: t,
            level: -1,
            status: {}
          }
          e = this.parseChildrenDelElems(e)
          e = this.parseChildrenJoin(e)
          if(e.children.length <= 0) continue
          let s = <string> e.children[0]
          arr.appends(r, str.split(str.trim(s)))
        }
      }
      element.elems[0].attrs = r
      element.elems.splice(1, 1)
    }
    return element
  }
  public parseElems(element: element): element {  // 展开元素简写
    if(element.elems.length <= 1) return element

    const child: element = {
      elems: element.elems.splice(1),
      children: element.children,
      level: -1,
      status: {}
    }
    element.children = [child]
    return element
  }

  public parseChildrenVars(element: element): element {  // 替换变量
    const sym = this.syms.get('var')
    const vars = this.vars

    const r: elements[] = []
    for(let i of element.children) {
      if(is.str(i) || i.elems[0].elem !== sym) r.push(i)
      else for(let j of i.elems[0].attrs) {
        let t = to.obj(vars.get(j))
        if(is.un(t)) r.push(j)
        else arr.appends(r, t)
      }
    }
    element.children = r
    return element
  }
  public parseChildrenContinue(element: element): element {  // 去掉下一个字符串前导的空格换行
    const sym = this.syms.get('continue')

    const r: elements[] = []
    let b = false
    for(let i of element.children) {
      if(is.obj(i) && i.elems[0].elem === sym) b = true
      else if(b) {
        if(is.str(i)) i = str.trimLeft(i)
        r.push(i)
        b = false
      } else r.push(i)
    }
    element.children = r
    return element
  }

  public parseChildrenJoin(element: element, sep?: string): element {  // 连续的字符串拼成一个字符串
    if(is.un(sep)) sep = ''

    const r: elements[] = []
    for(let i of element.children) {
      if(is.str(i) && is.str(arr.last(r))) arr.last(r, arr.last(r)+sep+i)
      else r.push(i)
    }
    element.children = r
    return element
  }
  public parseChildrenSplit(element: element): element {  // 行分割，连续的空格替换成一个空格，去掉每行前后空格
    let r: elements[] = []
    for(let i of element.children) {
      if(is.str(i)) arr.appends(r, str.splitLines(i).map(str.tightSpaces))
      else r.push(i)
    }
    element.children = r

    r = []
    for(let i of element.children) {
      if(is.str(i)) {
        if(r.length <= 0) r.push(str.trimLeft(i))
        else if(is.str(arr.last(r))) {
          arr.last(r, str.trimRight(<string> arr.last(r)))
          r.push(str.trimLeft(i))
        } else r.push(i)
      } else r.push(i)
    }
    if(is.str(arr.last(r))) arr.last(r, str.trimRight(<string> arr.last(r)))
    element.children = r

    return element
  }
  public parseChildrenDelEmpty(element: element): element {  // 去掉空行
    const r: elements[] = []
    for(let i of element.children) {
      if(is.str(i)) {
        if(i === '') {
          if(r.length <= 0 || arr.last(r) === '' && is.str(r[r.length-2])) continue
          r.push(i)
        } else {
          if(arr.last(r) === '' && is.str(r[r.length-2])) arr.last(r, i)
          else r.push(i)
        }
      } else r.push(i)
    }
    while(arr.last(r) === '') r.pop()
    element.children = r
    return element
  }

  public parseChildrenLines(element: element): element {  // 打包成行，去掉每行里前后空行
    const sym = this.syms.get('paragraph')
    const newLine = (children: elements[]) =>
      this.parseChildrenDelEmpty({
        elems: [{
          elem: sym,
          attrs: []
        }],
        children: children,
        level: -1,
        status: {}
      })

    let r: elements[] = []
    let t: elements[] = []
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
  public parseChildrenNewLines(element: element): element {
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

    let r: elements[] = []
    let b = true
    for(let i of element.children) {
      if(b) b = false
      else r.push(newLine)
      r.push(i)
    }
    element.children = r
    return element
  }
  public parseChildrenJoinLines(element: element): element {  // 连续的字符串拼成一个字符串，用 \n 连接
    return this.parseChildrenJoin(element, '\n')
  }

  public parseChildrenDelStrs(element: element): element {  // 删除字符串
    const r: elements[] = []
    for(let i of element.children)
      if(is.obj(i)) r.push(i)
    element.children = r
    return element
  }
  public parseChildrenDelElems(element: element): element {  // 删除元素
    const r: elements[] = []
    for(let i of element.children)
      if(is.str(i)) r.push(i)
    element.children = r
    return element
  }

  public parseChildrenClosure(element: element): element {  // 展开闭包
    const sym = this.syms.get('closure')

    const r: elements[] = []
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
        arr.appends(r, i.children)
      } else r.push(i)
    element.children = r
    return element
  }

  public parseChildrenCopyStatus(element: element): element {
    for(let i of element.children)
      if(is.obj(i)) copyStatus(i, element)
    return element
  }
  public parseChildrenParsers(element: element): codes[] {
    const r: codes[] = []
    for(let i of element.children)
      if(is.str(i)) r.push(i)
      else arr.appends(r, this.parseParsers(i))
    return r
  }

  public parseParsers(element: element): codes[] {
    if(element.elems.length < 1) return []

    const parser = this.parsers.get(element.elems[0].elem)
    if(is.un(parser)) return []

    return parser(this, element)
  }
  public parseSifters(element: element): codes[] {
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
                       attrs: any[], children: any[]): codes[] {
    const creator = this.creators.get(sym)
    if(is.un(creator)) return []

    return creator(status, attrs, children)
  }

  public parseCreate(element: element): codes[] {
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
