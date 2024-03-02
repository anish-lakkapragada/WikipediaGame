# Wikipedia Game

> 🚧 Because of Heroku free-tier dying :(

### The Wikipedia Game is a game where you try to go from one page to another only using the hyperlinks on the page. 

This [project](https://anish-lakkapragada.github.io/WikipediaGame/) helps streamline this process by tracking how many moves you are taking to get to your end goal in a friendly interface. This game is also known as *wiki racing*. 

# How it works

When you choose the topic you want to start and the topic you want to end on, it sends a request to the backend to see all the hyperlinks on the wiki web page for the topic you want to start on. Then out of these topics you can move to (the hyperlinks), you choose one, and then it sends another request to the backend to find from this new topic which topics can you go to. And it keeps on doing that as you go from one topic to a next to see which topics you can move to. 

## Tech Stack

### Frontend
Frontend of the website was built with Svelte (similar framework to React.js). I also used UI libraries like Smelte (which uses Tailwind CSS.) Code is in the `website` folder. 

## Backend
Created a backend (deployed on Heroku) in TypeScript with NodeJS express to scrape the given wikipedia topic page to get all the hyperlinks available. Code is in the `src` folder. 

