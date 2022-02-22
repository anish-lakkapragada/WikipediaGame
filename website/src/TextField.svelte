<script> 
    export let label;
</script> 


<div class="mt-2 mb-6 relative text-gray-600 dark:text-gray-100">
    <label class="pt-4 absolute top-0 label-transition block pb-2 px-4 pointer-events-none cursor-text" bgcolor="white">Starting Topic</label> 
    <input aria-label={label} class="pb-2 pt-6 px-4 rounded-t text-black dark:text-gray-100 w-full caret-primary-500   bg-gray-100 dark:bg-dark-600 " placeholder="">   
    <div class="line absolute bottom-0 left-0 w-full bg-gray-600">
        <div class="mx-auto w-0" style="height: 2px; transition: width 0.2s ease 0s;"></div>
    </div> 
</div>