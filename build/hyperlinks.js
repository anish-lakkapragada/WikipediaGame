"use strict";
/**
 * File to get the hyperlinks from a current page.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHyperLinks = void 0;
const cheerio_1 = __importDefault(require("cheerio"));
const utils_1 = require("./utils");
// get the valid string 
async function getHyperLinks(url, sleepTime = 1000) {
    let html;
    await (0, utils_1.sleep)(sleepTime);
    try {
        html = await (0, utils_1.getHTML)(url);
    }
    catch (e) {
        console.log(e);
        return [];
    }
    const $ = cheerio_1.default.load(html);
    const hyperlinks = $('a');
    const links = []; // get all the links 
    hyperlinks.each((i, elem) => {
        const href = $(elem).attr('href');
        if (href != null) {
            const urlink = (0, utils_1.edit)(href);
            const isTopic = (0, utils_1.isWikipediaTopic)(urlink);
            if (isTopic) {
                console.log('URLINK : ' + urlink);
                links.push(urlink);
            }
        }
    });
    console.log(`links.length: ${links.length}`);
    return links;
}
exports.getHyperLinks = getHyperLinks;
