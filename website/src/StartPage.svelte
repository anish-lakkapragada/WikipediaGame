<script lang="ts"> 
    import "smelte/src/tailwind.css" ;
    import {TextField, Slider} from "smelte";
    import {isWikipediaTopic} from "./utils.js";
    import {createEventDispatcher} from "svelte";
    const dispatcher = createEventDispatcher(); 
    let success = false; 
    let numTries = 10; 

    let startColor = "primary"; 

    let topicStart = null;
    let topicEnd = null;
    const isValid = (topic, color) => {

        if (topic == null) {
            startColor = "primary";
            return;
        }

        const isTopic = isWikipediaTopic(topic);
        if (isTopic) {
            startColor = "success"; 
            return;
        }

        startColor = "error";
        console.log(startColor);
    }

    async function checkityCheck() {
        const x = await isWikipediaTopic("Caldwaculus");
        console.log(x);
        console.log("dwada");
    }

    checkityCheck();

</script> 

<html lang="en"> 
    <div class="text-center font-sans mx-20"> 
        <h1 class="text-5xl"> Wikipedia Game (By yourself!) </h1>
        <p class="text-2xl "> In the wikipedia game, you try to go from one article to another only using the hyperlinks on the page, as fast as you can. </p>

        <h2 class="text-xl"> Enter First Topic </h2>
        <TextField class=" " on:blur={() => {isValid(topicStart, startColor)}} color={startColor} bind:value={topicStart} label="Starting Topic"  />  
        <TextField class="w-2" bind:value={topicEnd} label="Ending Topic" color="primary" />
        <Slider label={`Number of Moves: ${numTries}`} min="1" max="50" bind:value={numTries} color="secondary"/> 
    </div>
</html>


