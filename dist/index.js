/*!
 * articleup.js v1.0.0
 * (c) 2020- YogurtCat
 * git: https://github.com/YogurtCat2020/articleup
 * Released under the MIT License.
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, function() {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Context.ts":
/*!************************!*\
  !*** ./src/Context.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const util_1 = __webpack_require__(/*! ./util */ "./src/util.ts");
const newSyms_1 = __webpack_require__(/*! ./newSyms */ "./src/newSyms.ts");
const newParsers_1 = __webpack_require__(/*! ./newParsers */ "./src/newParsers.ts");
const newSifters_1 = __webpack_require__(/*! ./newSifters */ "./src/newSifters.ts");
const newCreators_1 = __webpack_require__(/*! ./newCreators */ "./src/newCreators.ts");
const newParagraph_1 = __webpack_require__(/*! ./newParagraph */ "./src/newParagraph.ts");
const parse_1 = __webpack_require__(/*! ./parse */ "./src/parse.ts");
const preproc_1 = __webpack_require__(/*! ./preproc */ "./src/preproc.ts");
const { is, to } = lib_1.base;
const { Dict } = lib_1.container;
class Context {
    constructor(args) {
        let { syms, parsers, sifters, creators, paragraph } = args || {};
        if (is.un(syms))
            syms = newSyms_1.default();
        if (is.un(parsers))
            parsers = newParsers_1.default(syms);
        if (is.un(sifters))
            sifters = newSifters_1.default(syms);
        if (is.un(creators))
            creators = newCreators_1.default(syms);
        if (is.un(paragraph))
            paragraph = newParagraph_1.default(syms);
        this.syms = new Dict(syms);
        this.vars = new Dict();
        this.parsers = parsers;
        this.sifters = sifters;
        this.creators = creators;
        this.paragraph = paragraph;
    }
    parse(text) {
        const sym = this.syms.get('main');
        const parser = this.parsers.get(sym);
        if (is.un(parser))
            return [];
        text = preproc_1.default(this, text);
        const element = parse_1.default(text);
        return parser(this, element);
    }
    parseVars(element) {
        const sym = this.syms.get('var');
        const vars = this.vars;
        if (element.elems.length >= 2 && element.elems[1].elem === sym) {
            const r = [];
            for (let i of element.elems[1].attrs) {
                let t = to.obj(vars.get(i));
                if (is.un(t))
                    r.push(i);
                else {
                    let e = {
                        elems: [],
                        children: t,
                        level: -1,
                        status: {}
                    };
                    e = this.parseChildrenDelElems(e);
                    e = this.parseChildrenJoin(e);
                    if (e.children.length <= 0)
                        continue;
                    let s = e.children[0];
                    util_1.appends(r, util_1.split(util_1.trim(s)));
                }
            }
            element.elems[0].attrs = r;
            element.elems.splice(1, 1);
        }
        return element;
    }
    parseElems(element) {
        if (element.elems.length <= 1)
            return element;
        const child = {
            elems: element.elems.splice(1),
            children: element.children,
            level: -1,
            status: {}
        };
        element.children = [child];
        return element;
    }
    parseChildrenVars(element) {
        const sym = this.syms.get('var');
        const vars = this.vars;
        const r = [];
        for (let i of element.children) {
            if (is.str(i) || i.elems[0].elem !== sym)
                r.push(i);
            else
                for (let j of i.elems[0].attrs) {
                    let t = to.obj(vars.get(j));
                    if (is.un(t))
                        r.push(j);
                    else
                        util_1.appends(r, t);
                }
        }
        element.children = r;
        return element;
    }
    parseChildrenContinue(element) {
        const sym = this.syms.get('continue');
        const r = [];
        let b = false;
        for (let i of element.children) {
            if (is.obj(i) && i.elems[0].elem === sym)
                b = true;
            else if (b) {
                if (is.str(i))
                    i = util_1.trimLeft(i);
                r.push(i);
                b = false;
            }
            else
                r.push(i);
        }
        element.children = r;
        return element;
    }
    parseChildrenJoin(element, sep) {
        if (is.un(sep))
            sep = '';
        const r = [];
        for (let i of element.children) {
            if (is.str(i) && is.str(util_1.last(r)))
                util_1.last(r, util_1.last(r) + sep + i);
            else
                r.push(i);
        }
        element.children = r;
        return element;
    }
    parseChildrenSplit(element) {
        let r = [];
        for (let i of element.children) {
            if (is.str(i))
                util_1.appends(r, util_1.splitLines(i).map(util_1.tightSpaces));
            else
                r.push(i);
        }
        element.children = r;
        r = [];
        for (let i of element.children) {
            if (is.str(i)) {
                if (r.length <= 0)
                    r.push(util_1.trimLeft(i));
                else if (is.str(util_1.last(r))) {
                    util_1.last(r, util_1.trimRight(util_1.last(r)));
                    r.push(util_1.trimLeft(i));
                }
                else
                    r.push(i);
            }
            else
                r.push(i);
        }
        if (is.str(util_1.last(r)))
            util_1.last(r, util_1.trimRight(util_1.last(r)));
        element.children = r;
        return element;
    }
    parseChildrenDelEmpty(element) {
        const r = [];
        for (let i of element.children) {
            if (is.str(i)) {
                if (i === '') {
                    if (r.length <= 0 || util_1.last(r) === '' && is.str(r[r.length - 2]))
                        continue;
                    r.push(i);
                }
                else {
                    if (util_1.last(r) === '' && is.str(r[r.length - 2]))
                        util_1.last(r, i);
                    else
                        r.push(i);
                }
            }
            else
                r.push(i);
        }
        while (util_1.last(r) === '')
            r.pop();
        element.children = r;
        return element;
    }
    parseChildrenLines(element) {
        const sym = this.syms.get('paragraph');
        const newLine = (children) => this.parseChildrenDelEmpty({
            elems: [{
                    elem: sym,
                    attrs: []
                }],
            children: children,
            level: -1,
            status: {}
        });
        let r = [];
        let t = [];
        let b = false;
        for (let i of element.children) {
            if (is.str(i)) {
                if (b) {
                    r.push(newLine(t));
                    t = [i];
                }
                else {
                    t.push(i);
                    b = true;
                }
            }
            else {
                t.push(i);
                b = false;
            }
        }
        if (t.length > 0)
            r.push(newLine(t));
        element.children = r;
        return element;
    }
    parseChildrenNewLines(element) {
        const sym = this.syms.get('newline');
        const newLine = {
            elems: [{
                    elem: sym,
                    attrs: ['1']
                }],
            children: [],
            level: -1,
            status: {}
        };
        let r = [];
        let b = true;
        for (let i of element.children) {
            if (b)
                b = false;
            else
                r.push(newLine);
            r.push(i);
        }
        element.children = r;
        return element;
    }
    parseChildrenJoinLines(element) {
        return this.parseChildrenJoin(element, '\n');
    }
    parseChildrenDelStrs(element) {
        const r = [];
        for (let i of element.children)
            if (is.obj(i))
                r.push(i);
        element.children = r;
        return element;
    }
    parseChildrenDelElems(element) {
        const r = [];
        for (let i of element.children)
            if (is.str(i))
                r.push(i);
        element.children = r;
        return element;
    }
    parseChildrenClosure(element) {
        const sym = this.syms.get('closure');
        const r = [];
        for (let i of element.children)
            if (is.obj(i) && i.elems[0].elem === sym) {
                i = this.parseVars(i);
                i = this.parseElems(i);
                i = this.parseChildrenVars(i);
                i = this.parseChildrenContinue(i);
                i = this.parseChildrenJoin(i);
                i = this.parseChildrenSplit(i);
                i = this.parseChildrenDelEmpty(i);
                i = this.parseChildrenJoinLines(i);
                util_1.appends(r, i.children);
            }
            else
                r.push(i);
        element.children = r;
        return element;
    }
    parseChildrenCopyStatus(element) {
        for (let i of element.children)
            if (is.obj(i))
                util_1.copyStatus(i, element);
        return element;
    }
    parseChildrenParsers(element) {
        const r = [];
        for (let i of element.children)
            if (is.str(i))
                r.push(i);
            else
                util_1.appends(r, this.parseParsers(i));
        return r;
    }
    parseParsers(element) {
        if (element.elems.length < 1)
            return [];
        const parser = this.parsers.get(element.elems[0].elem);
        if (is.un(parser))
            return [];
        return parser(this, element);
    }
    parseSifters(element) {
        if (element.elems.length < 1)
            return [];
        const sifter = this.sifters.get(element.elems[0].elem);
        if (is.un(sifter))
            return [];
        for (let i of sifter) {
            let r = i.parser(this, element);
            if (!is.un(r))
                return r;
        }
        return [];
    }
    createElement(sym, status, attrs, children) {
        const creator = this.creators.get(sym);
        if (is.un(creator))
            return [];
        return creator(status, attrs, children);
    }
    parseCreate(element) {
        if (element.elems.length < 1)
            return [];
        element = this.parseVars(element);
        element = this.parseElems(element);
        element = this.parseChildrenVars(element);
        element = this.parseChildrenContinue(element);
        element = this.parseChildrenJoin(element);
        element = this.parseChildrenSplit(element);
        element = this.parseChildrenDelEmpty(element);
        element = this.parseChildrenLines(element);
        element = this.parseChildrenNewLines(element);
        element = this.parseChildrenCopyStatus(element);
        const children = this.parseChildrenParsers(element);
        const sym = element.elems[0].elem;
        const attrs = element.elems[0].attrs;
        const status = element.status;
        return this.createElement(sym, status, attrs, children);
    }
}
exports.default = Context;


/***/ }),

/***/ "./src/index.ts":
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Context = exports.parse = exports.preproc = exports.newParagraph = exports.newCreators = exports.newSifters = exports.newParsers = exports.newSyms = exports.util = void 0;
exports.util = __webpack_require__(/*! ./util */ "./src/util.ts");
var newSyms_1 = __webpack_require__(/*! ./newSyms */ "./src/newSyms.ts");
Object.defineProperty(exports, "newSyms", ({ enumerable: true, get: function () { return newSyms_1.default; } }));
var newParsers_1 = __webpack_require__(/*! ./newParsers */ "./src/newParsers.ts");
Object.defineProperty(exports, "newParsers", ({ enumerable: true, get: function () { return newParsers_1.default; } }));
var newSifters_1 = __webpack_require__(/*! ./newSifters */ "./src/newSifters.ts");
Object.defineProperty(exports, "newSifters", ({ enumerable: true, get: function () { return newSifters_1.default; } }));
var newCreators_1 = __webpack_require__(/*! ./newCreators */ "./src/newCreators.ts");
Object.defineProperty(exports, "newCreators", ({ enumerable: true, get: function () { return newCreators_1.default; } }));
var newParagraph_1 = __webpack_require__(/*! ./newParagraph */ "./src/newParagraph.ts");
Object.defineProperty(exports, "newParagraph", ({ enumerable: true, get: function () { return newParagraph_1.default; } }));
var preproc_1 = __webpack_require__(/*! ./preproc */ "./src/preproc.ts");
Object.defineProperty(exports, "preproc", ({ enumerable: true, get: function () { return preproc_1.default; } }));
var parse_1 = __webpack_require__(/*! ./parse */ "./src/parse.ts");
Object.defineProperty(exports, "parse", ({ enumerable: true, get: function () { return parse_1.default; } }));
var Context_1 = __webpack_require__(/*! ./Context */ "./src/Context.ts");
Object.defineProperty(exports, "Context", ({ enumerable: true, get: function () { return Context_1.default; } }));


/***/ }),

/***/ "./src/newCreators.ts":
/*!****************************!*\
  !*** ./src/newCreators.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const util_1 = __webpack_require__(/*! ./util */ "./src/util.ts");
const newSyms_1 = __webpack_require__(/*! ./newSyms */ "./src/newSyms.ts");
const { is, to } = lib_1.base;
const { Dict } = lib_1.container;
const article = (status, attrs, children) => [util_1.newElement(`'article'`, children)];
const section = (status, attrs, children) => [util_1.newElement(`'section'`, children)];
const figure = (status, attrs, children) => [util_1.newElement(`'figure'`, children)];
const paragraph = (status, attrs, children) => [util_1.newElement(`'p'`, children)];
const headline = (status, attrs, children) => [util_1.newElement(`'h${status.chapter}'`, children)];
const caption = (status, attrs, children) => [util_1.newElement(`'caption'`, children)];
const align = (status, attrs, children) => {
    let name;
    if (status.paragraph === 1 && status.line_block === true)
        name = `'p'`;
    else
        name = `'span'`;
    let [cls] = attrs;
    if (is.un(cls))
        cls = '0';
    return [util_1.mount(util_1.newElement(name, children), util_1.addClass('a'), util_1.addClass('a' + cls))];
};
const color = (status, attrs, children) => {
    let [cls] = attrs;
    if (is.un(cls))
        cls = '0';
    return [util_1.mount(util_1.newElement(`'span'`, children), util_1.addClass('c'), util_1.addClass('c' + cls))];
};
const highlight = (status, attrs, children) => {
    let [cls] = attrs;
    if (is.un(cls))
        cls = '0';
    return [util_1.mount(util_1.newElement(`'mark'`, children), util_1.addClass('h' + cls))];
};
const bold = (status, attrs, children) => [util_1.newElement(`'strong'`, children)];
const italic = (status, attrs, children) => [util_1.newElement(`'em'`, children)];
const underline = (status, attrs, children) => [util_1.newElement(`'ins'`, children)];
const strike = (status, attrs, children) => [util_1.newElement(`'del'`, children)];
const superscript = (status, attrs, children) => [util_1.newElement(`'sup'`, children)];
const subscript = (status, attrs, children) => [util_1.newElement(`'sub'`, children)];
const hyperlink = (status, attrs, children) => {
    let [url, target] = attrs;
    if (is.un(url))
        return [];
    if (is.un(target))
        target = '_blank';
    url = to.str(url);
    target = to.str(target);
    if (children.length <= 0)
        children = [url];
    return [util_1.mount(util_1.newElement(`'a'`, children), util_1.addAttrs('href', url), util_1.addAttrs('target', target))];
};
const space = (status, attrs, children) => {
    const c = '\u00A0';
    let [num] = attrs;
    num = Number(num);
    if (is.nan(num) || num < 0)
        num = 0;
    const n = 10;
    const m = Math.floor(num / n);
    const q = num % n;
    const r = new Array(m).fill(to.str(c.repeat(n)));
    if (q > 0)
        r.push(to.str(c.repeat(q)));
    return r;
};
const newline = (status, attrs, children) => {
    let [num] = attrs;
    num = Number(num);
    if (is.nan(num) || num < 0)
        num = 0;
    return new Array(num).fill(util_1.newElement(`'br'`));
};
const separate = (status, attrs, children) => {
    let [num] = attrs;
    num = Number(num);
    if (is.nan(num) || num < 0)
        num = 0;
    return new Array(num).fill(util_1.newElement(`'hr'`));
};
const image = (status, attrs, children) => {
    let [img, width, height] = attrs;
    let [txt] = children;
    if (is.un(img))
        return [];
    if (is.un(width))
        width = '0';
    if (is.un(height))
        height = '0';
    img = to.str(img);
    txt = is.un(txt) ? null : util_1.addAttrs('alt', to.str(txt));
    width = width === '0' ? null : util_1.addAttrs('width', to.str(width));
    height = height === '0' ? null : util_1.addAttrs('height', to.str(height));
    return [util_1.mount(util_1.newElement(`'img'`), util_1.addAttrs('src', img), txt, width, height)];
};
const formula = (status, attrs, children) => {
    let [width, height, mode] = attrs;
    let [txt] = children;
    if (is.un(txt))
        return [];
    if (is.un(mode))
        mode = 'svg';
    if (is.un(width))
        width = '0';
    if (is.un(height))
        height = '0';
    const img = to.str('https://latex.codecogs.com/' + mode + '.latex?' + encodeURIComponent(txt));
    width = width === '0' ? null : util_1.addAttrs('width', to.str(width));
    height = height === '0' ? null : util_1.addAttrs('height', to.str(height));
    return [util_1.mount(util_1.newElement(`'img'`), util_1.addClass('f'), util_1.addAttrs('src', img), width, height)];
};
const quote = (status, attrs, children) => [util_1.newElement(`'blockquote'`, children)];
const code = (status, attrs, children) => {
    if (status.paragraph === 1 && status.line_block === true) {
        let [lang] = attrs;
        let [txt] = children;
        lang = is.un(attrs) ? null : util_1.addClass(lang);
        txt = to.str(txt);
        return [util_1.newElement(`'pre'`, [
                util_1.mount(util_1.newElement(`'code'`, [txt]), lang)
            ])];
    }
    let [mode] = attrs;
    let [txt] = children;
    if (is.un(mode))
        mode = 'c';
    mode = {
        c: 'code',
        s: 'samp',
        v: 'var'
    }[mode] || 'code';
    mode = to.str(mode);
    txt = to.str(txt);
    return [util_1.newElement(mode, [txt])];
};
const keyboard = (status, attrs, children) => [util_1.newElement(`'kbd'`, children)];
const list = (status, attrs, children) => [];
const table = (status, attrs, children) => [];
const audio = (status, attrs, children) => [];
const video = (status, attrs, children) => [];
function default_1(syms) {
    if (is.un(syms))
        syms = newSyms_1.default();
    syms = to.obj(syms);
    return new Dict({
        [syms.article]: article,
        [syms.section]: section,
        [syms.figure]: figure,
        [syms.paragraph]: paragraph,
        [syms.headline]: headline,
        [syms.caption]: caption,
        [syms.align]: align,
        [syms.color]: color,
        [syms.highlight]: highlight,
        [syms.bold]: bold,
        [syms.italic]: italic,
        [syms.underline]: underline,
        [syms.strike]: strike,
        [syms.superscript]: superscript,
        [syms.subscript]: subscript,
        [syms.hyperlink]: hyperlink,
        [syms.space]: space,
        [syms.newline]: newline,
        [syms.separate]: separate,
        [syms.image]: image,
        [syms.formula]: formula,
        [syms.quote]: quote,
        [syms.code]: code,
        [syms.keyboard]: keyboard,
        [syms.list]: list,
        [syms.table]: table,
        [syms.audio]: audio,
        [syms.video]: video
    });
}
exports.default = default_1;


/***/ }),

/***/ "./src/newParagraph.ts":
/*!*****************************!*\
  !*** ./src/newParagraph.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const newSyms_1 = __webpack_require__(/*! ./newSyms */ "./src/newSyms.ts");
const { is, to } = lib_1.base;
function default_1(syms) {
    if (is.un(syms))
        syms = newSyms_1.default();
    syms = to.obj(syms);
    return {
        line: new Set([
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
        block: new Set([
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
    };
}
exports.default = default_1;


/***/ }),

/***/ "./src/newParsers.ts":
/*!***************************!*\
  !*** ./src/newParsers.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const util_1 = __webpack_require__(/*! ./util */ "./src/util.ts");
const newSyms_1 = __webpack_require__(/*! ./newSyms */ "./src/newSyms.ts");
const { is, to } = lib_1.base;
const { Dict } = lib_1.container;
const main = (context, element) => {
    element = context.parseChildrenVars(element);
    element = context.parseChildrenContinue(element);
    element = context.parseChildrenDelStrs(element);
    return context.parseChildrenParsers(element);
};
const def = (context, element) => {
    element = context.parseVars(element);
    element = context.parseElems(element);
    element = context.parseChildrenContinue(element);
    element = context.parseChildrenJoin(element);
    element = context.parseChildrenSplit(element);
    element = context.parseChildrenDelEmpty(element);
    element = context.parseChildrenLines(element);
    const vars = context.vars;
    for (let i of element.children) {
        let t = i.children[0];
        if (is.obj(t))
            continue;
        let k;
        [k, t] = util_1.splitLeft(t);
        if (is.un(t)) {
            if (i.children.length === 1)
                vars.set(k, []);
            continue;
        }
        i.children[0] = t;
        i = context.parseChildrenClosure(i);
        i = context.parseChildrenVars(i);
        i = context.parseChildrenContinue(i);
        i = context.parseChildrenJoin(i);
        i = context.parseChildrenSplit(i);
        i = context.parseChildrenDelEmpty(i);
        i = context.parseChildrenJoinLines(i);
        vars.set(k, i.children);
    }
    return [];
};
const closure = (context, element) => {
    element = context.parseVars(element);
    element = context.parseElems(element);
    element = context.parseChildrenVars(element);
    element = context.parseChildrenContinue(element);
    element = context.parseChildrenJoin(element);
    element = context.parseChildrenSplit(element);
    element = context.parseChildrenDelEmpty(element);
    element = context.parseChildrenLines(element);
    return context.parseSifters(element);
};
const paragraph = (context, element) => {
    return context.parseSifters(element);
};
const dft = (context, element) => {
    return context.parseCreate(element);
};
const image = (context, element) => {
    element = context.parseVars(element);
    element = context.parseElems(element);
    element = context.parseChildrenVars(element);
    element = context.parseChildrenContinue(element);
    element = context.parseChildrenDelElems(element);
    element = context.parseChildrenJoin(element);
    element = context.parseChildrenSplit(element);
    element = context.parseChildrenDelEmpty(element);
    element = context.parseChildrenJoinLines(element);
    const children = element.children;
    const sym = element.elems[0].elem;
    const attrs = element.elems[0].attrs;
    const status = element.status;
    return context.createElement(sym, status, attrs, children);
};
const formula = image;
const code = (context, element) => {
    element = context.parseVars(element);
    element = context.parseElems(element);
    element = context.parseChildrenVars(element);
    element = context.parseChildrenContinue(element);
    element = context.parseChildrenDelElems(element);
    element = context.parseChildrenJoin(element);
    const children = element.children;
    const sym = element.elems[0].elem;
    const attrs = element.elems[0].attrs;
    const status = element.status;
    return context.createElement(sym, status, attrs, children);
};
function default_1(syms) {
    if (is.un(syms))
        syms = newSyms_1.default();
    syms = to.obj(syms);
    return new Dict({
        [syms.main]: main,
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
    });
}
exports.default = default_1;


/***/ }),

/***/ "./src/newSifters.ts":
/*!***************************!*\
  !*** ./src/newSifters.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const util_1 = __webpack_require__(/*! ./util */ "./src/util.ts");
const newSyms_1 = __webpack_require__(/*! ./newSyms */ "./src/newSyms.ts");
const { is, to } = lib_1.base;
const { Dict } = lib_1.container;
function isClosureFirstLine(element, sym) {
    return element.children.length >= 1 && isParagraphOneElem(element.children[0], sym);
}
function isParagraphOneElem(element, sym) {
    if (element.children.length === 1) {
        const elem = element.children[0];
        if (!is.obj(elem))
            return false;
        return is.un(sym) || elem.elems.length >= 1 && elem.elems[0].elem === sym;
    }
    return false;
}
function isParagraphOneStr(element) {
    if (element.children.length === 1) {
        const elem = element.children[0];
        return is.str(elem);
    }
    return false;
}
const article = (context, element) => {
    if (!is.un(element.status.chapter))
        return null;
    let sym = context.syms.get('headline');
    if (!isClosureFirstLine(element, sym))
        return null;
    element.status.chapter = 1;
    element.status.figure = null;
    element.status.paragraph = null;
    element = context.parseChildrenCopyStatus(element);
    const children = context.parseChildrenParsers(element);
    sym = context.syms.get('article');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
const section = (context, element) => {
    if (is.un(element.status.chapter))
        return null;
    let sym = context.syms.get('headline');
    if (!isClosureFirstLine(element, sym))
        return null;
    element.status.chapter += 1;
    element.status.paragraph = null;
    element = context.parseChildrenCopyStatus(element);
    const children = context.parseChildrenParsers(element);
    sym = context.syms.get('section');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
const figure = (context, element) => {
    if (!is.un(element.status.figure))
        return null;
    let sym = context.syms.get('caption');
    if (!isClosureFirstLine(element, sym))
        return null;
    element.status.figure = true;
    element.status.paragraph = null;
    element = context.parseChildrenCopyStatus(element);
    const children = context.parseChildrenParsers(element);
    sym = context.syms.get('figure');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
const oneStr = (context, element) => {
    if (!isParagraphOneStr(element))
        return null;
    const children = [to.str(element.children[0])];
    if (!is.un(element.status.paragraph))
        return children;
    element.status.paragraph = 1;
    const sym = context.syms.get('paragraph');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
const oneElemLine = (context, element) => {
    if (!isParagraphOneElem(element))
        return null;
    const elem = element.children[0].elems[0].elem;
    const set = context.paragraph.line;
    if (!set.has(elem))
        return null;
    let p = true;
    if (is.un(element.status.paragraph)) {
        element.status.paragraph = 1;
        p = false;
    }
    element.status.line_block = false;
    element = context.parseChildrenCopyStatus(element);
    const children = context.parseChildrenParsers(element);
    if (p)
        return children;
    const sym = context.syms.get('paragraph');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
const oneElemBlock = (context, element) => {
    if (!isParagraphOneElem(element))
        return null;
    const elem = element.children[0].elems[0].elem;
    const set = context.paragraph.block;
    if (!set.has(elem))
        return null;
    if (!is.un(element.status.paragraph))
        return null;
    element.status.line_block = true;
    element.status.paragraph = 1;
    element = context.parseChildrenCopyStatus(element);
    return context.parseChildrenParsers(element);
};
const many = (context, element) => {
    if (element.children.length <= 1)
        return null;
    let p = true;
    if (is.un(element.status.paragraph)) {
        element.status.paragraph = element.children.length;
        p = false;
    }
    element = context.parseChildrenCopyStatus(element);
    const set = context.paragraph.line;
    const children = [];
    for (let i of element.children) {
        if (is.str(i))
            children.push(to.str(i));
        else if (set.has(i.elems[0].elem))
            util_1.appends(children, context.parseParsers(i));
    }
    if (p)
        return children;
    const sym = context.syms.get('paragraph');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
function default_1(syms) {
    if (is.un(syms))
        syms = newSyms_1.default();
    syms = to.obj(syms);
    return new Dict({
        [syms.closure]: [
            { parser: figure, desc: 'figure' },
            { parser: section, desc: 'section' },
            { parser: article, desc: 'article' }
        ],
        [syms.paragraph]: [
            { parser: many, desc: 'many' },
            { parser: oneElemBlock, desc: 'one elem block' },
            { parser: oneElemLine, desc: 'one elem line' },
            { parser: oneStr, desc: 'one str' }
        ]
    });
}
exports.default = default_1;


/***/ }),

/***/ "./src/newSyms.ts":
/*!************************!*\
  !*** ./src/newSyms.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const { Dict } = lib_1.container;
function default_1() {
    return new Dict({
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
    });
}
exports.default = default_1;


/***/ }),

/***/ "./src/parse.ts":
/*!**********************!*\
  !*** ./src/parse.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const util_1 = __webpack_require__(/*! ./util */ "./src/util.ts");
const { to, asrt } = lib_1.base;
const CHILDREN = Symbol('CHILDREN');
const ELEMS = Symbol('ELEMS');
const ATTRS = Symbol('ATTRS');
function default_1(text) {
    let r = {
        elems: [],
        children: [],
        level: -1,
        status: {}
    };
    let sk = [];
    let lv = 0;
    let hr;
    let attrs;
    let p = 0;
    let i;
    let z = CHILDREN;
    for (i = 0; i < text.length; i++) {
        let c = text[i];
        switch (z) {
            case CHILDREN:
                {
                    if (c === '$' && i + 1 < text.length) {
                        if (to.has(' \n', text[i + 1]))
                            i++;
                        else {
                            if (p < i)
                                r.children.push(text.slice(p, i));
                            if (to.has('$(){}', text[i + 1]))
                                p = ++i;
                            else {
                                let t = {
                                    elems: [],
                                    children: [],
                                    level: -1,
                                    status: {}
                                };
                                r.children.push(t);
                                sk.push(r);
                                r = t;
                                z = ELEMS;
                            }
                        }
                    }
                    else if (c === '{')
                        lv++;
                    else if (c === '}') {
                        lv--;
                        if (r.level === lv) {
                            if (p < i)
                                r.children.push(text.slice(p, i));
                            r = sk.pop();
                            p = i + 1;
                        }
                    }
                }
                break;
            case ELEMS:
                {
                    if (c === ' ' && text[i + 1] === '{')
                        c = text[++i];
                    if (to.has('$)} \n', c)) {
                        r = sk.pop();
                        p = i--;
                        z = CHILDREN;
                    }
                    else if (c === '{') {
                        r.level = lv++;
                        p = i + 1;
                        z = CHILDREN;
                    }
                    else if (c === '(') {
                        hr = 1;
                        attrs = [];
                        p = i + 1;
                        z = ATTRS;
                    }
                    else
                        r.elems.push({
                            elem: c,
                            attrs: []
                        });
                }
                break;
            case ATTRS:
                {
                    if (c === '$') {
                        if (to.has(' \n', text[i + 1]))
                            i++;
                        else {
                            if (p < i)
                                attrs.push(text.slice(p, i));
                            p = ++i;
                        }
                    }
                    else if (c === '(')
                        hr++;
                    else if (c === ')') {
                        hr--;
                        if (hr <= 0) {
                            if (p < i)
                                attrs.push(text.slice(p, i));
                            util_1.last(r.elems).attrs = util_1.split(util_1.trim(attrs.join('')));
                            z = ELEMS;
                        }
                    }
                }
                break;
        }
    }
    if (p < text.length)
        r.children.push(text.slice(p));
    asrt(sk.length <= 0);
    return r;
}
exports.default = default_1;


/***/ }),

/***/ "./src/preproc.ts":
/*!************************!*\
  !*** ./src/preproc.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const util_1 = __webpack_require__(/*! ./util */ "./src/util.ts");
function default_1(context, text) {
    const vars = context.vars;
    const r = [];
    let ano = 0;
    const vbl = /([^$(){}<> \n]+ ?)?<<</;
    const bl = '<<<';
    const br = '>>>';
    while (true) {
        let p = text.search(vbl);
        if (p < 0) {
            r.push(text);
            break;
        }
        if (p > 0) {
            r.push(text.slice(0, p));
            text = text.slice(p);
        }
        p = text.search(bl);
        let sk = text.slice(0, p);
        let brv = br + util_1.reverse(sk);
        let k = util_1.trim(sk);
        if (k.length <= 0)
            k = '~ano-' + String(ano++);
        text = text.slice(p + bl.length);
        p = text.search(brv);
        if (p < 0) {
            r.push(sk);
            r.push(bl);
            continue;
        }
        let v = text.slice(0, p);
        let sv = `$:(${k}){}`;
        vars.set(k, [v]);
        r.push(sv);
        text = text.slice(p + brv.length);
    }
    return r.join('');
}
exports.default = default_1;


/***/ }),

/***/ "./src/util.ts":
/*!*********************!*\
  !*** ./src/util.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addAttrs = exports.addClass = exports.setKey = exports.getKey = exports.addKey = exports.mount = exports.newElement = exports.copyStatus = exports.reverse = exports.tightSpaces = exports.splitLines = exports.split = exports.splitLeft = exports.trim = exports.trimRight = exports.trimLeft = exports.appends = exports.last = void 0;
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const { is, to, init } = lib_1.base;
function last(arr, item) {
    if (is.un(item))
        return arr[arr.length - 1];
    arr[arr.length - 1] = item;
    return null;
}
exports.last = last;
function appends(arr, items) {
    arr.splice(arr.length, 0, ...items);
}
exports.appends = appends;
function trimLeft(s) {
    return s.replace(/^[ \n]+/, '');
}
exports.trimLeft = trimLeft;
function trimRight(s) {
    return s.replace(/[ \n]+$/, '');
}
exports.trimRight = trimRight;
function trim(s) {
    return trimRight(trimLeft(s));
}
exports.trim = trim;
function splitLeft(s) {
    const i = s.indexOf(' ');
    if (i < 0)
        return [s, null];
    return [s.slice(0, i), s.slice(i + 1, s.length)];
}
exports.splitLeft = splitLeft;
function split(s) {
    return s.split(/[ \n]+/);
}
exports.split = split;
function splitLines(s) {
    return s.split(/\n+/);
}
exports.splitLines = splitLines;
function tightSpaces(s) {
    return s.replace(/ +/g, ' ');
}
exports.tightSpaces = tightSpaces;
function reverse(s) {
    return s.split('').reverse().join('');
}
exports.reverse = reverse;
function copyStatus(tgt, src) {
    tgt.status = to.obj(src.status);
}
exports.copyStatus = copyStatus;
function newElement(name, children) {
    const r = {
        X: 'H',
        N: name
    };
    if (!is.un(children))
        r['C'] = {
            X: 'A',
            I: children
        };
    return r;
}
exports.newElement = newElement;
function mount(obj, ...funcs) {
    for (let i of funcs) {
        if (is.un(i))
            continue;
        let t = i(obj);
        if (!is.un(t))
            obj = t;
    }
    return obj;
}
exports.mount = mount;
function addKey(key, val) {
    return obj => {
        if (is.un(obj[key]))
            obj[key] = val();
    };
}
exports.addKey = addKey;
function getKey(key) {
    return obj => obj[key];
}
exports.getKey = getKey;
function setKey(key, val) {
    return obj => {
        obj[key] = val;
    };
}
exports.setKey = setKey;
function addClass(key, val) {
    if (is.un(val))
        val = `true`;
    return obj => {
        mount(obj, addKey('A', init.obj), getKey('A'), setKey('X', 'O'), addKey('I', init.obj), getKey('I'), addKey('class', init.obj), getKey('class'), setKey('X', 'O'), addKey('I', init.obj), getKey('I'), setKey(key, val));
    };
}
exports.addClass = addClass;
function addAttrs(key, val) {
    return obj => {
        mount(obj, addKey('A', init.obj), getKey('A'), setKey('X', 'O'), addKey('I', init.obj), getKey('I'), addKey('attrs', init.obj), getKey('attrs'), setKey('X', 'O'), addKey('I', init.obj), getKey('I'), setKey(key, val));
    };
}
exports.addAttrs = addAttrs;


/***/ }),

/***/ "@yogurtcat/lib":
/*!*********************************!*\
  !*** external "@yogurtcat/lib" ***!
  \*********************************/
/***/ ((module) => {

module.exports = require("@yogurtcat/lib");;

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__("./src/index.ts");
/******/ })()
;
});