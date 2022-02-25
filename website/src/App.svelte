
<script>
	import "smelte/src/tailwind.css" ;
	import {tick} from "svelte";
	import VirtualList from 'svelte-tiny-virtual-list';
	import StartPage from "./StartPage.svelte";
	import Choice from "./Choice.svelte";
	import End from "./End.svelte"; 
	import {moveTopic, getInfo, vlistConfig} from "./utils";
	import SearchField from "./SearchField.svelte"; 
	import ProgressLinear from "smelte/src/components/ProgressLinear";

	// main page, here
	// fix all these settings after
	let hasStarted = false; 
	let movesLeft; 
	let numMoves = movesLeft; 
	let currentTopic; 
	let startTopic;
	let endTopic;
	let items = []; 
	let gotChoices = false; 
	let scrollIndex;
	const MAX_DESCRIPTIONS = 300; 

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
				if (i >= MAX_DESCRIPTIONS) {
					items[i].description = "No available description."
					items[i].title = items[i].topic;
					items[i].image = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Wikipedia-logo-v2.svg/2244px-Wikipedia-logo-v2.svg.png';
					resolve(); 
				}
				else {
					getInfo(items[i].topic).then((info) => {
						const {topic} = items[i]; 
						items[i] = info; 
						items[i].topic = topic; 
						resolve(); 
					}); 
				}
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
	
	function updateScroll(e) {
		scrollIndex = e.detail.index;
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

<html lang="en" class="mode-dark min-h-screen"> 
	<body class="min-h-screen !min-w-screen"> 

	
		<header class="items-center flex font-sans shadow bg-primary-500"> 

			{#if hasStarted}
				<button class="ml-5" on:click={reset}> 
					<span class="material-icons"> arrow_back </span>
				</button>
			{/if}

			<h3 class="flex justify-center w-full items-center text-xl">Wikipedia Game</h3> 
			
			<a class="float-right mr-5" href="https://github.com/anish-lakkapragada/WikipediaGame">
				<img alt="Github Logo" src="https://smeltejs.com/github.png" class="w-6">
			</a>
		</header>


		{#if (currentTopic != null && currentTopic?.toUpperCase() == endTopic?.toUpperCase()) || (movesLeft == 0)}
			<!-- when u won or lost-->
			<End topic={currentTopic} moves={numMoves - movesLeft} won={currentTopic?.toUpperCase() == endTopic?.toUpperCase()} startingTopic={startTopic} endingTopic={endTopic} on:retry={reset}/>
		{/if}

		{#if !hasStarted} 
			<StartPage topicStart={startTopic} topicEnd={endTopic} on:start={startGame}/> 
		{/if}

		{#if hasStarted}
			<div class="font-sans flex"> 
				<div class="flex justify-center w-full items-center text-2xl mt-2">
					<span> {currentTopic} <span class="material-icons text-8xl"> arrow_right_alt </span> {endTopic} </span> 
				</div>
			</div>

			<div class="md:absolute top-12 font-sans sm:mt-4 md:mx-0 md:-mt-2 sm:mx-10 right-10">
				<SearchField on:search={updateScroll} items={items}></SearchField>
			</div>


			<h1 class="font-sans md:text-3xl sm:text-2xl mt-3 text-center"> You have <span class="font-bold"> {movesLeft} </span> {movesLeft != 1 ? "moves" : "move"} left! </h1>

			<div class="mx-10 mt-12"> 
				{#if gotChoices}
					<VirtualList
					width="100%"
					height={vlistConfig(window).height}
					itemCount={items.length}
					scrollToIndex={scrollIndex}
					scrollToAlignment="start"
					itemSize={vlistConfig(window).itemSize} 
					>
						<div slot="item" let:index let:style {style}>
							<Choice topic={items[index].topic} winningTopic={endTopic} image={items[index].image}
								description={items[index].description} title={items[index].title} on:move={movePosition}/>
							<hr> 	
						</div>
					</VirtualList>
					
					<footer class="font-sans text-center"> <hr> <br> © Anish Lakkapragada 2021 </footer>
				{/if}
				{#if !gotChoices}
					<div class="md:mb-44 sm:mb-33">
						<ProgressLinear color="primary"> </ProgressLinear>
					</div>

					<div class="md:pt-96 sm:pt-80">
						<ProgressLinear color="primary"> </ProgressLinear>
					</div>
				{/if}
			</div>
		{/if}
	</body>
</html>