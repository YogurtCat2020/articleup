import {is, to, str} from '@yogurtcat/lib'
import {element, parser} from './util'
import newSyms from './newSyms'


const main: parser = async(context, element) => {
  element = context.parseChildrenVars(element)
  element = context.parseChildrenContinue(element)
  element = context.parseChildrenDelStrs(element)
  return await context.parseChildrenParsers(element)
}
const imp: parser = async(context, element) => {
  element = context.parseVars(element)
  element = context.parseElems(element)
  element = context.parseChildrenVars(element)
  element = context.parseChildrenContinue(element)
  element = context.parseChildrenJoin(element)
  element = context.parseChildrenSplit(element)
  element = context.parseChildrenDelEmpty(element)
  element = context.parseChildrenLines(element)

  const vars = context.vars
  for(let i of <element[]> element.children) {
    if(i.children.length !== 1) continue
    if(!is.str(i.children[0])) continue

    let t = <string> i.children[0]
    let k: string
    [k, t] = str.splitLeft(t)
    if(is.un(t) || to.has(t, ' ')) continue
    t = await context.importFile(t)
    vars.set(k, [t])
  }
  return []
}
const def: parser = async(context, element) => {
  element = context.parseVars(element)
  element = context.parseElems(element)
  element = context.parseChildrenContinue(element)
  element = context.parseChildrenJoin(element)
  element = context.parseChildrenSplit(element)
  element = context.parseChildrenDelEmpty(element)
  element = context.parseChildrenLines(element)

  const vars = context.vars
  for(let i of <element[]> element.children) {
    let t = i.children[0]
    if(is.obj(t)) continue

    let k: string
    [k, t] = str.splitLeft(t)
    if(is.un(t)) {
      if(i.children.length === 1) vars.set(k, [])
      continue
    }

    i.children[0] = t
    i = context.parseChildrenClosure(i)
    i = context.parseChildrenVars(i)
    i = context.parseChildrenContinue(i)
    i = context.parseChildrenJoin(i)
    i = context.parseChildrenSplit(i)
    i = context.parseChildrenDelEmpty(i)
    i = context.parseChildrenJoinLines(i)
    vars.set(k, i.children)
  }
  return []
}
const closure: parser = async(context, element) => {
  element = context.parseVars(element)
  element = context.parseElems(element)
  element = context.parseChildrenVars(element)
  element = context.parseChildrenContinue(element)
  element = context.parseChildrenJoin(element)
  element = context.parseChildrenSplit(element)
  element = context.parseChildrenDelEmpty(element)
  element = context.parseChildrenLines(element)
  return await context.parseSifters(element)
}
const paragraph: parser = async(context, element) => {
  return await context.parseSifters(element)
}
const dft: parser = async(context, element) => {
  return await context.parseCreate(element)
}

const image: parser = async(context, element) => {
  element = context.parseVars(element)
  element = context.parseElems(element)
  element = context.parseChildrenVars(element)
  element = context.parseChildrenContinue(element)
  element = context.parseChildrenDelElems(element)
  element = context.parseChildrenJoin(element)
  element = context.parseChildrenSplit(element)
  element = context.parseChildrenDelEmpty(element)
  element = context.parseChildrenJoinLines(element)
  const children = element.children

  const sym = element.elems[0].elem
  const attrs = element.elems[0].attrs
  const status = element.status
  return context.createElement(sym, status, attrs, children)
}
const formula = image
const code: parser = async(context, element) => {
  element = context.parseVars(element)
  element = context.parseElems(element)
  element = context.parseChildrenVars(element)
  element = context.parseChildrenContinue(element)
  element = context.parseChildrenDelElems(element)
  element = context.parseChildrenJoin(element)
  const children = element.children

  const sym = element.elems[0].elem
  const attrs = element.elems[0].attrs
  const status = element.status
  return context.createElement(sym, status, attrs, children)
}


export default (syms?: any) => {
  if(is.un(syms)) syms = newSyms()

  return {
    [syms.main]: main,
    [syms.imp]: imp,
    [syms.def]: def,
    [syms.closure]: closure,
    [syms.paragraph]: paragraph,
    [syms.headline]: dft,
    [syms.caption]: dft,

    [syms.align]: dft,
    [syms.color]: dft,
    [syms.highlight]: dft,
    [syms.bold]: dft,
    [syms.italic]: dft,
    [syms.underline]: dft,
    [syms.strike]: dft,
    [syms.superscript]: dft,
    [syms.subscript]: dft,
    [syms.hyperlink]: dft,
    [syms.space]: dft,
    [syms.newline]: dft,
    [syms.separate]: dft,

    [syms.image]: image,
    [syms.formula]: formula,
    [syms.quote]: dft,
    [syms.code]: code,
    [syms.keyboard]: dft,
    // [syms.list]: dft,
    // [syms.table]: dft,
    // [syms.audio]: dft,
    // [syms.video]: dft
  }
}
