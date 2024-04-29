
<script>
	let possible_years = [2022, 2023, 2024]; // webpage with different input options https://svelte.dev/repl/3aca814fe08e49f08a42a7db3baed19a?version=3.29.4
	let chosen_year = [2022];
	let possible_plants = ["Antwerp", "Birmingham", "Göteborg", "Lyon", "Wrocław"];
	let chosen_plant = ["Antwerp"];
	let chosen_product = "EV Car Battery";
	export let data = []

	// load stuff for radar
	import { LayerCake, Svg } from 'layercake';
  	import { scaleLinear, scaleOrdinal  } from 'd3-scale';
	import Radar from '../../components/Radar.svelte';
	import AxisRadial from '../../components/AxisRadial.svelte';
	import Legend from "../../components/Legend.svelte";
	
	// colors for the legend
	const values = ["Antwerp", "Birmingham", "Göteborg", "Lyon", "Wrocław"];
	const ramp = [
    "#d9f0ca",
    "#67c4c5",
    "#3a95b8",
	"#2c54a0",
    "#00001d"];
	const columns = 1;
  	
	const seriesKey = 'plant';
  	const xKey = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const zKey = 'plant'; // for the (fill colors)
  	const seriesNames = Object.keys(data.sales[0]).filter(d => d !== seriesKey); 

  	data.sales.forEach(d => {
		seriesNames.forEach(name => {
			d[name] = +d[name];
		});
	});	//seriesNames = fastball,change,slider,cutter,curve
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
			<option>Antwerp DC</option>
			<option>Birmingham DC</option>
			<option>Göteborg DC</option>
			<option>Lyon DC</option>
			<option>Wrocław DC</option>
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

<div class="chart-container">
	<LayerCake
	  padding={{ top: 30, right: 0, bottom: 7, left: 0 }}
	  x={xKey}
	  z={zKey}
	  xDomain={[0, 20000]}
	  xRange={({ height }) => [0, height / 2]}
	  data = { data.sales }
	  zScale={scaleOrdinal()}
	  zRange={ramp}
	>
	<Svg>
		<AxisRadial/>
		<Radar/>
	</Svg>
</LayerCake>
</div>
<div style="width:100%; height: 100%; background-color:#eee;">
	<Legend
		title="SWE (inches)"
		{...{ ramp, values, columns}}
	/>
</div>


<style>
	/*
	  The wrapper div needs to have an explicit width and height in CSS.
	  It can also be a flexbox child or CSS grid element.
	  The point being it needs dimensions since the <LayerCake> element will
	  expand to fill it.
	*/
	.chart-container {
	  width: 250px;
	  height: 250px;
	  /*border: 10px red;
	  background-color: coral;
	  */
	}
</style>