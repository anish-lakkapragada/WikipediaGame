import got from "got"; 
import cheerio from "cheerio"; 
import path from "path"; 

function isWikipediaTopic(hyperlink: string): Boolean {
    if (!hyperlink.startsWith("https://en.wikipedia.org/wiki/")) {
        return false; 
    }
    
    if (hyperlink.search(":") != -1 || hyperlink.search("#") != -1) {
        return false; 
    }    

    return true;
}

const baseUrl: string = "https://en.wikipedia.org/";

// get the valid string 
async function getHyperLinks(url: string): Promise<string[]> {
    const response = await got(url);
    const $ = cheerio.load(response.body);

    const hyperlinks = $('a'); 
    const links: string[] = []; // get all the links 
    hyperlinks.each((i, link) => {
        const {href} = link.attribs; 
        if (href != null) {
            const urlink = path.join(baseUrl, href);
            if (isWikipediaTopic(urlink)) {
                links.push(urlink); 
            }
        }
    });

    return links;
}

// what if we recurse and see all the hyperlinks we can get in 2/3 connections? 
async function traverseLinks(curUrl: string, links: Set<String>, depth: number, maxDepth: number) {
    if (depth >= maxDepth) {
        return; 
    }

    const hyperlinks = await getHyperLinks(curUrl); 
    // for each of these links recurse again 
    for (const hyperlink of hyperlinks) {
        
    }

    

}

export {getHyperLinks};