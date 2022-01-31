<script lang="ts"> 
    import "smelte/src/tailwind.css" ;
    //import {TextField, Slider} from "smelte";
    import {TextField} from "sozai";
    import {isWikipediaTopic} from "./utils.js";
    import {createEventDispatcher} from "svelte";
    const dispatcher = createEventDispatcher(); 
    let success = false; 
    let numTries = 10; 

    let startColor; 

    let tf = null; 

    let topicStart = null;
    let topicEnd = null;
    const isValid = async (topic, isStart, garb) => { 
        if (isStart) {
            startColor = "error"; 
        }
    }

    $: if (topicStart != null) {isValid(topicStart, true, startColor)}; 


</script> 

<html lang="en"> 
    <div class="text-center font-sans mx-20"> 
        <h1 class="text-5xl"> Wikipedia Game (By yourself!) </h1>
        <p class="text-2xl "> In the wikipedia game, you try to go from one article to another only using the hyperlinks on the page, as fast as you can. </p>

        <h2 class="text-xl"> Enter First Topic </h2>
        <TextField class=" " filled on:blur={() => {isValid(topicStart, true)}} bind:color={startColor} bind:value={topicStart} label="Starting Topic"  />  
        <TextField class="w-2" bind:value={topicEnd} label="Ending Topic" color="primary" />
    </div>
</html>


