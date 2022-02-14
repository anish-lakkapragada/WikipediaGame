<script> 
    /** 
     * Create the card for each one of the options. 
    */

    import Card from "smelte/src/components/Card";
    import Button from "smelte/src/components/Button";
    import {getInfo} from "./utils";
    import {createEventDispatcher} from "svelte";

    export let topic, winningTopic;   
    const dispatcher = createEventDispatcher();

    let renderNow = false; 
    let description; 
    let image; 
    let title; 

    async function moreInfo() {
        const info = await getInfo(topic); 
        description = info.description; image = info.image;
        if (description?.length <= 1) {
            description = "No description available."; 
        }
        title = info.title; 
        renderNow = true; 
    }

    function getColor(title) {
        if (title.toUpperCase() == winningTopic.toUpperCase()) {
            return "success"; 
        } else {
            return "secondary"; 
        }
    }

    function handleMove() {
        // move to this topic 
        dispatcher("move", {
            topic: topic, 
            title: title
        });
    }

    moreInfo(); 

</script> 
{#if renderNow}
    <div class="font-sans"> 
        <Card.Card hoverElevation={20}> 
            <Card.Title
                title={title}
                subheader={description}
                avatar={image}
            />

            <div class="p-2">
                <!-- color needed. -->
                <Button color={getColor(title)} text on:click={handleMove}>Go Here </Button>
            </div>
        </Card.Card>
    </div>
{/if}
