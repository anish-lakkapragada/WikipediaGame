/**
 * File to get the hyperlinks from a current page. 
 */

import cheerio from 'cheerio'; 
import {sleep, isWikipediaTopic, getHTML, edit} from './utils';

// get the valid string 
export async function getHyperLinks(url, sleepTime = 1000): Promise<string[]> {

	let html; 
	
	await sleep(sleepTime); 

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
			const urlink = edit(href);
			if (isWikipediaTopic(urlink)) {
				console.log('URLINK : ' + urlink);
				links.push(urlink); 
			}
		}
	});

	console.log(`links.length: ${links.length}`);
	return links;
}
