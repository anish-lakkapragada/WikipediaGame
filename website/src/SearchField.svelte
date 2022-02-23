<script> 
    import TextField from "smelte/src/components/TextField"; 
    import {createEventDispatcher, tick} from "svelte"; 
    export let items; 
    let searchTopic; 
    let render = true; 
    let color = "primary"; 
    let hint = "No topic searched.";
    const dispatcher = createEventDispatcher(); 
    
    async function search() {

        let index = null;
        for (let i =0; i < items.length; i++) {
			const item = items[i]; 
			if (item?.title.toUpperCase() == searchTopic.toUpperCase()) {
				index = i; break; 
			}
		}

        if (searchTopic?.length < 1 || searchTopic == null) {
            color="primary";
            index = null; 
            hint = "No topic searched.";
        }

        else if (index == null) {
            color = "error"; 
            hint=`${searchTopic} was not found.`;
        }

        else {
            color="success";
            hint=`${searchTopic} was found.`
        }

        dispatcher("search", {
            index: index
        }); 

        render = false; 
        await tick();
        render = true; 
    }
    

</script> 

{#if render} 

    <TextField label="Search Topic" color={color} on:blur={search} bind:value={searchTopic}/>
    <p class={"font-sans text-center text-sm  -mt-4 " + `text-${color}-300`}> {hint} </p>
{/if}