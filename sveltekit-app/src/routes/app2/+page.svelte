<script>
	import { json, geoTransform, geoPath } from 'd3';

	let width, height;

	let geojsonPath = "http://localhost:5173/europe.geojson"
	let geojson;
	json(geojsonPath).then((data) => geojson = data);

	const minLon = -24.542225;
	const maxLon = 46.710815;
	const minLat = 31.78639;
	const maxLat = 66.536102;
	
	$: rescale_lon = function(longitude) {
		let range_min = 0;
		let range_max = width;
      	return ((range_max - range_min)*(longitude-minLon))/(maxLon-minLon) + range_min
  	}

	$: rescale_lat = function(latitude) {
		let range_min = height;
		let range_max = 0;
      	return ((range_max - range_min)*(latitude-minLat))/(maxLat-minLat) + range_min
  	}

	$: projection = geoTransform({
      point: function(x, y) {
          this.stream.point(rescale_lon(x), rescale_lat(y));
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

	$: console.log(countries);

	
</script>

<main
	bind:clientWidth={width}
	bind:clientHeight={height}
>
	<svg width={width} height={height}>
		{#each countries as country}
			<path d={country.path}/>
		{/each}
	</svg>
</main>


<style>
	main {
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}
</style>