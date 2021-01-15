import Context from './Context';
export interface Element {
    elems: {
        elem: string;
        attrs: string[];
    }[];
    children: (string | Element)[];
    level: number;
    status: any;
}
export declare type Parser = (context: Context, element: Element) => (string | object)[];
export declare type Sifter = {
    parser: Parser;
    desc: string;
};
export declare type Creator = (status: any, attrs: any[], children: any[]) => (string | object)[];
export declare type Paragraph = {
    line: Set<string>;
    block: Set<string>;
};
export declare type Decor = (obj: any) => any;
export declare function last(arr: any[], item?: any): any;
export declare function appends<T>(arr: any[], items: any[]): void;
export declare function trimLeft(s: string): string;
export declare function trimRight(s: string): string;
export declare function trim(s: string): string;
export declare function splitLeft(s: string): [string, string];
export declare function split(s: string): string[];
export declare function splitLines(s: string): string[];
export declare function tightSpaces(s: string): string;
export declare function reverse(s: string): string;
export declare function copyStatus(tgt: Element, src: Element): void;
export declare function newElement(name: string, children?: any[]): object;
export declare function mount(obj: any, ...funcs: Decor[]): any;
export declare function addKey(key: string, val: () => any): Decor;
export declare function getKey(key: string): Decor;
export declare function setKey(key: string, val: any): Decor;
export declare function addClass(key: string, val?: string): Decor;
export declare function addAttrs(key: string, val: string): Decor;
