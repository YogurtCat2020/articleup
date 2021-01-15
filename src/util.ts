import {base} from '@yogurtcat/lib'
import Context from './Context'

const {is, to, init} = base


export interface Element {
  elems: {
    elem: string,
    attrs: string[]
  }[],
  children: (string|Element)[],
  level: number,
  status: any
}
export type Parser = (context: Context, element: Element) => (string|object)[]
export type Sifter = {parser: Parser, desc: string}
export type Creator = (status: any, attrs: any[], children: any[]) => (string|object)[]
export type Paragraph = {line: Set<string>, block: Set<string>}
export type Decor = (obj: any) => any


export function last(arr: any[], item?: any): any {
  if(is.un(item)) return arr[arr.length-1]
  arr[arr.length-1] = item
  return null
}
export function appends<T>(arr: any[], items: any[]): void {
  arr.splice(arr.length, 0, ...items)
}

export function trimLeft(s: string): string {
  return s.replace(/^[ \n]+/, '')
}
export function trimRight(s: string): string {
  return s.replace(/[ \n]+$/, '')
}
export function trim(s: string): string {
  return trimRight(trimLeft(s))
}
export function splitLeft(s: string): [string, string] {
  const i = s.indexOf(' ')
  if(i < 0) return [s, null]
  return [s.slice(0, i), s.slice(i+1, s.length)]
}
export function split(s: string): string[] {
  return s.split(/[ \n]+/)
}
export function splitLines(s: string): string[] {
  return s.split(/\n+/)
}
export function tightSpaces(s: string): string {
  return s.replace(/ +/g, ' ')
}
export function reverse(s: string): string {
  return s.split('').reverse().join('')
}

export function copyStatus(tgt: Element, src: Element): void {
  tgt.status = to.obj(src.status)
}

export function newElement(name: string, children?: any[]): object {
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


export function mount(obj: any, ...funcs: Decor[]): any {
  for(let i of funcs) {
    if(is.un(i)) continue
    let t = i(obj)
    if(!is.un(t)) obj = t
  }
  return obj
}

export function addKey(key: string, val: () => any): Decor {
  return obj => {
    if(is.un(obj[key])) obj[key] = val()
  }
}
export function getKey(key: string): Decor {
  return obj => obj[key]
}
export function setKey(key: string, val: any): Decor {
  return obj => {
    obj[key] = val
  }
}

export function addClass(key: string, val?: string): Decor {
  if(is.un(val)) val = `true`

  return obj => {
    mount(obj,
      addKey('A', init.obj),
      getKey('A'),
      setKey('X', 'O'),
      addKey('I', init.obj),
      getKey('I'),
      addKey('class', init.obj),
      getKey('class'),
      setKey('X', 'O'),
      addKey('I', init.obj),
      getKey('I'),
      setKey(key, val)
      )
  }
}
export function addAttrs(key: string, val: string): Decor {
  return obj => {
    mount(obj,
      addKey('A', init.obj),
      getKey('A'),
      setKey('X', 'O'),
      addKey('I', init.obj),
      getKey('I'),
      addKey('attrs', init.obj),
      getKey('attrs'),
      setKey('X', 'O'),
      addKey('I', init.obj),
      getKey('I'),
      setKey(key, val)
    )
  }
}
