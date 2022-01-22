import express, {Application, Request, Response} from 'express';
import { getHyperLinks } from './urls';

const app : Application = express(); 

app.get("/", async (req: Request, res : Response) => {
    res.send("dank");
}); 

app.get("/hyperlinks", (req: Request, res: Response) => {
    getHyperLinks("http://books.toscrape.com/catalogue/libertarianism-for-beginners_982/index.html"); 
    res.send("nuttin"); 
})

app.listen(5000, () => {console.log("server running")});