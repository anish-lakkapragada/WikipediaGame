import fetch from 'node-fetch';

function edit(hyperlink: string) : string {
	if (hyperlink.startsWith('/wiki/')) {
		return 'https:/en.wikipedia.org' + hyperlink;
	}

	return hyperlink;
}


// get the HTML in any page 
async function getHTML(url: string) {
	const resp = await fetch(url);
	const html = await resp.text();
	return html;
}

function isWikipediaTopic(hyperlink: string): boolean {
	const url = edit(hyperlink);
	if (url == null) {
		console.log('NELL FALSE: ' + url);
		return false; 
	}
    
	if (!url.startsWith('https:/en.wikipedia.org/wiki/')) {
		console.log('FALSE: ' + url);
		return false; 
	}

	const nonoTopics: string[] = ['Special', 'Wikipedia', 'File', 'Category', 'Help'];

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

const sleep = (ms : number) => new Promise(resolve => setTimeout(resolve, ms));

export {isWikipediaTopic, getHTML, sleep, edit};
