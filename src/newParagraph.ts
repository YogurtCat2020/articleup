import {base} from '@yogurtcat/lib'
import {Paragraph} from './util'
import newSyms from './newSyms'

const {is, to} = base


export default function(syms?: any): Paragraph {
  if(is.un(syms)) syms = newSyms()

  syms = to.obj(syms)

  return {
    line: new Set<string>([
      syms.align,
      syms.color,
      syms.highlight,
      syms.bold,
      syms.italic,
      syms.underline,
      syms.strike,
      syms.superscript,
      syms.subscript,
      syms.hyperlink,
      syms.space,
      syms.newline,

      syms.image,
      syms.formula,
      syms.code,
      syms.keyboard
    ]),
    block: new Set<string>([
      syms.closure,
      syms.headline,
      syms.caption,

      syms.align,
      syms.newline,
      syms.separate,

      syms.quote,
      syms.code,
      syms.list,
      syms.table,
      syms.audio,
      syms.video
    ])
  }
}
