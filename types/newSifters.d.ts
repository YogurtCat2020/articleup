import { container } from '@yogurtcat/lib';
import { Sifter } from './util';
export declare type Dict<K, V> = container.Dict<K, V>;
export default function (syms?: any): Dict<string, Sifter[]>;
