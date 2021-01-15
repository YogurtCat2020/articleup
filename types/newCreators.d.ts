import { container } from '@yogurtcat/lib';
import { Creator } from './util';
export declare type Dict<K, V> = container.Dict<K, V>;
export default function (syms?: any): Dict<string, Creator>;
