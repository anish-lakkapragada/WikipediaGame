
<script>
	import "smelte/src/tailwind.css" ;
	import {tick} from "svelte";
	import VirtualList from 'svelte-tiny-virtual-list';
	import StartPage from "./StartPage.svelte";
	import Choice from "./Choice.svelte";
	import End from "./End.svelte"; 
	import {moveTopic, getInfo} from "./utils";
	import AppBar from "smelte/src/components/AppBar";
	import TextField from "./TextField.svelte";
	import ProgressLinear from "smelte/src/components/ProgressLinear";

	// fix all these settings after
	let hasStarted = false;
	let movesLeft; 
	let numMoves = movesLeft; 
	let currentTopic = null; 
	let startTopic = null;
	let endTopic= null;
	let items = []; 
	let gotChoices = false; 
	let searchTopic; let scrollIndex;
	const numBrs = 22; 

	const startGame = (event) => {
		const detail = event.detail; 
		movesLeft = detail.moves; 
		numMoves = movesLeft; 
		currentTopic = detail.startTopic; 
		startTopic = currentTopic; 
		endTopic = detail.endTopic;
		hasStarted = false; // wake up call
		hasStarted = true; 
		gotChoices = false; 
	}	


	async function infoify() {
		console.log(currentTopic); 
		console.log("getting info");
		const promises = []; 
		for (let i = 0; i < items.length; i++) {
			promises.push(new Promise((resolve) => {
				getInfo(items[i].topic).then((info) => {
					const {topic} = items[i]; 
					items[i] = info; 
					items[i].topic = topic; 
					resolve(); 
				}); 
			})); 
		}
		
		await Promise.all(promises);

	}
	async function updateChoices() {
		items = [...await moveTopic(currentTopic)]; 
		await infoify(); 
		gotChoices = false;
		await tick();  
		gotChoices = true; 
		console.log("got the data");
		console.log(items);
	}
	
	function scrollToTopic() {
		// goes to the selected searchTopic
		for (let i =0; i < items.length; i++) {
			const item = items[i]; 
			if (item.title.toUpperCase() == searchTopic.toUpperCase()) {
				scrollIndex = i; break; 
			}
		}
	}

	$: if (hasStarted) {updateChoices();}

	if (gotChoices) {
		for (const item of items) {
			console.log(item.topic);
		}
	}

	const movePosition = (e) => {
		gotChoices = false;
		const {topic, title} = e.detail; 
		currentTopic = title; // get the nice title;
		movesLeft--; 
		updateChoices(); 
		console.log("updating!"); 
	}

	const createArray = (num) => {
		let arr = []; 
		for (let i = 0; i < num; i++) {
			arr.push(i); 
		}
		return arr; 
	}

	const reset =  () => {
		hasStarted = false;
		gotChoices = false; 
		currentTopic = null;  
		movesLeft = 10; 
	}

</script>



<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/svelte-hamburgers@3/dist/css/base.css" />

<header class="items-center flex font-sans shadow bg-primary-300 dark:bg-dark-600"> 

	{#if hasStarted}
		<button class="ml-5" on:click={reset}> 
			<span class="material-icons"> arrow_back </span>
		</button>
	{/if}

	<h3 class="flex justify-center w-full items-center text-xl">Wikipedia Game</h3> 
	
	<a class="float-right mr-5" href="https://github.com/anish-lakkapragada">
		<img alt="Github Logo" src="https://smeltejs.com/github.png" class="w-6">
	</a>
</header>


{#if (currentTopic != null && currentTopic?.toUpperCase() == endTopic?.toUpperCase()) || (movesLeft == 0)}
	<!-- when u won or lost-->
	<End topic={currentTopic} moves={numMoves - movesLeft} won={currentTopic?.toUpperCase() == endTopic?.toUpperCase()} on:retry={reset}/>
{/if}

{#if !hasStarted} 
	<StartPage topicStart={startTopic} topicEnd={endTopic} on:start={startGame}/> 
{/if}
{#if hasStarted}
	<div class="font-sans text-center flex justify-center items-center w-full mt-2"> 
		<span class="text-2xl"> {currentTopic} <span class="material-icons text-8xl"> arrow_right_alt </span> {endTopic} </span>
	</div>

	<div class="mx-10 -mt-3.5"> 
		<br> 
		<div class="border-b-2 border-black"> </div>
		{#if gotChoices}
			<VirtualList
			width="100%"
			height={600}
			itemCount={items.length}
			scrollToIndex={scrollIndex}
			scrollToAlignment="start"
			itemSize={150} 
			>
				<div slot="item" let:index let:style {style}>
					<Choice topic={items[index].topic} winningTopic={endTopic} image={items[index].image}
						description={items[index].description} title={items[index].title} on:move={movePosition}/>
			</div>
			</VirtualList>
		{/if}
		{#if !gotChoices}
			<div class="text-center">
				<ProgressLinear color="primary"> </ProgressLinear>
			</div>
			
			{#each createArray(numBrs/2) as i} 
				<br>
			{/each}


			{#each createArray(numBrs/2) as i} 
				<br>
			{/each}
			
			<ProgressLinear color="primary"> </ProgressLinear>
		{/if}
		
		<div class="border-t-2 border-black"> </div>
		<br>
	</div>

	<div class="mx-60 font-sans">
			<TextField disabled={!gotChoices} label="Search Topic" on:blur={scrollToTopic} bind:value={searchTopic}/>	
	</div>
	<h1 class="font-sans text-3xl text-center"> You have <span class="font-bold"> {movesLeft} </span> moves left! </h1>
{/if}