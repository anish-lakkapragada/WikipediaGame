<script> 
    /** 
     * Create the card for each one of the options. 
    */

    import Card from "smelte/src/components/Card";
    import Button from "smelte/src/components/Button";
    import {createEventDispatcher} from "svelte";

    export let topic, winningTopic, description, title, image;   
    const dispatcher = createEventDispatcher();

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
</script> 


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
