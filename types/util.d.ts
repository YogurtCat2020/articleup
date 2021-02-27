import { decorator, Dict } from '@yogurtcat/lib';
import Context from './Context';
export interface element {
    elems: {
        elem: string;
        attrs: string[];
    }[];
    children: elements[];
    level: number;
    status: any;
}
export declare type elements = string | element;
export declare type code = any;
export declare type codes = string | code;
export declare type vars = Dict<string, elements[]>;
export declare type parser = (context: Context, element: element) => Promise<codes[]>;
export declare type sifter = {
    parser: parser;
    desc: string;
};
export declare type creator = (status: any, attrs: any[], children: any[]) => codes[];
export declare type paramode = {
    line: Set<string>;
    block: Set<string>;
};
export declare type importFile = (p: string) => Promise<string>;
export declare function newElement(): element;
export declare function newCode(name: string, children?: any[]): code;
export declare function copyStatus(tgt: element, src: element): void;
export declare function addClass(key: string, val?: string): decorator;
export declare function addAttrs(key: string, val: string): decorator;
