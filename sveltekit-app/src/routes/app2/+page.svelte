<script>
	import { json, geoTransform, geoPath } from 'd3';

	// data access
	export let data = [];

	// code for world map
	let width = 100;
	let height = 100;
	$: usedWidth = width - 100;
	$: usedHeight = height - 50;
	$: scaleFactor = 1;
	let scaleFactorIncrement = 0.2;
	$: translateX = 100;
	$: translateY = 0;

	$: originTranslateX = 0;
	$: originTranslateY = 0;
	$: originXMouseDown = 0;
	$: originYMouseDown = 0;


	let geojsonPath = "http://localhost:5173/europe.geojson"
	let geojson;
	json(geojsonPath).then((data) => geojson = data);

	const minLon = -24.542225;
	const maxLon = 50.37499;
	const minLat = 29.486706;
	const maxLat = 71.154709;
	
	$: rescale_lon = function(longitude, givenWidth) {
		// console.log(width);
		let range_min = 0;
		let range_max = givenWidth;
      	return (((range_max - range_min)*(longitude-minLon))/(maxLon-minLon)) + range_min
  	}

	$: rescale_lat = function(latitude, givenHeight) {
		let range_min = givenHeight;
		let range_max = 0;
      	return (((range_max - range_min)*(latitude-minLat))/(maxLat-minLat)) + range_min
  	}

	$: projection = geoTransform({
      point: function(x, y) {
          this.stream.point(rescale_lon(x, usedWidth), rescale_lat(y, usedHeight));
      }
    });
	$: pathGenerator = geoPath(projection);

	let countries = []
	$: if (geojson) countries = geojson.features.map(feature => {
		return {
			...feature,
			path: pathGenerator(feature)
		};
	});

	// code to get coordinates from city + country
	let address_to_coordinates_map = new Map();
	for (let i = 0; i < data.coordinates.length; i++) {
		address_to_coordinates_map.set(data.coordinates[i].address, [data.coordinates[i].longitude, data.coordinates[i].latitude]);
	}
	let address_to_coordinates_map_keys = Array.from(address_to_coordinates_map.keys());

	// code to get country to plant map
	let countryToPlantKeyMap = new Map();
	for (let i = 0; i < data.customerPlant.length; i++) {
		countryToPlantKeyMap.set(data.customerPlant[i].CustomerCountry, data.customerPlant[i].PlantKey);
	}

	// code to get coordinates from customerKey
	let customerKeyToLonLat = new Map();
	for (let i = 0; i < data.customers.length; i++) {
		let lonLat = address_to_coordinates_map.get(data.customers[i].CustomerCity + " " + data.customers[i].CustomerCountry);
		customerKeyToLonLat.set(data.customers[i].CustomerKey, lonLat);
	}

	$: changeScaleFactor = function(increase) {
		scaleFactor = Math.min(4, Math.max(1, scaleFactor + increase));
		console.log(scaleFactor);
	}

	function onMouseMove (event) {
		translateX = originTranslateX + ((event.clientX - originXMouseDown) / scaleFactor);
		translateY = originTranslateY + ((event.clientY - originYMouseDown) / scaleFactor);
  	}

	function onMouseDown (event) {
		originTranslateX = translateX;
		originTranslateY = translateY;
		originXMouseDown = event.clientX;
		originYMouseDown = event.clientY;
		addEventListener('mousemove', onMouseMove);
		addEventListener('mouseup', onMouseUp);
	}

	function onMouseUp () {
		removeEventListener('mousemove', onMouseMove);
		removeEventListener('mouseup', onMouseUp);
	}

</script>


<main bind:clientWidth={width} bind:clientHeight={height}>

	<body>
	<div id="map settings">
		<button on:click={changeScaleFactor(-scaleFactorIncrement)}>-</button>
		<button on:click={changeScaleFactor(scaleFactorIncrement)}>+</button>
	</div>
	</body>
	
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<svg width={usedWidth} height={usedHeight} style="border:1px solid black" on:mousedown={onMouseDown}>
		<g transform={"scale (" + String(scaleFactor) + ")"}>
		<g transform={"translate(" + String(translateX) + "," + String(translateY) + ")"}>
		

		{#each countries as country}
			<path class=country d={country.path}/>
		{/each}
		
		{#each data.customers as customer}

		<path
			class={"c" + countryToPlantKeyMap.get(customer.CustomerCountry)}
			d={"M " + String(rescale_lon(address_to_coordinates_map.get(customer.CustomerCity + " " + customer.CustomerCountry)[0], usedWidth)) + " " + String(rescale_lat(address_to_coordinates_map.get(customer.CustomerCity + " " + customer.CustomerCountry)[1], usedHeight)) + " l 0.0001 0"}
		/>

		<path
			class="defaultCustomer"
			d={"M " + String(rescale_lon(address_to_coordinates_map.get(customer.CustomerCity + " " + customer.CustomerCountry)[0], usedWidth)) + " " + String(rescale_lat(address_to_coordinates_map.get(customer.CustomerCity + " " + customer.CustomerCountry)[1], usedHeight)) + " l 0.0001 0"}
		/>
		{/each}
		

		{#each data.plants as plant}
		
		<circle	class={"p" + plant.PlantKey}
				cx={rescale_lon(address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[0], usedWidth)} 
				cy={rescale_lat(address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[1], usedHeight)} 
				/>
		<path
		class={"p" + plant.PlantKey}
		d={"M " + String(rescale_lon(address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[0], usedWidth)) + " " + String(rescale_lat(address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[1], usedHeight)) + " l 0.0001 0"}
		/>
		{/each}
		</g>
		</g>
	</svg>
</main>




<ul>
	{#each data.plants as plant}
		<li> {plant.PlantKey} {plant.Plant}</li>
		<li> {plant.PlantCity + " " + plant.PlantCountry} </li>
		<li> {address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[0]} {rescale_lon(address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[0], usedWidth)} </li>
		<li> {address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[1]} {rescale_lat(address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[1], usedHeight)} </li>
	{/each}

	{#each data.plants as plant}
		<b> {plant.PlantCountry} </b>
	{/each}
</ul>


<style>
	:root {
		--plant-radius: 10;
		--customer-radius: 5;
		--customer-default-radius: 2;
	}

	main {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	path.country {
		fill: rgb(171, 171, 171);
		stroke: none;
	}

	path.defaultCustomer {
		opacity: 1;
		stroke-width: var(--customer-default-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: black;
    }

	path.p4 {
		opacity: 1;
		stroke-width: var(--plant-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: rgb(0, 78, 166);
    }

	path.c4 {
		opacity: 0.25;
		stroke-width: var(--customer-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: rgb(0, 119, 255);
	}

	path.p5 {
		opacity: 1;
		stroke-width: var(--plant-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: rgb(180, 0, 187);
    }

	path.c5 {
		opacity: 0.25;
		stroke-width: var(--customer-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: rgb(247, 0, 255);
	}

	path.p6 {
		opacity: 1;
		stroke-width: var(--plant-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: rgb(166, 0, 0);
    }

	path.c6 {
		opacity: 0.25;
		stroke-width: var(--customer-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: rgb(255, 0, 0);
	}

	path.p7 {
		opacity: 1;
		stroke-width: var(--plant-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: rgb(0, 94, 0);
    }

	path.c7 {
		opacity: 0.25;
		stroke-width: var(--customer-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: rgb(0, 120, 0);
	}

	path.p8 {
		opacity: 1;
		stroke-width: var(--plant-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: rgb(177, 71, 0);
    }

	path.c8 {
		opacity: 0.25;
		stroke-width: var(--customer-radius);
		vector-effect: non-scaling-stroke;
		stroke-linecap: round;
		stroke: rgb(251, 100, 0);
	}
</style>