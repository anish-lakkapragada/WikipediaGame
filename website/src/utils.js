function edit(hyperlink) {
	if (hyperlink.startsWith('/wiki/')) {
		return 'https:/en.wikipedia.org' + hyperlink;
	}

	else if (!hyperlink.startsWith('http')) {
		return 'https://en.wikipedia.org/wiki/' + hyperlink;
	}

	return hyperlink;
}
const apiEndpoint = 'https://wiki-connection.herokuapp.com/'; 
export async function moveTopic(topic) {
	if (!isWikipediaTopic(topic)) {
		return []; // should never happen 
	}

	const url = edit(topic); 
	const response = await fetch(apiEndpoint + 'move?url=' + url, {mode: 'cors', headers: {'Access-Control-Allow-Origin': '*'}});
	console.log(response);
	const hyperlinks = Array.from(await response.json());
	const topics = []; 
	const existingTopics = []; 
	for (const hyperlink of hyperlinks) {
		const topic = hyperlink.slice(hyperlink.lastIndexOf('/') + 1);
		if (existingTopics.includes(topic)) {continue;}
		if (topic.includes('disambiguation')) {continue;}
		existingTopics.push(topic);
		topics.push({'topic': topic, url : hyperlink}); 
	}
	
	console.log('thesse topics'); 
	console.log(topics);

	return topics; 
}

export async function isWikipediaTopic(topic) {
	const url = edit(topic);

	if (url == null) {
		console.log('NELL FALSE: ' + url);
		return false; 
	}

	const resp = await fetch(`https://en.wikipedia.org/w/api.php?action=query&titles=${topic}&format=json&origin=*`);
	const data = await resp.json(); 
	if (data.query?.pages[-1] != undefined) {
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

export async function getInfo(topic) {
	const wikiLogoUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/2244px-Wikipedia-logo-v2.svg.png';

	// returns the description and image (if possible)
	const resp = await fetch('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts|pageimages&exintro&exsentences=1&explaintext&titles=' + topic + '&origin=*'); 
	const data = await resp.json();
	let title = data.query?.pages[Object.keys(data.query?.pages)[0]].title; 
	if (title == undefined) {title = topic;}

	if (data.query?.pages[-1] != undefined) {
		return {title: title, description: null, image: wikiLogoUrl};
	}

	let description = data.query?.pages[Object.keys(data.query?.pages)[0]].extract;
	if (description?.length > 200) {
		description = description.slice(0, 200) + '...';
	}
	
	else if (description?.length <= 1) {
		description = 'No description available.';
	}

	const image = data.query?.pages[Object.keys(data.query?.pages)[0]]?.thumbnail?.source ||  wikiLogoUrl;

	return {title: title, description: description, image: image};
}

