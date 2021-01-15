import {trim, reverse} from './util'
import Context from './Context'


export default function(context: Context, text: string): string {
  const vars = context.vars
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
    let brv = br+reverse(sk)
    let k = trim(sk)
    if(k.length <= 0) k = '~ano-'+String(ano++)
    text = text.slice(p+bl.length)

    p = text.search(brv)
    if(p < 0) {
      r.push(sk)
      r.push(bl)
      continue
    }
    let v = text.slice(0, p)
    let sv = `$:(${k}){}`
    vars.set(k, [v])
    r.push(sv)
    text = text.slice(p+brv.length)
  }
  return r.join('')
}
