import {is, to, init, decor, decorator, Dict} from '@yogurtcat/lib'
import Context from './Context'


export interface element {
  elems: {
    elem: string,
    attrs: string[]
  }[],
  children: elements[],
  level: number,
  status: any
}
export type elements = string|element
export type code = any
export type codes = string|code
export type vars = Dict<string, elements[]>

export type parser = (context: Context, element: element) => Promise<codes[]>
export type sifter = {parser: parser, desc: string}
export type creator = (status: any, attrs: any[], children: any[]) => codes[]
export type paramode = {line: Set<string>, block: Set<string>}
export type importFile = (p: string) => Promise<string>


export function newElement(): element {
  return {
    elems: [],
    children: [],
    level: -1,
    status: {}
  }
}
export function newCode(name: string, children?: any[]): code {
  const r = {
    X: 'H',
    N: name
  }
  if(!is.un(children)) r['C'] = {
    X: 'A',
    I: children
  }
  return r
}
export function copyStatus(tgt: element, src: element): void {
  tgt.status = to.obj(src.status)
}

export function addClass(key: string): decorator {
  return obj => {
    decor.$(obj,
      decor.obj.add('A', init.obj),
      decor.obj.get('A'),
      decor.obj.set('X', 'O'),
      decor.obj.add('I', init.obj),
      decor.obj.get('I'),
      decor.obj.add('class', init.obj),
      decor.obj.get('class'),
      decor.obj.set('X', 'A'),
      decor.obj.add('I', init.arr),
      decor.obj.get('I'),
      x => {x.push(to.str(key))}
    )
  }
}
export function addAttrs(key: string, val: string): decorator {
  return obj => {
    decor.$(obj,
      decor.obj.add('A', init.obj),
      decor.obj.get('A'),
      decor.obj.set('X', 'O'),
      decor.obj.add('I', init.obj),
      decor.obj.get('I'),
      decor.obj.add('attrs', init.obj),
      decor.obj.get('attrs'),
      decor.obj.set('X', 'O'),
      decor.obj.add('I', init.obj),
      decor.obj.get('I'),
      decor.obj.set(key, val)
    )
  }
}
