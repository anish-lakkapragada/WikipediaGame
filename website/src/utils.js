function edit(hyperlink) {
	if (hyperlink.startsWith('/wiki/')) {
		return 'https:/en.wikipedia.org' + hyperlink;
	}

	else if (!hyperlink.startsWith('http')) {
		return 'https://en.wikipedia.org/wiki/' + hyperlink;
	}

	return hyperlink;
}


// get the HTML in any page 
async function getHTML(url) {
	const resp = await fetch(url);
	const html = await resp.text();
	return html;
}

const apiEndpoint = "https://wiki-connection.herokuapp.com/"; 
export async function moveTopic(topic) {
	if (!isWikipediaTopic(topic)) {
		return []; // should never happen 
	}

	const url = edit(topic); 
	const response = await fetch(apiEndpoint + "move?url=" + url, {headers: {'Access-Control-Allow-Origin': '*'}});
	console.log(response);
	const hyperlinks = await response.json();
	console.log(hyperlinks);
}

export async function isWikipediaTopic(topic) {
	const url = edit(topic);

	if (url == null) {
		console.log('NELL FALSE: ' + url);
		return false; 
	}

	const resp = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${topic}&format=json&origin=*`);
	const data = await resp.json(); 
	if (data.query.pages[-1] != undefined) {
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

