import express, {Application, Request, Response} from 'express';
import { getHyperLinks } from './urls';

const app : Application = express(); 

app.get("/", async (req: Request, res : Response) => {
    res.send("dank");
}); 

app.get("/hyperlinks", async (req: Request, res: Response) => {
    const links = await getHyperLinks("https://en.wikipedia.org/wiki/Peren%E2%80%93Clement_index"); 
    console.log(links);
    res.send("nuttin"); 
})

app.listen(5000, () => {console.log("server running")});