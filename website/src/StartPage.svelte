<script lang="ts"> 
    import "smelte/src/tailwind.css" ;
    import {TextField, Slider} from "smelte";
    import {isWikipediaTopic} from "./utils.js";
    import {createEventDispatcher, tick} from "svelte";
    let success = false; 
    let numTries = 10; 

    // initialize the janky stuff 
    let startColor, endColor; 
    let topicStart = null;
    let topicEnd = null;
    let startRender = true; 
    let endRender = true; 

    const validTopic = async (topic) => {
        if (topic == null) {
            return true; 
        }

        const isTopic = await isWikipediaTopic(topic); 
        if (!isTopic) {
            return false; 
        }

        return true; 
    }
    
    // stuff do be janky 
    const changeColor = async (topic, isStart) => {
        const isValid = await validTopic(topic);

        if (isValid) {
            if (isStart) {startColor="success";}
            else {endColor="success";}
        }

        
        else {
            if (isStart) {startColor="error";}
            else {endColor="error";}
        }


        if (isStart){
            startRender = false; 
        }

        else {
            endRender = false; 
        }



        await tick(); 

        startRender =true; 
        endRender = true;
    }


</script> 


<div class="text-center font-sans mx-20"> 
    <h1 class="text-5xl"> Wikipedia Game (By yourself!) </h1>
    <p class="text-2xl "> In the wikipedia game, you try to go from one article to another only using the hyperlinks on the page, as fast as you can. </p>

    {#if startRender}
        <TextField color={startColor} on:blur={() => {changeColor(topicStart, true)}} label="Starting Topic" bind:value={topicStart}/>  
    {/if}

    {#if endRender}
        <TextField color={endColor} on:blur={() => {changeColor(topicEnd, false)}} label="Ending Topic" bind:value={topicEnd}/>  
    {/if}
    
</div>


