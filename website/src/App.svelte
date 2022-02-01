
<script>
	import "smelte/src/tailwind.css" ;
	import StartPage from "./StartPage.svelte";
	import {moveTopic} from "./utils";
	import {Card} from "smelte";

	let hasStarted = true; // todo change this 
	let movesLeft = 10; 
	let currentTopic = "Calculus"; 
	let endTopic = "Algebra"; 
	const handleEvent = (event) => {
		const detail = event.detail; 
		movesLeft = detail.moves; 
		currentTopic = detail.topicStart; 
		endTopic = detail.topicEnd;
		hasStarted = true; 
	}

	moveTopic("Calculus");

</script>

<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

{#if !hasStarted} 
	<StartPage on:start={handleEvent}/> 
{/if}

{#if hasStarted} 
	<div class="font-sans text-center"> 
		<h1 class="text-center text-5xl"> Wikipedia Game (By yourself!) </h1>
		<span class="text-3xl"> {currentTopic} <span class="material-icons text-8xl"> arrow_right_alt </span> {endTopic} </span>
	</div>

	<Card.Title
			title="The three little kittens"
			subheader="A kitten poem"
			avatar="https://placekitten.com/64/64"
	/>
{/if}
