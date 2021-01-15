import { container } from '@yogurtcat/lib';
import { Element, Parser, Sifter, Creator, Paragraph } from './util';
export declare type Dict<K, V> = container.Dict<K, V>;
export default class Context {
    readonly syms: Dict<string, string>;
    readonly vars: Dict<string, (string | Element)[]>;
    readonly parsers: Dict<string, Parser>;
    readonly sifters: Dict<string, Sifter[]>;
    readonly creators: Dict<string, Creator>;
    readonly paragraph: Paragraph;
    constructor(args?: {
        syms?: any;
        parsers?: Dict<string, Parser>;
        sifters?: Dict<string, Sifter[]>;
        creators?: Dict<string, Creator>;
        paragraph?: Paragraph;
    });
    parse(text: string): (string | object)[];
    parseVars(element: Element): Element;
    parseElems(element: Element): Element;
    parseChildrenVars(element: Element): Element;
    parseChildrenContinue(element: Element): Element;
    parseChildrenJoin(element: Element, sep?: string): Element;
    parseChildrenSplit(element: Element): Element;
    parseChildrenDelEmpty(element: Element): Element;
    parseChildrenLines(element: Element): Element;
    parseChildrenNewLines(element: Element): Element;
    parseChildrenJoinLines(element: Element): Element;
    parseChildrenDelStrs(element: Element): Element;
    parseChildrenDelElems(element: Element): Element;
    parseChildrenClosure(element: Element): Element;
    parseChildrenCopyStatus(element: Element): Element;
    parseChildrenParsers(element: Element): (string | object)[];
    parseParsers(element: Element): (string | object)[];
    parseSifters(element: Element): (string | object)[];
    createElement(sym: string, status: any, attrs: any[], children: any[]): (string | object)[];
    parseCreate(element: Element): (string | object)[];
}
