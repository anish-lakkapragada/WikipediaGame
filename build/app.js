"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const explorePath_1 = require("./explorePath");
const hyperlinks_1 = require("./hyperlinks");
const utils_1 = require("./utils");
const cors_1 = __importDefault(require("cors"));
const cheerio_1 = __importDefault(require("cheerio"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: '*'
}));
app.get('/', async (req, res) => {
    res.send('dank');
});
/*
 Don't actually call this.
*/
app.get('/hyperlinks', async (req, res) => {
    console.log('submitting');
    const path = await (0, explorePath_1.explorePath)('https://en.wikipedia.org/wiki/Country_risk', 50);
    res.send(path);
});
app.get('/move', async (req, res) => {
    console.log(req.query.url);
    const isTopic = await (0, utils_1.isWikipediaTopic)(req.query.url);
    if (req.query && req.query.url && isTopic) {
        const links = await (0, hyperlinks_1.getHyperLinks)(req.query.url);
        res.send(links);
        return;
    }
    res.send({ 'error': true });
});
app.get('/thumbnail', async (req, res) => {
    const topic = req.query.topic;
    // gives the thumbnail (if any)
    console.log(topic);
    //https://en.wikipedia.org/w/api.php?action=query&titles=racing&prop=pageimages&format=json
    const response = await (0, node_fetch_1.default)(`https://en.wikipedia.org/wiki/${topic}`);
    const html = await response.text();
    const $ = cheerio_1.default.load(html);
    let thumbnail = null;
    $("meta").map((i, el) => {
        const property = $(el).attr('property');
        if (property === 'og:image') {
            thumbnail = $(el).attr('content');
        }
    });
    res.send({ thumbnail: thumbnail });
});
app.listen(process.env.PORT || 3000, () => { console.log('server running'); });
