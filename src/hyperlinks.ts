/**
 * File to get the hyperlinks from a current page. 
 */

import cheerio from 'cheerio'; 
import path from 'path'; 
import {sleep, isWikipediaTopic, getHTML} from './utils';

// get the valid string 
export async function getHyperLinks(url: string): Promise<string[]> {
	let html; 
	
	await sleep(500); 

	try {
		html = await getHTML(url);
	}

	catch(e) {
		console.log(e);
		return [];
	}

	const $ = cheerio.load(html);

	const hyperlinks = $('a'); 
	const links: string[] = []; // get all the links 
	hyperlinks.each((i, link) => {
		const {href} = link.attribs; 
		if (href != null) {
			console.log('HREF: ' + href);
			const urlink = path.join('https:/en.wikipedia.org', href);
			if (isWikipediaTopic(urlink)) {
				links.push(urlink); 
			}
		}
	});

	console.log(`links.length: ${links.length}`);
	return links;
}
