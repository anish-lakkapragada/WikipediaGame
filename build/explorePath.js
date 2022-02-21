"use strict";
/**
 * File to explore a certain URL however many times.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.explorePath = void 0;
const hyperlinks_1 = require("./hyperlinks");
async function explorePath(url, depth) {
    const currentPath = [];
    let curURL = url;
    for (let i = 0; i < depth; i++) {
        const hyperlinks = await (0, hyperlinks_1.getHyperLinks)(curURL);
        if (hyperlinks.length == 0) {
            return { lastURL: curURL, depth: i, earlyTerminate: true, traversal: currentPath };
        }
        curURL = hyperlinks[Math.floor(Math.random() * hyperlinks.length)];
        currentPath.push(curURL);
        console.log(i);
    }
    return { lastURL: curURL, depth: depth, earlyTerminate: false, traversal: currentPath };
}
exports.explorePath = explorePath;
