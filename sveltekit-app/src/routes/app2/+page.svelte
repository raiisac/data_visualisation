<script>
	import { json, geoTransform, geoPath } from 'd3';

	// data access
	export let data = [];

	// code for world map
	let width;
	let height;

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
		let range_max = givenWidth - 50;
      	return (((range_max - range_min)*(longitude-minLon))/(maxLon-minLon)) + range_min
  	}

	$: rescale_lat = function(latitude, givenHeight) {
		let range_min = givenHeight - 50;
		let range_max = 0;
      	return (((range_max - range_min)*(latitude-minLat))/(maxLat-minLat)) + range_min
  	}

	$: projection = geoTransform({
      point: function(x, y) {
          this.stream.point(rescale_lon(x, width), rescale_lat(y, height));
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
		address_to_coordinates_map.set(data.coordinates[i].address, [data.coordinates[i].latitude, data.coordinates[i].longitude]);
	}
	let address_to_coordinates_map_keys = Array.from(address_to_coordinates_map.keys());
</script>


<main bind:clientWidth={width} bind:clientHeight={height}>
	<svg width={width} height={height}>
		{#each countries as country}
			<path d={country.path}/>
		{/each}
		
		{#each data.plants as plant}
		<circle	cx={rescale_lon(address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[1], width)} 
				cy={rescale_lat(address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[0], height)} 
				r=3 />
		{/each}
	
	
	</svg>
</main>


<ul>
	{#each data.plants as plant}
		<li> {plant.PlantKey} {plant.Plant}</li>
		<li> {plant.PlantCity + " " + plant.PlantCountry} </li>
		<li> {address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[0]} {rescale_lon(address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[0], width)} </li>
		<li> {address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[1]} {rescale_lat(address_to_coordinates_map.get(plant.PlantCity + " " + plant.PlantCountry)[1], height)} </li>
	{/each}

	{#each data.plants as plant}
		<b> {plant.PlantCountry} </b>
	{/each}
</ul>


<style>
	main {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	path {
		fill: rgb(171, 171, 171);
		stroke: none;
	}

	circle {
		fill-opacity: 1;
		fill: rgb(0, 119, 255);
    }
</style>