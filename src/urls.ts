import got from "got"; 
import cheerio from "cheerio"; 

// get the valid string 
async function getHyperLinks(url: string): Promise<string[]> {
    const response = await got(url);
    const $ = cheerio.load(response.body);

    const hyperlinks = $('a'); 
    const links: string[] = []; // get all the links 
    hyperlinks.each((i, link) => {
        const href = $(link).attr('href');
        if (href != undefined && href) {
            links.push(href);
        }
    });

    console.log(links);
    return links;
}

export {getHyperLinks};