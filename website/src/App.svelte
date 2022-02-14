
<script>
	import "smelte/src/tailwind.css" ;
	import {onMount, tick} from "svelte";
	import VirtualList from 'svelte-tiny-virtual-list';
	import {ProgressCircular} from "smelte";
	import StartPage from "./StartPage.svelte";
	import Choice from "./Choice.svelte";
	import {moveTopic} from "./utils";

	let hasStarted = true; // todo change this 
	let movesLeft = 10; 
	let currentTopic = "Sports"; 
	let endTopic= "Calculus";
	let items = []; 
	let gotChoices = false; 

	const handleEvent = (event) => {
		const detail = event.detail; 
		movesLeft = detail.moves; 
		currentTopic = detail.startTopic; 
		endTopic = detail.endTopic;
		hasStarted = true; 
		gotChoices = true; 
	}	

	async function updateChoices() {
		items = [...await moveTopic(currentTopic)];
		gotChoices = false;
		await tick();  
		gotChoices = true; 
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

	const movePosition = (e) => {
		const {topic, title} = e.detail; 
		currentTopic = title; // get the nice title;
		movesLeft--; 
		updateChoices(); 
		console.log("updating!"); 
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
		<br> 
		<div class="border-b-2 border-black"> </div>
		<VirtualList
		width="100%"
		height={600}
		itemCount={items.length}
		itemSize={150} 
		>
			<div slot="item" let:index let:style {style}>
				<Choice topic={items[index].topic} winningTopic={endTopic} on:move={movePosition}/>
		  </div>
		</VirtualList>
		<div class="border-t-2 border-black"> </div>
		<br>

	{:else}
		<ProgressCircular> </ProgressCircular>
	{/if}


	<h1 class="font-sans text-3xl text-center"> You have <span class="font-bold"> {movesLeft} </span> moves left! </h1>
{/if}
