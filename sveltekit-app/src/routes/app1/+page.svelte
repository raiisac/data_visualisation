
<script>
	let possible_years = [2022, 2023, 2024]; // webpage with different input options https://svelte.dev/repl/3aca814fe08e49f08a42a7db3baed19a?version=3.29.4
	let chosen_year = [2022];
	let possible_plants = ["Antwerp", "Birmingham", "Göteborg", "Lyon", "Wroclaw"];
	let chosen_plant = ["Antwerp"];
	let chosen_product = "EV Car Battery";
</script>
<svelte:head>
	<title>About</title>
	<meta name="description" content="About this app" />
</svelte:head>

<div class="text-column">
	<h1>SunCharge sales</h1>

	<p>
		This app describes the SunCharge's sales over time. 
	</p>
	<fieldset>
		<legend>Choose a year: {chosen_year}</legend>
		{#each possible_years as year}
		<label>
			<input type="checkbox" value={year} bind:group={chosen_year} />
			{year}
		</label>
		{/each}
	</fieldset>

	<fieldset>
		<legend>Choose a distribution center: {chosen_plant}</legend>
		Select multiple with <strong>ctrl</strong>
		<br />
		<select multiple bind:value={chosen_plant}>
			<option disabled value="">Please select one!</option>
			<option>Antwerp</option>
			<option>Birmingham</option>
			<option>Göteborg</option>
			<option>Lyon</option>
			<option>Wroclaw</option>
		</select>
	</fieldset>
	<fieldset>
		<legend>Choose a product: {chosen_product}</legend>
  <label>
		<input type="radio" value="EV Car Battery" bind:group={chosen_product} /> EV Car Battery
	</label>
	<label>
		<input type="radio" value="Home Battery" bind:group={chosen_product} /> Home Battery
	</label>
	</fieldset>
</div>
