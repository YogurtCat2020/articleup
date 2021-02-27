/*!
 * articleup.js v1.1.0
 * (c) 2020- YogurtCat
 * git: https://github.com/YogurtCat2020/articleup
 * Released under the MIT License.
 */
/******/ (() => { // webpackBootstrap
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
const newParamode_1 = __webpack_require__(/*! ./newParamode */ "./src/newParamode.ts");
const preproc_1 = __webpack_require__(/*! ./preproc */ "./src/preproc.ts");
const parse_1 = __webpack_require__(/*! ./parse */ "./src/parse.ts");
class Context {
    constructor() {
        const syms = newSyms_1.default();
        const parsers = newParsers_1.default(syms);
        const sifters = newSifters_1.default(syms);
        const creators = newCreators_1.default(syms);
        const paramode = newParamode_1.default(syms);
        this.syms = new lib_1.Dict(syms);
        this.vars = new lib_1.Dict();
        this.parsers = new lib_1.Dict(parsers);
        this.sifters = new lib_1.Dict(sifters);
        this.creators = new lib_1.Dict(creators);
        this.paramode = paramode;
        this.importFile = async (path) => path;
    }
    async parseComment(text) {
        let element = parse_1.default(text);
        element = this.parseVars(element);
        element = this.parseElems(element);
        element = this.parseChildrenVars(element);
        element = this.parseChildrenContinue(element);
        element = this.parseChildrenJoin(element);
        element = this.parseChildrenSplit(element);
        element = this.parseChildrenDelEmpty(element);
        element = this.parseChildrenLines(element);
        element = this.parseChildrenNewLines(element);
        element.status.paragraph = 1;
        element = this.parseChildrenCopyStatus(element);
        const children = await this.parseChildrenParsers(element);
        const sym = this.syms.get('comment');
        const status = element.status;
        return this.createElement(sym, status, [], children);
    }
    async parse(text) {
        const sym = this.syms.get('main');
        const parser = this.parsers.get(sym);
        if (lib_1.is.un(parser))
            return [];
        text = preproc_1.default(this.vars, text);
        const element = parse_1.default(text);
        return await parser(this, element);
    }
    parseVars(element) {
        const sym = this.syms.get('var');
        const vars = this.vars;
        if (element.elems.length >= 2 && element.elems[1].elem === sym) {
            const r = [];
            for (let i of element.elems[1].attrs) {
                let t = lib_1.to.obj(vars.get(i));
                if (lib_1.is.un(t))
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
                    lib_1.arr.appends(r, lib_1.str.split(lib_1.str.trim(s)));
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
            if (lib_1.is.str(i) || i.elems[0].elem !== sym)
                r.push(i);
            else
                for (let j of i.elems[0].attrs) {
                    let t = lib_1.to.obj(vars.get(j));
                    if (lib_1.is.un(t))
                        r.push(j);
                    else
                        lib_1.arr.appends(r, t);
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
            if (lib_1.is.obj(i) && i.elems[0].elem === sym)
                b = true;
            else if (b) {
                if (lib_1.is.str(i))
                    i = lib_1.str.trimLeft(i);
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
        if (lib_1.is.un(sep))
            sep = '';
        const r = [];
        for (let i of element.children) {
            if (lib_1.is.str(i) && lib_1.is.str(lib_1.arr.last(r)))
                lib_1.arr.last(r, lib_1.arr.last(r) + sep + i);
            else
                r.push(i);
        }
        element.children = r;
        return element;
    }
    parseChildrenSplit(element) {
        let r = [];
        for (let i of element.children) {
            if (lib_1.is.str(i))
                lib_1.arr.appends(r, lib_1.str.splitLines(i).map(lib_1.str.tightSpaces));
            else
                r.push(i);
        }
        element.children = r;
        r = [];
        for (let i of element.children) {
            if (lib_1.is.str(i)) {
                if (r.length <= 0)
                    r.push(lib_1.str.trimLeft(i));
                else if (lib_1.is.str(lib_1.arr.last(r))) {
                    lib_1.arr.last(r, lib_1.str.trimRight(lib_1.arr.last(r)));
                    r.push(lib_1.str.trimLeft(i));
                }
                else
                    r.push(i);
            }
            else
                r.push(i);
        }
        if (lib_1.is.str(lib_1.arr.last(r)))
            lib_1.arr.last(r, lib_1.str.trimRight(lib_1.arr.last(r)));
        element.children = r;
        return element;
    }
    parseChildrenDelEmpty(element) {
        const r = [];
        for (let i of element.children) {
            if (lib_1.is.str(i)) {
                if (i === '') {
                    if (r.length <= 0 || lib_1.arr.last(r) === '' && lib_1.is.str(r[r.length - 2]))
                        continue;
                    r.push(i);
                }
                else {
                    if (lib_1.arr.last(r) === '' && lib_1.is.str(r[r.length - 2]))
                        lib_1.arr.last(r, i);
                    else
                        r.push(i);
                }
            }
            else
                r.push(i);
        }
        while (lib_1.arr.last(r) === '')
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
            if (lib_1.is.str(i)) {
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
            if (lib_1.is.obj(i))
                r.push(i);
        element.children = r;
        return element;
    }
    parseChildrenDelElems(element) {
        const r = [];
        for (let i of element.children)
            if (lib_1.is.str(i))
                r.push(i);
        element.children = r;
        return element;
    }
    parseChildrenClosure(element) {
        const sym = this.syms.get('closure');
        const r = [];
        for (let i of element.children)
            if (lib_1.is.obj(i) && i.elems[0].elem === sym) {
                i = this.parseVars(i);
                i = this.parseElems(i);
                i = this.parseChildrenVars(i);
                i = this.parseChildrenContinue(i);
                i = this.parseChildrenJoin(i);
                i = this.parseChildrenSplit(i);
                i = this.parseChildrenDelEmpty(i);
                i = this.parseChildrenJoinLines(i);
                lib_1.arr.appends(r, i.children);
            }
            else
                r.push(i);
        element.children = r;
        return element;
    }
    parseChildrenCopyStatus(element) {
        for (let i of element.children)
            if (lib_1.is.obj(i))
                util_1.copyStatus(i, element);
        return element;
    }
    async parseChildrenParsers(element) {
        const r = [];
        for (let i of element.children)
            if (lib_1.is.str(i))
                r.push(i);
            else
                lib_1.arr.appends(r, await this.parseParsers(i));
        return r;
    }
    async parseParsers(element) {
        if (element.elems.length < 1)
            return [];
        const parser = this.parsers.get(element.elems[0].elem);
        if (lib_1.is.un(parser))
            return [];
        return await parser(this, element);
    }
    async parseSifters(element) {
        if (element.elems.length < 1)
            return [];
        const sifter = this.sifters.get(element.elems[0].elem);
        if (lib_1.is.un(sifter))
            return [];
        for (let i of sifter) {
            let r = await i.parser(this, element);
            if (!lib_1.is.un(r))
                return r;
        }
        return [];
    }
    createElement(sym, status, attrs, children) {
        const creator = this.creators.get(sym);
        if (lib_1.is.un(creator))
            return [];
        return creator(status, attrs, children);
    }
    async parseCreate(element) {
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
        const children = await this.parseChildrenParsers(element);
        const sym = element.elems[0].elem;
        const attrs = element.elems[0].attrs;
        const status = element.status;
        return this.createElement(sym, status, attrs, children);
    }
}
exports.default = Context;


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
const comment = (status, attrs, children) => {
    if (status.chapter)
        return [];
    return [lib_1.decor.$(util_1.newCode(`'div'`, children), util_1.addClass('comment'))];
};
const article = (status, attrs, children) => {
    if (!status.chapter)
        return [];
    return [util_1.newCode(`'article'`, children)];
};
const section = (status, attrs, children) => {
    if (!status.chapter)
        return [];
    return [util_1.newCode(`'section'`, children)];
};
const figure = (status, attrs, children) => {
    if (!status.chapter)
        return [];
    return [util_1.newCode(`'figure'`, children)];
};
const paragraph = (status, attrs, children) => [util_1.newCode(`'p'`, children)];
const headline = (status, attrs, children) => {
    if (!status.chapter)
        return [];
    return [util_1.newCode(`'h${status.chapter}'`, children)];
};
const caption = (status, attrs, children) => {
    if (!status.chapter)
        return [];
    return [util_1.newCode(`'caption'`, children)];
};
const align = (status, attrs, children) => {
    let name;
    if (status.paragraph === 1 && status.line_block === true)
        name = `'p'`;
    else
        name = `'span'`;
    let [cls] = attrs;
    if (lib_1.is.un(cls))
        cls = '0';
    return [lib_1.decor.$(util_1.newCode(name, children), util_1.addClass('a'), util_1.addClass('a' + cls))];
};
const color = (status, attrs, children) => {
    let [cls] = attrs;
    if (lib_1.is.un(cls))
        cls = '0';
    return [lib_1.decor.$(util_1.newCode(`'span'`, children), util_1.addClass('c'), util_1.addClass('c' + cls))];
};
const highlight = (status, attrs, children) => {
    let [cls] = attrs;
    if (lib_1.is.un(cls))
        cls = '0';
    return [lib_1.decor.$(util_1.newCode(`'mark'`, children), util_1.addClass('h' + cls))];
};
const bold = (status, attrs, children) => [util_1.newCode(`'strong'`, children)];
const italic = (status, attrs, children) => [util_1.newCode(`'em'`, children)];
const underline = (status, attrs, children) => [util_1.newCode(`'ins'`, children)];
const strike = (status, attrs, children) => [util_1.newCode(`'del'`, children)];
const superscript = (status, attrs, children) => [util_1.newCode(`'sup'`, children)];
const subscript = (status, attrs, children) => [util_1.newCode(`'sub'`, children)];
const hyperlink = (status, attrs, children) => {
    let [url, target] = attrs;
    if (lib_1.is.un(url))
        return [];
    if (lib_1.is.un(target))
        target = '_blank';
    url = lib_1.to.str(url);
    target = lib_1.to.str(target);
    if (children.length <= 0)
        children = [url];
    return [lib_1.decor.$(util_1.newCode(`'a'`, children), util_1.addAttrs('href', url), util_1.addAttrs('target', target))];
};
const space = (status, attrs, children) => {
    const c = '\u00A0';
    let [num] = attrs;
    num = Number(num);
    if (lib_1.is.nan(num) || num < 0)
        num = 0;
    const n = 10;
    const m = Math.floor(num / n);
    const q = num % n;
    const r = new Array(m).fill(lib_1.to.str(c.repeat(n)));
    if (q > 0)
        r.push(lib_1.to.str(c.repeat(q)));
    return r;
};
const newline = (status, attrs, children) => {
    let [num] = attrs;
    num = Number(num);
    if (lib_1.is.nan(num) || num < 0)
        num = 0;
    return new Array(num).fill(util_1.newCode(`'br'`));
};
const separate = (status, attrs, children) => {
    let [num] = attrs;
    num = Number(num);
    if (lib_1.is.nan(num) || num < 0)
        num = 0;
    return new Array(num).fill(util_1.newCode(`'hr'`));
};
const image = (status, attrs, children) => {
    let [img, width, height] = attrs;
    let [txt] = children;
    if (lib_1.is.un(img))
        return [];
    if (lib_1.is.un(width))
        width = '0';
    if (lib_1.is.un(height))
        height = '0';
    img = lib_1.to.str(img);
    txt = lib_1.is.un(txt) ? null : util_1.addAttrs('alt', lib_1.to.str(txt));
    width = width === '0' ? null : util_1.addAttrs('width', lib_1.to.str(width));
    height = height === '0' ? null : util_1.addAttrs('height', lib_1.to.str(height));
    return [lib_1.decor.$(util_1.newCode(`'img'`), util_1.addAttrs('src', img), txt, width, height)];
};
const formula = (status, attrs, children) => {
    let [width, height, mode] = attrs;
    let [txt] = children;
    if (lib_1.is.un(txt))
        return [];
    if (lib_1.is.un(mode))
        mode = 'svg';
    if (lib_1.is.un(width))
        width = '0';
    if (lib_1.is.un(height))
        height = '0';
    const img = lib_1.to.str('https://latex.codecogs.com/' + mode + '.latex?' + encodeURIComponent(txt));
    width = width === '0' ? null : util_1.addAttrs('width', lib_1.to.str(width));
    height = height === '0' ? null : util_1.addAttrs('height', lib_1.to.str(height));
    return [lib_1.decor.$(util_1.newCode(`'img'`), util_1.addClass('f'), util_1.addAttrs('src', img), width, height)];
};
const quote = (status, attrs, children) => [util_1.newCode(`'blockquote'`, children)];
const code = (status, attrs, children) => {
    if (status.paragraph === 1 && status.line_block === true) {
        let [lang] = attrs;
        let [txt] = children;
        lang = lib_1.is.un(attrs) ? null : util_1.addClass(lang);
        txt = lib_1.to.str(txt);
        return [util_1.newCode(`'pre'`, [
                lib_1.decor.$(util_1.newCode(`'code'`, [txt]), lang)
            ])];
    }
    let [mode] = attrs;
    let [txt] = children;
    if (lib_1.is.un(mode))
        mode = 'c';
    mode = {
        c: 'code',
        s: 'samp',
        v: 'var'
    }[mode] || 'code';
    mode = lib_1.to.str(mode);
    txt = lib_1.to.str(txt);
    return [util_1.newCode(mode, [txt])];
};
const keyboard = (status, attrs, children) => [util_1.newCode(`'kbd'`, children)];
const list = (status, attrs, children) => [];
const table = (status, attrs, children) => [];
const audio = (status, attrs, children) => [];
const video = (status, attrs, children) => [];
exports.default = (syms) => {
    if (lib_1.is.un(syms))
        syms = newSyms_1.default();
    return {
        [syms.comment]: comment,
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
    };
};


/***/ }),

/***/ "./src/newParamode.ts":
/*!****************************!*\
  !*** ./src/newParamode.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const newSyms_1 = __webpack_require__(/*! ./newSyms */ "./src/newSyms.ts");
exports.default = (syms) => {
    if (lib_1.is.un(syms))
        syms = newSyms_1.default();
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
};


/***/ }),

/***/ "./src/newParsers.ts":
/*!***************************!*\
  !*** ./src/newParsers.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const newSyms_1 = __webpack_require__(/*! ./newSyms */ "./src/newSyms.ts");
const main = async (context, element) => {
    element = context.parseChildrenVars(element);
    element = context.parseChildrenContinue(element);
    element = context.parseChildrenDelStrs(element);
    return await context.parseChildrenParsers(element);
};
const imp = async (context, element) => {
    element = context.parseVars(element);
    element = context.parseElems(element);
    element = context.parseChildrenVars(element);
    element = context.parseChildrenContinue(element);
    element = context.parseChildrenJoin(element);
    element = context.parseChildrenSplit(element);
    element = context.parseChildrenDelEmpty(element);
    element = context.parseChildrenLines(element);
    const vars = context.vars;
    for (let i of element.children) {
        if (i.children.length !== 1)
            continue;
        if (!lib_1.is.str(i.children[0]))
            continue;
        let t = i.children[0];
        let k;
        [k, t] = lib_1.str.splitLeft(t);
        if (lib_1.is.un(t) || lib_1.to.has(t, ' '))
            continue;
        t = await context.importFile(t);
        vars.set(k, [t]);
    }
    return [];
};
const def = async (context, element) => {
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
        if (lib_1.is.obj(t))
            continue;
        let k;
        [k, t] = lib_1.str.splitLeft(t);
        if (lib_1.is.un(t)) {
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
const closure = async (context, element) => {
    element = context.parseVars(element);
    element = context.parseElems(element);
    element = context.parseChildrenVars(element);
    element = context.parseChildrenContinue(element);
    element = context.parseChildrenJoin(element);
    element = context.parseChildrenSplit(element);
    element = context.parseChildrenDelEmpty(element);
    element = context.parseChildrenLines(element);
    return await context.parseSifters(element);
};
const paragraph = async (context, element) => {
    return await context.parseSifters(element);
};
const dft = async (context, element) => {
    return await context.parseCreate(element);
};
const image = async (context, element) => {
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
const code = async (context, element) => {
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
exports.default = (syms) => {
    if (lib_1.is.un(syms))
        syms = newSyms_1.default();
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
    };
};


/***/ }),

/***/ "./src/newSifters.ts":
/*!***************************!*\
  !*** ./src/newSifters.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const newSyms_1 = __webpack_require__(/*! ./newSyms */ "./src/newSyms.ts");
function isClosureFirstLine(element, sym) {
    return element.children.length >= 1 && isParagraphOneElem(element.children[0], sym);
}
function isClosureLastLine(element, sym) {
    return element.children.length >= 1 && isParagraphOneElem(lib_1.arr.last(element.children), sym);
}
function isParagraphOneElem(element, sym) {
    if (element.children.length === 1) {
        const elem = element.children[0];
        if (!lib_1.is.obj(elem))
            return false;
        return lib_1.is.un(sym) || elem.elems.length >= 1 && elem.elems[0].elem === sym;
    }
    return false;
}
function isParagraphOneStr(element) {
    if (element.children.length === 1) {
        const elem = element.children[0];
        return lib_1.is.str(elem);
    }
    return false;
}
const article = async (context, element) => {
    if (!lib_1.is.un(element.status.chapter))
        return null;
    let sym = context.syms.get('headline');
    if (!isClosureFirstLine(element, sym))
        return null;
    element.status.chapter = 1;
    element.status.figure = null;
    element.status.paragraph = null;
    element = context.parseChildrenCopyStatus(element);
    const children = await context.parseChildrenParsers(element);
    sym = context.syms.get('article');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
const section = async (context, element) => {
    if (lib_1.is.un(element.status.chapter))
        return null;
    let sym = context.syms.get('headline');
    if (!isClosureFirstLine(element, sym))
        return null;
    element.status.chapter += 1;
    element.status.paragraph = null;
    element = context.parseChildrenCopyStatus(element);
    const children = await context.parseChildrenParsers(element);
    sym = context.syms.get('section');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
const figure = async (context, element) => {
    if (!lib_1.is.un(element.status.figure))
        return null;
    let sym = context.syms.get('caption');
    if (!isClosureFirstLine(element, sym) || !isClosureLastLine(element, sym))
        return null;
    element.status.figure = true;
    element.status.paragraph = null;
    element = context.parseChildrenCopyStatus(element);
    const children = await context.parseChildrenParsers(element);
    sym = context.syms.get('figure');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
const oneStr = async (context, element) => {
    if (!isParagraphOneStr(element))
        return null;
    const children = [lib_1.to.str(element.children[0])];
    if (!lib_1.is.un(element.status.paragraph))
        return children;
    element.status.paragraph = 1;
    const sym = context.syms.get('paragraph');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
const oneElemLine = async (context, element) => {
    if (!isParagraphOneElem(element))
        return null;
    const elem = element.children[0].elems[0].elem;
    const set = context.paramode.line;
    if (!set.has(elem))
        return null;
    let p = true;
    if (lib_1.is.un(element.status.paragraph)) {
        element.status.paragraph = 1;
        p = false;
    }
    element.status.line_block = false;
    element = context.parseChildrenCopyStatus(element);
    const children = await context.parseChildrenParsers(element);
    if (p)
        return children;
    const sym = context.syms.get('paragraph');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
const oneElemBlock = async (context, element) => {
    if (!isParagraphOneElem(element))
        return null;
    const elem = element.children[0].elems[0].elem;
    const set = context.paramode.block;
    if (!set.has(elem))
        return null;
    if (!lib_1.is.un(element.status.paragraph))
        return null;
    element.status.line_block = true;
    element.status.paragraph = 1;
    element = context.parseChildrenCopyStatus(element);
    return await context.parseChildrenParsers(element);
};
const many = async (context, element) => {
    if (element.children.length <= 1)
        return null;
    let p = true;
    if (lib_1.is.un(element.status.paragraph)) {
        element.status.paragraph = element.children.length;
        p = false;
    }
    element = context.parseChildrenCopyStatus(element);
    const set = context.paramode.line;
    const children = [];
    for (let i of element.children) {
        if (lib_1.is.str(i))
            children.push(lib_1.to.str(i));
        else if (set.has(i.elems[0].elem))
            lib_1.arr.appends(children, await context.parseParsers(i));
    }
    if (p)
        return children;
    const sym = context.syms.get('paragraph');
    const status = element.status;
    const attrs = element.elems[0].attrs;
    return context.createElement(sym, status, attrs, children);
};
exports.default = (syms) => {
    if (lib_1.is.un(syms))
        syms = newSyms_1.default();
    return {
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
    };
};


/***/ }),

/***/ "./src/newSyms.ts":
/*!************************!*\
  !*** ./src/newSyms.ts ***!
  \************************/
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.default = () => ({
    comment: 'comment',
    main: '',
    imp: '&',
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


/***/ }),

/***/ "./src/parse.ts":
/*!**********************!*\
  !*** ./src/parse.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
const util_1 = __webpack_require__(/*! ./util */ "./src/util.ts");
const CHILDREN = Symbol('CHILDREN');
const ELEMS = Symbol('ELEMS');
const ATTRS = Symbol('ATTRS');
function default_1(text) {
    let r = util_1.newElement();
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
                        if (lib_1.to.has(' \n', text[i + 1]))
                            i++;
                        else {
                            if (p < i)
                                r.children.push(text.slice(p, i));
                            if (lib_1.to.has('$(){}', text[i + 1]))
                                p = ++i;
                            else {
                                let t = util_1.newElement();
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
                    if (lib_1.to.has('$)} \n', c)) {
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
                        if (lib_1.to.has(' \n', text[i + 1]))
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
                            lib_1.arr.last(r.elems).attrs = lib_1.str.split(lib_1.str.trim(lib_1.str.join(attrs)));
                            z = ELEMS;
                        }
                    }
                }
                break;
        }
    }
    if (p < text.length)
        r.children.push(text.slice(p));
    lib_1.assert(sk.length <= 0, '基础语法错误！');
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
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
function default_1(vars, text, anoname) {
    if (lib_1.is.un(anoname))
        anoname = ano => '~ano-' + String(ano);
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
        let brv = br + lib_1.str.reverse(sk);
        let k = lib_1.str.trim(sk);
        if (k.length <= 0)
            k = anoname(ano++);
        text = text.slice(p + bl.length);
        p = text.search(brv);
        if (p < 0) {
            r.push(sk);
            r.push(bl);
            continue;
        }
        let v = text.slice(0, p);
        let sv = `$:(${k}){}`;
        r.push(sv);
        vars.set(k, [v]);
        text = text.slice(p + brv.length);
    }
    return lib_1.str.join(r);
}
exports.default = default_1;


/***/ }),

/***/ "./src/util.ts":
/*!*********************!*\
  !*** ./src/util.ts ***!
  \*********************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addAttrs = exports.addClass = exports.copyStatus = exports.newCode = exports.newElement = void 0;
const lib_1 = __webpack_require__(/*! @yogurtcat/lib */ "@yogurtcat/lib");
function newElement() {
    return {
        elems: [],
        children: [],
        level: -1,
        status: {}
    };
}
exports.newElement = newElement;
function newCode(name, children) {
    const r = {
        X: 'H',
        N: name
    };
    if (!lib_1.is.un(children))
        r['C'] = {
            X: 'A',
            I: children
        };
    return r;
}
exports.newCode = newCode;
function copyStatus(tgt, src) {
    tgt.status = lib_1.to.obj(src.status);
}
exports.copyStatus = copyStatus;
function addClass(key, val) {
    if (lib_1.is.un(val))
        val = `true`;
    return obj => {
        lib_1.decor.$(obj, lib_1.decor.obj.add('A', lib_1.init.obj), lib_1.decor.obj.get('A'), lib_1.decor.obj.set('X', 'O'), lib_1.decor.obj.add('I', lib_1.init.obj), lib_1.decor.obj.get('I'), lib_1.decor.obj.add('class', lib_1.init.obj), lib_1.decor.obj.get('class'), lib_1.decor.obj.set('X', 'O'), lib_1.decor.obj.add('I', lib_1.init.obj), lib_1.decor.obj.get('I'), lib_1.decor.obj.set(key, val));
    };
}
exports.addClass = addClass;
function addAttrs(key, val) {
    return obj => {
        lib_1.decor.$(obj, lib_1.decor.obj.add('A', lib_1.init.obj), lib_1.decor.obj.get('A'), lib_1.decor.obj.set('X', 'O'), lib_1.decor.obj.add('I', lib_1.init.obj), lib_1.decor.obj.get('I'), lib_1.decor.obj.add('attrs', lib_1.init.obj), lib_1.decor.obj.get('attrs'), lib_1.decor.obj.set('X', 'O'), lib_1.decor.obj.add('I', lib_1.init.obj), lib_1.decor.obj.get('I'), lib_1.decor.obj.set(key, val));
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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.util = exports.Context = void 0;
const Context_1 = __webpack_require__(/*! ./Context */ "./src/Context.ts");
exports.Context = Context_1.default;
const util = __webpack_require__(/*! ./util */ "./src/util.ts");
exports.util = util;

})();

module.exports = __webpack_exports__;
/******/ })()
;