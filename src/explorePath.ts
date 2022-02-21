/**
 * File to explore a certain URL however many times. 
 */

import { getHyperLinks} from './hyperlinks';

export interface ExploreResponse {
    lastURL: string, 
    depth: number,
    earlyTerminate: boolean,
    traversal: string[]
}

export async function explorePath(url: string, depth: number) : Promise<ExploreResponse>{
   
	const currentPath: string[] = []; 
	let curURL: string = url; 
	for (let i = 0; i < depth; i++) {
		const hyperlinks: string[] = await getHyperLinks(curURL);
		if (hyperlinks.length == 0) {
			return {lastURL: curURL, depth: i, earlyTerminate: true, traversal: currentPath};
		}

		curURL = hyperlinks[Math.floor(Math.random() * hyperlinks.length)];
		currentPath.push(curURL);
		console.log(i);
	}

	return {lastURL: curURL, depth: depth, earlyTerminate: false, traversal: currentPath};
}