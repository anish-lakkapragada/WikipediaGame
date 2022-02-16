
<script>
	import "smelte/src/tailwind.css" ;
	import {onMount, tick} from "svelte";
	import VirtualList from 'svelte-tiny-virtual-list';
	import StartPage from "./StartPage.svelte";
	import Choice from "./Choice.svelte";
	import {moveTopic, getInfo} from "./utils";
	import { ProgressCircular, ProgressLinear } from "smelte";
	import {TextField} from "smelte"; 
	import {AppBar} from "smelte";
	import Hamburger from 'svelte-hamburgers';

	let hasStarted = true; // todo change this 
	let movesLeft = 10; 
	let currentTopic = "Sports"; 
	let endTopic= "Calculus";
	let items = []; 
	let gotChoices = false; 
	let searchTopic; let scrollIndex; 
	const numBrs = 22; 

	const handleEvent = (event) => {
		const detail = event.detail; 
		movesLeft = detail.moves; 
		currentTopic = detail.startTopic; 
		endTopic = detail.endTopic;
		hasStarted = true; 
		gotChoices = false; 
	}	

	async function infoify() {
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

	if (hasStarted) {
		updateChoices(); 
	}

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

</script>



<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/svelte-hamburgers@3/dist/css/base.css" />

<AppBar class="h-22 mb-3 flex"> 
		<Hamburger class="float-left text-5xl "></Hamburger>
		<h3 class="text-center text-3xl"> Wikipedia Game </h3>
</AppBar>

{#if !hasStarted} 
	<StartPage on:start={handleEvent}/> 

{:else}
	<div class="font-sans text-center"> 
		<span class="text-2xl"> {currentTopic} <span class="material-icons text-8xl"> arrow_right_alt </span> {endTopic} </span>
	</div>


	<div class="mx-10"> 
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
		{:else}
			<div class="text-center">
				<ProgressLinear color="primary"> </ProgressLinear>
			</div>
			
			{#each createArray(numBrs/2) as i} 
				<br>
			{/each}

			<h1 class="text-center font-sans text-4xl"> Loading... </h1>
			
			{#each createArray(numBrs/2) as i} 
				<br>
			{/each}
			
			<ProgressLinear color="primary"> </ProgressLinear>
		{/if}
		
		<div class="border-t-2 border-black"> </div>
		<br>
	</div>

	<div class="mx-60 font-sans">
			<TextField disabled={!gotChoices} label="Search Topic" on:blur={scrollToTopic} bind:value={searchTopic} hint={"Search a topic to see if it is on this page."} persistentHint/>
	</div>
	<h1 class="font-sans text-3xl text-center"> You have <span class="font-bold"> {movesLeft} </span> moves left! </h1>
{/if}
