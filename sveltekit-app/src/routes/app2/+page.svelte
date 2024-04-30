<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<script>
    export let data = [];
</script>

<h1>Employees</h1>

<ul>
{#each data.plants as employee}
    <li>{employee.PlantKey} {employee.Plant}</li>
{/each}
</ul>
