<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>


<script>
    export let data = [];
</script>

<h1>Employees</h1>

<ul>
{#each data.plants as plant}
    <li>{plant.PlantKey} {plant.Plant}</li>
{/each}
</ul>
