import express, {Application, Request, Response} from 'express';
import { explorePath, ExploreResponse } from './explorePath';
const app : Application = express(); 

app.get('/', async (req: Request, res : Response) => {
	res.send('dank');
}); 
    
app.get('/hyperlinks', async (req: Request, res: Response) => {
	console.log('submitting');
	const path: ExploreResponse = await explorePath('https://en.wikipedia.org/wiki/Country_risk', 50); 
	res.send(path);
});

app.listen(5000, () => {console.log('server running');});