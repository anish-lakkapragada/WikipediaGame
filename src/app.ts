import express, {Application, Request, Response} from 'express';
import { explorePath, ExploreResponse } from './explorePath';
import { getHyperLinks } from './hyperlinks';
import { isWikipediaTopic } from './utils';
import cors from 'cors'; 
const app : Application = express(); 

/*app.use(cors({
    origin: '*'
}));*/

app.get('/', async (req: Request, res : Response) => {
	res.append('Access-Control-Allow-Origin', '*');
	res.send('dank');
}); 

/*
 Don't actually call this. 
*/
app.get('/hyperlinks', async (req: Request, res: Response) => {
	res.append('Access-Control-Allow-Origin', '*');
	console.log('submitting');
	const path: ExploreResponse = await explorePath('https://en.wikipedia.org/wiki/Country_risk', 50); 
	res.send(path);
});


app.get('/move', async (req, res) => {
	console.log(req.query.url);
	const isTopic = await isWikipediaTopic(req.query.url as string);
	if (req.query && req.query.url && isTopic) {
		const links: string[] = await getHyperLinks(req.query.url);
		res.append('Access-Control-Allow-Origin', '*');
		res.send(links);
		return;
	}

	res.send({'error': true});
}); 

app.listen(process.env.PORT || 3000, () => {console.log('server running');});