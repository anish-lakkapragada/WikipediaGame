import express, {Application, Request, Response} from 'express';
import { explorePath, ExploreResponse } from './explorePath';
import { getHyperLinks } from './hyperlinks';
import { isWikipediaTopic } from './utils';
const app : Application = express(); 

app.get('/', async (req: Request, res : Response) => {
	res.send('dank');
}); 
    
app.get('/hyperlinks', async (req: Request, res: Response) => {
	console.log('submitting');
	const path: ExploreResponse = await explorePath('https://en.wikipedia.org/wiki/Country_risk', 50); 
	res.send(path);
});

app.get('/move', async (req, res) => {
	console.log(req.query.url);
	if (req.query && req.query.url && isWikipediaTopic(req.query.url as string)) {
		const links: string[] = await getHyperLinks(req.query.url);
		res.send(links);
		return;
	}

	res.send({'error': true});
}); 

app.listen(process.env.PORT || 5000, () => {console.log('server running');});