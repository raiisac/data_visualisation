<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>


<script>
    export let data = [];

	let address_to_coordinates_map = new Map();
	for (let i = 0; i < data.coordinates.length; i++) {
		address_to_coordinates_map.set(data.coordinates[i].address, [data.coordinates[i].latitude, data.coordinates[i].longitude]);
	}
	let address_to_coordinates_map_keys = Array.from(address_to_coordinates_map.keys());
</script>

<h1>Employees</h1>

<ul>
{#each data.plants as plant}
    <li>{plant.PlantKey} {plant.Plant}</li>
{/each}

{#each address_to_coordinates_map_keys as key}
    <li>{key} {address_to_coordinates_map.get(key)}</li>
{/each}
</ul>
