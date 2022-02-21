<script> 
    import "smelte/src/tailwind.css" ;
    import {TextField, Slider, Button} from "smelte";
    import {isWikipediaTopic} from "./utils.js"; 
    import {createEventDispatcher, tick} from "svelte";
    
    export let topicStart; 
    export let topicEnd; 
    
    let numTries = 10;  

    // initialize the janky stuff 
    const dispatch = createEventDispatcher(); 
    let startColor, endColor; 
    let startRender = true; 
    let endRender = true;
    let startError; 
    let endError; 

    const alertView = () => {
        console.log("In here");
        dispatch("start", {
            startTopic: topicStart,
            endTopic: topicEnd, 
            moves: numTries
        })
        console.log("sent message");
    }


    const validTopic = async (topic) => {
        if (topic == null || topic.length == 0) {
            return null; 
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
        
        if (isValid == null) {
            if (isStart) {startColor="primary";}
            else {endColor="primary";}           
        }

        else if (isValid == true) {
            if (isStart) {startColor="success"; startError = false;}
            else {
                endColor="success"; 
                endError = false;
            }
        }

        else {
            if (isStart) {startColor="error"; topicStart = "Must be a valid Wikipedia topic";}
            else {endColor="error"; topicEnd = "Must be a valid Wikipedia topic";}
        }

        if (isStart){
            startRender = false; 
        }

        else {
            endRender = false; 
        }

        console.log(endError); 
        console.log(startError);

        await tick(); 

        startRender =true; 
        endRender = true;
    }   

    const isReady = (color1, color2) => {
        return color1 == color2 && color1 == 'success'; 
    }
    
    changeColor(topicStart, true);
    changeColor(topicEnd, false);

</script> 


<div class="text-center font-sans mx-20 mt-4"> 
    <p class="text-2xl "> In the wikipedia game, you try to go from one article to another only using the hyperlinks on the page, as fast as you can. </p>

    {#if startRender}
        <TextField color={startColor} on:blur={() => {changeColor(topicStart, true)}} label="Starting Topic" bind:value={topicStart} error={startError}/>  
    {/if}

    {#if endRender}
        <TextField color={endColor} on:blur={() => {changeColor(topicEnd, false)}} label="Ending Topic" bind:value={topicEnd} error={endError}/>  
    {/if}
    
    <Slider color="secondary" min="1" max="50" bind:value={numTries} label={`Number of Moves: ${numTries}`} />
    <br> 
    <br> 

    <Button on:click={alertView} class={isReady(startColor, endColor) ? 'opacity-100': 'opacity-90'} disabled={!isReady(startColor, endColor)} block color="success"> Start </Button>  


</div>


