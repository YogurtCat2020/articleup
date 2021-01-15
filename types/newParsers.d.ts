import { container } from '@yogurtcat/lib';
import { Parser } from './util';
export declare type Dict<K, V> = container.Dict<K, V>;
export default function (syms?: any): Dict<string, Parser>;
