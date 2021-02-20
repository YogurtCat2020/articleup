import {is, str} from '@yogurtcat/lib'
import {vars} from './util'


export type anoname = (ano: number) => string


export default function(vars: vars, text: string, anoname?: anoname): string {
  if(is.un(anoname)) anoname = ano => '~ano-'+String(ano)

  const r: string[] = []
  let ano = 0
  const vbl = /([^$(){}<> \n]+ ?)?<<</
  const bl = '<<<'
  const br = '>>>'

  while(true) {
    let p = text.search(vbl)
    if(p < 0) {
      r.push(text)
      break
    }
    if(p > 0) {
      r.push(text.slice(0, p))
      text = text.slice(p)
    }

    p = text.search(bl)
    let sk = text.slice(0, p)
    let brv = br+str.reverse(sk)
    let k = str.trim(sk)
    if(k.length <= 0) k = anoname(ano++)
    text = text.slice(p+bl.length)

    p = text.search(brv)
    if(p < 0) {
      r.push(sk)
      r.push(bl)
      continue
    }
    let v = text.slice(0, p)
    let sv = `$:(${k}){}`
    r.push(sv)
    vars.set(k, [v])
    text = text.slice(p+brv.length)
  }
  return str.join(r)
}
