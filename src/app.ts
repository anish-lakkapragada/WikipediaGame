import express, {Application, Request, Response} from 'express';
import { explorePath, ExploreResponse } from './explorePath';
import { getHyperLinks } from './hyperlinks';
import { isWikipediaTopic } from './utils';
import cors from 'cors'; 
import cheerio from "cheerio"; 
import fetch from "node-fetch"; 
const app : Application = express(); 

app.use(cors({
    origin: '*'
}));

app.get('/', async (req: Request, res : Response) => {
	res.send('dank');
}); 

/*
 Don't actually call this. 
*/
app.get('/hyperlinks', async (req: Request, res: Response) => {
	console.log('submitting');
	const path: ExploreResponse = await explorePath('https://en.wikipedia.org/wiki/Country_risk', 50); 
	res.send(path);
});


app.get('/move', async (req, res) => {
	console.log(req.query.url);
	const isTopic = await isWikipediaTopic(req.query.url as string);
	if (req.query && req.query.url && isTopic) {
		const links: any = await getHyperLinks(req.query.url);
		res.send(links);
		return;
	}

	res.send({'error': true});
}); 


app.get('/thumbnail', async (req, res) => {
	const topic = req.query.topic as string; 
	// gives the thumbnail (if any)
	console.log(topic);
	//https://en.wikipedia.org/w/api.php?action=query&titles=racing&prop=pageimages&format=json
	const response = await fetch(`https://en.wikipedia.org/wiki/${topic}`);
	const html = await response.text();
	const $ = cheerio.load(html);

	let thumbnail : any = null; 
	$("meta").map((i, el) => {
		const property = $(el).attr('property');
		if (property === 'og:image') {
			thumbnail = $(el).attr('content');
		}
	});  

	res.send({thumbnail: thumbnail});
});


app.listen(process.env.PORT || 3000, () => {console.log('server running')});