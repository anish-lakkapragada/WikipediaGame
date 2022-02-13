
<script>
	import "smelte/src/tailwind.css" ;
	
	//import VirtualList from '@sveltejs/svelte-virtual-list';
	//import VirtualScroll from "svelte-virtual-scroll-list"
	import VirtualList from 'svelte-tiny-virtual-list';

	import StartPage from "./StartPage.svelte";
	import Choice from "./Choice.svelte";
	import {moveTopic} from "./utils";
	import "std:virtual-scroller";

	let hasStarted = true; // todo change this 
	let movesLeft = 10; 
	let currentTopic = "Calculus"; 
	let endTopic= "Mathematics";
	let items = []; 
	let gotChoices = true; 

	const handleEvent = (event) => {
		const detail = event.detail; 
		movesLeft = detail.moves; 
		currentTopic = detail.startTopic; 
		endTopic = detail.endTopic;
		hasStarted = true; 
		gotChoices = true; 
	}	

	let curHyperlinks = []; 

	async function updateChoices() {
		items = [...items, ...await moveTopic(currentTopic)];
		console.log(items);
	}	

	if (hasStarted) {
		updateChoices(); 
	}

	if (gotChoices) {
		for (const item of items) {
			console.log(item.topic);
		}
	}

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

	{#if gotChoices}
		<VirtualList
		width="100%"
		height={600}
		itemCount={items.length}
		itemSize={50}>
			<div slot="item" let:index let:style {style}>
				<Choice topic={items[index].topic}/>
		  </div>
		</VirtualList>
	{/if}
{/if}
