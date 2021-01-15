import {base} from '@yogurtcat/lib'
import {Element, last, split, trim} from './util'

const {to, asrt} = base


const CHILDREN = Symbol('CHILDREN')
const ELEMS = Symbol('ELEMS')
const ATTRS = Symbol('ATTRS')


export default function(text: string): Element {
  let r: Element = {
    elems: [],
    children: [],
    level: -1,
    status: {}
  }
  let sk: Element[] = []
  let lv = 0
  let hr: number
  let attrs: string[]
  let p = 0
  let i: number
  let z = CHILDREN

  for(i = 0; i < text.length; i++) {
    let c = text[i]

    switch(z) {
      case CHILDREN: {
        if(c === '$' && i+1 < text.length) {
          if(to.has(' \n', text[i+1])) i++
          else {
            if(p < i) r.children.push(text.slice(p, i))
            if(to.has('$(){}', text[i+1])) p = ++i
            else {
              let t: Element = {
                elems: [],
                children: [],
                level: -1,
                status: {}
              }
              r.children.push(t)
              sk.push(r)
              r = t
              z = ELEMS
            }
          }
        } else if(c === '{') lv++
        else if(c === '}') {
          lv--
          if(r.level === lv) {
            if(p < i) r.children.push(text.slice(p, i))
            r = sk.pop()
            p = i+1
          }
        }
      } break

      case ELEMS: {
        if(c === ' ' && text[i+1] === '{') c = text[++i]

        if(to.has('$)} \n', c)) {
          r = sk.pop()
          p = i--
          z = CHILDREN
        } else if(c === '{') {
          r.level = lv++
          p = i+1
          z = CHILDREN
        } else if(c === '(') {
          hr = 1
          attrs = []
          p = i+1
          z = ATTRS
        } else r.elems.push({
          elem: c,
          attrs: []
        })
      } break

      case ATTRS: {
        if(c === '$') {
          if(to.has(' \n', text[i+1])) i++
          else {
            if(p < i) attrs.push(text.slice(p, i))
            p = ++i
          }
        } else if(c === '(') hr++
        else if(c === ')') {
          hr--
          if(hr <= 0) {
            if(p < i) attrs.push(text.slice(p, i))
            last(r.elems).attrs = split(trim(attrs.join('')))
            z = ELEMS
          }
        }
      } break
    }
  }

  if(p < text.length) r.children.push(text.slice(p))

  asrt(sk.length <= 0)
  return r
}
