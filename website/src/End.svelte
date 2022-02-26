<script> 
    import "smelte/src/tailwind.css" ;
    import Button from "smelte/src/components/Button"; 
    import Dialog from "smelte/src/components/Dialog";
    import { createEventDispatcher } from "svelte";

    const dispatcher = createEventDispatcher(); 

    export let won; // did they win? 
    export let moves; // how many moves did it take them 
    export let startingTopic; 
    export let endingTopic; 

    let tru = true; 
    function retryGame() {
        dispatcher("retry"); 
    }

    function color(won) {
        if (won) {
            return " text-success-500";
        }

        return " text-error-700";
    }
</script> 

<Dialog bind:value={tru}>
        <h1 class={"text-2xl font-sans text-center" + color(won)} slot="title"> 
            <strong> {won ? "You won!" : "You lost!"} </strong>
        </h1>

        <h3 class="font-sans text-base text-center -mt-1 mb-3"> You used <strong> {moves} </strong>  {moves != 1 ? "moves": "move"}, {won ? "to win." : "but you still lost."} </h3>
        <h3 class="font-sans text-base text-center -mt-1 mb-6">You {won ? "went" : "tried to go"} from <strong> {startingTopic}</strong> to <strong> {endingTopic}</strong>.</h3>
        <div class="text-center">
            <Button on:click={retryGame} flat class="text-xl font-sans"> Play Again! </Button>
        </div>

        <div class="text-center ml-auto mr-auto w-32">
            <iframe class="mt-4" src="https://ghbtns.com/github-btn.html?user=anish-lakkapragada&repo=WikipediaGame&type=star&count=true&size=large" frameborder="0" scrolling="0" width="170" height="50" title="GitHub"></iframe>
        </div>
</Dialog>