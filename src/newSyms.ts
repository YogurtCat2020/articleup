import {container} from '@yogurtcat/lib'

const {Dict} = container

export type Dict<K, V> = container.Dict<K, V>


export default function(): Dict<string, string> {
  return new Dict<string, string>({
    main: '',
    def: '#',
    var: ':',
    continue: '/',
    closure: '.',
    article: '. article',
    section: '. section',
    figure: '. figure',
    paragraph: 'p',
    headline: 'H',
    caption: 'G',

    align: 'a',
    color: 'c',
    highlight: 'h',
    bold: 'b',
    italic: 'i',
    underline: 'u',
    strike: 's',
    superscript: '^',
    subscript: '_',
    hyperlink: '@',
    space: '+',
    newline: '*',
    separate: '-',

    image: 'I',
    formula: 'F',
    quote: 'Q',
    code: 'C',
    keyboard: 'K',
    list: 'L',
    table: 'T',
    audio: 'A',
    video: 'V'
  })
}
