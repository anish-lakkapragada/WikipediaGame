"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.edit = exports.sleep = exports.getHTML = exports.isWikipediaTopic = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
function edit(hyperlink) {
    if (hyperlink.startsWith('/wiki/')) {
        return 'https:/en.wikipedia.org' + hyperlink;
    }
    return hyperlink;
}
exports.edit = edit;
// get the HTML in any page 
async function getHTML(url) {
    const resp = await (0, node_fetch_1.default)(url);
    const html = await resp.text();
    return html;
}
exports.getHTML = getHTML;
function isWikipediaTopic(hyperlink) {
    const url = edit(hyperlink);
    if (url == null) {
        console.log('NELL FALSE: ' + url);
        return false;
    }
    if (!url.startsWith('https:/en.wikipedia.org/wiki/') && !url.startsWith('https://en.wikipedia.org/wiki/')) {
        console.log('FALSE: ' + url);
        return false;
    }
    const nonoTopics = ['Special', 'Wikipedia', 'File', 'Category', 'Help'];
    for (const topic of nonoTopics) {
        if (url.includes(topic)) {
            return false;
        }
    }
    if (url.search('#') != -1 || url.search('.svg') != -1 || url.search('.png') != -1 || url.search('.jpg') != -1) {
        return false;
    }
    return true;
}
exports.isWikipediaTopic = isWikipediaTopic;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
exports.sleep = sleep;
