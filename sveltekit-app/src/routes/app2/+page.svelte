<script>
	import { onMount } from 'svelte';
	import { json, geoTransform, geoPath } from 'd3';
	import * as htmlVars from './htmlVars';
	
	// data access
	export let data = [];

	// code for world map
	let width = 100;
	let height = 100;
	$: usedWidth = width - 100;
	$: usedHeight = height - 50;
	$: scaleFactor = 1;
	const minScaleFactor = 1;
	const maxScaleFactor = 5;
	let scaleFactorIncrement = 0.4;
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

	const minRadius = 5;
	const maxRadius = 60;
	
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
	let customerKeyToCountry = new Map();
	for (let i = 0; i < data.customers.length; i++) {
		let lonLat = address_to_coordinates_map.get(data.customers[i].CustomerCity + " " + data.customers[i].CustomerCountry);
		customerKeyToLonLat.set(data.customers[i].CustomerKey, lonLat);
		customerKeyToCountry.set(data.customers[i].CustomerKey, data.customers[i].CustomerCountry);
	}

	$: changeScaleFactor = function(increase) {
		scaleFactor = Math.min(maxScaleFactor, Math.max(minScaleFactor, scaleFactor + increase));
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

	function getSaleDataMap(startYear, startMonth, endYear, endMonth, ProductkeyFlag) {
		/**
		 * SaleDataMap: Map[
		 * 					[lon,lat]: Map[
		 * 									"country": country,
		 * 									"totalSales": int, 
		 * 								    ClientName: int
		 *								  ]
		 * 				   ]
		*/
		let saleDataMap = new Map();
		let minQuantity = 1000000000000000;
		let maxQuantity = 0;
		let minYear = 2025;
		let maxYear = 2020;
		console.log(Number(data.sales[0].DeliveryDate.slice(0, 4)));
		for (let i = 0; i < data.sales.length; i++) {
			let year = Number(data.sales[i].DeliveryDate.slice(0, 4));
			let month = Number(data.sales[i].DeliveryDate.slice(5, 7));

			if (year < startYear || year > endYear || (year == startYear && month < startMonth) || (year == endYear && month > endMonth)) {
				continue;
			}
			minYear = Math.min(minYear, year);
			maxYear = Math.max(maxYear, year);
			// TODO: ProductkeyFlag filtering
			let latLon = customerKeyToLonLat.get(data.sales[i].CustomerKey);
			let quantity = Number(data.sales[i].OrderQuantity);
			if (saleDataMap.has(latLon)) {
				let salesQuantity = saleDataMap.get(latLon).get("totalSales");
				saleDataMap.get(latLon).set("totalSales", salesQuantity + quantity);
				if (saleDataMap.get(latLon).has(data.sales[i].CustomerKey)) {
					let customerSalesQuantity = saleDataMap.get(latLon).get(data.sales[i].CustomerKey);
					saleDataMap.get(latLon).set(data.sales[i].CustomerKey, customerSalesQuantity + quantity)
				} else {
					saleDataMap.get(latLon).set(data.sales[i].CustomerKey, quantity)
				}
			} else {
				saleDataMap.set(latLon, new Map());
				saleDataMap.get(latLon).set("country", customerKeyToCountry.get(data.sales[i].CustomerKey));
				saleDataMap.get(latLon).set("totalSales", quantity);
				saleDataMap.get(latLon).set(data.sales[i].CustomerKey, quantity)
			}
			minQuantity = Math.min(minQuantity, saleDataMap.get(latLon).get("totalSales"));
			maxQuantity = Math.max(maxQuantity, saleDataMap.get(latLon).get("totalSales"));
		}
		console.log(minQuantity, maxQuantity);
		console.log(minYear, maxYear);
		return [saleDataMap, minQuantity, maxQuantity];
	}

	let getSaleDataMapReturn = getSaleDataMap(2022, 1, 2024, 12, 3);
	$: filteredSaleDataMap = getSaleDataMapReturn[0];
	$: filteredSaleDataMapKeys = Array.from(filteredSaleDataMap.keys());
	$: minValueForRadius = getSaleDataMapReturn[1];
	$: maxValueForRadius = getSaleDataMapReturn[2];
	console.log(filteredSaleDataMapKeys);

	$: rescaleRadius = function(value) {
		let range_min = minRadius;
		let range_max = maxRadius;
      	return ((range_max - range_min)*(value-minValueForRadius))/(maxValueForRadius-minValueForRadius) + range_min
  	}

	onMount(() => {
        // This code now runs only on the client after the component is mounted
        const rangeInput = document.querySelectorAll(".range-input input");
		let progress = document.querySelector(".slider .progress");
		let fromRangeTextElement = document.querySelector(".from-range-text");
		let untilRangeTextElement = document.querySelector(".until-range-text");

        rangeInput.forEach(input => {
            input.addEventListener("input", () => {
				rangeInput[1].value = Math.max(rangeInput[0].value, rangeInput[1].value);
				rangeInput[0].value = Math.min(rangeInput[0].value, rangeInput[1].value);
				

                let minVal = parseInt(rangeInput[0].value);
                let maxVal = parseInt(rangeInput[1].value);

				let leftPercentage = ((minVal / rangeInput[0].max) * 100) + "%";
				let rightPercentage = 100 - ((maxVal / rangeInput[0].max) * 100) + "%";

				let minMonth = (minVal % 12) + 1;
				let minYear = Math.floor(minVal / 12) + 2022;
				let maxMonth = (maxVal % 12) + 1;
				let maxYear = Math.floor(maxVal / 12) + 2022;

				fromRangeTextElement.innerHTML = `From: ${minMonth}-${minYear}`;
				untilRangeTextElement.innerHTML = `Until: ${maxMonth}-${maxYear}`;

				progress.style.left = leftPercentage;
				progress.style.right = rightPercentage;

				let getSaleDataMapReturn = getSaleDataMap(minYear, minMonth, maxYear, maxMonth);
				filteredSaleDataMap = getSaleDataMapReturn[0];
				minValueForRadius = getSaleDataMapReturn[1];
				maxValueForRadius = getSaleDataMapReturn[2];

				console.log(filteredSaleDataMap);
                
            });
        });
	})

</script>


<!-- Components -->

<!-- Load the custome style -->
<svelte:head>
    <link rel="stylesheet" href="./src/routes/app2/page.css">
</svelte:head>

<div class="filter-div" style={`border:1px solid black; position: relative; width: ${usedWidth}px; height: 150px`}>
	
	<div class="filter-sub-div" id="plant-selector" style="height: 30px; width: 100%;">
		<div class="text" style={`left: ${htmlVars.startXPositionForFilteringText}px; top: ${htmlVars.percentageForDivText}%`}>Plants: </div>
		<input type="checkbox" id="Plant4" style={`position: absolute; left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenPlantCheckboxes * 0}px; top: ${htmlVars.percentageForCheckbox}%`}>
		<div class="text" style={`left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenTextboxAndText + htmlVars.gapBetweenPlantCheckboxes * 0}px; top: ${htmlVars.percentageForDivText}%`}>Antwerp DC</div>
		<input type="checkbox" id="Plant5" style={`position: absolute; left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenPlantCheckboxes * 1}px; top: ${htmlVars.percentageForCheckbox}%`}>
		<div class="text" style={`left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenTextboxAndText + htmlVars.gapBetweenPlantCheckboxes * 1}px; top: ${htmlVars.percentageForDivText}%`}>Wrocław DC</div>
		<input type="checkbox" id="Plant6" style={`position: absolute; left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenPlantCheckboxes * 2}px; top: ${htmlVars.percentageForCheckbox}%`}>
		<div class="text" style={`left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenTextboxAndText + htmlVars.gapBetweenPlantCheckboxes * 2}px; top: ${htmlVars.percentageForDivText}%`}>Lyon DC</div>
		<input type="checkbox" id="Plant7" style={`position: absolute; left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenPlantCheckboxes * 3}px; top: ${htmlVars.percentageForCheckbox}%`}>
		<div class="text" style={`left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenTextboxAndText + htmlVars.gapBetweenPlantCheckboxes * 3}px; top: ${htmlVars.percentageForDivText}%`}>Birmingham DC</div>
		<input type="checkbox" id="Plant8" style={`position: absolute; left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenPlantCheckboxes * 4}px; top: ${htmlVars.percentageForCheckbox}%`}>
		<div class="text" style={`left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenTextboxAndText + htmlVars.gapBetweenPlantCheckboxes * 4}px; top: ${htmlVars.percentageForDivText}%`}>Göteborg DC</div>
	</div>

	<div class="filter-sub-div" id="product-selector" style="height: 30px; width: 100%; top: 30px">
		<div class="text" style={`left: ${htmlVars.startXPositionForFilteringText}px; top: ${htmlVars.percentageForDivText}%`}>Products: </div>
		<input type="checkbox" id="Plant4" style={`position: absolute; left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenPlantCheckboxes * 0}px; top: ${htmlVars.percentageForCheckbox}%`}>
		<div class="text" style={`left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenTextboxAndText + htmlVars.gapBetweenPlantCheckboxes * 0}px; top: ${htmlVars.percentageForDivText}%`}>Car Battery</div>
		<input type="checkbox" id="Plant5" style={`position: absolute; left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenPlantCheckboxes * 1}px; top: ${htmlVars.percentageForCheckbox}%`}>
		<div class="text" style={`left: ${htmlVars.startXPositionForPlantCheckBoxes + htmlVars.gapBetweenTextboxAndText + htmlVars.gapBetweenPlantCheckboxes * 1}px; top: ${htmlVars.percentageForDivText}%`}>Home Battery</div>
	</div>




	<div class="filter-sub-div" id="period-selector" style="height: 60px; width: 100%; top: 60px">
		<div class="text" style={`position: absolute; left: ${htmlVars.startXPositionForFilteringText}px; top: ${htmlVars.percentageForDivText}%`}>Period: </div>
		<div class="slider">
			<div class="progress"></div>
		</div>
		<div class="range-input">
			<input class="period" type="range" min="0" max="35" value="0">
			<input class="period" type="range" min="0" max="35" value="36">
		</div>
		<div class="from-range-text" style={`position: absolute; left: ${htmlVars.startXPositionForFromText}`}>
			From: 1-2022
		</div>
		<div class="until-range-text" style={`position: absolute; left: ${htmlVars.startXPositionForUntilText}`}> 
			Until: 12-2024
		</div>
	</div>


</div>


<div id="map settings">
	<button on:click={changeScaleFactor(-scaleFactorIncrement)}>-</button>
	<button on:click={changeScaleFactor(scaleFactorIncrement)}>+</button>
</div>


<main bind:clientWidth={width} bind:clientHeight={height}>
	<!-- svelte-ignore a11y-no-static-element-interactions -->
	<svg width={usedWidth} height={usedHeight} style="border:1px solid black" on:mousedown={onMouseDown}>
		<g transform={"scale (" + String(scaleFactor) + ")"}>
		<g transform={"translate(" + String(translateX) + "," + String(translateY) + ")"}>
		

		{#each countries as country}
			<path class=country d={country.path}/>
		{/each}
		
		{#each filteredSaleDataMapKeys as latLonKey}

		<path
			class={"c" + countryToPlantKeyMap.get(filteredSaleDataMap.get(latLonKey).get("country"))}
			d={"M " + String(rescale_lon(latLonKey[0], usedWidth)) + " " + String(rescale_lat(latLonKey[1], usedHeight)) + " l 0.0001 0"}
			style={`stroke-width: ${rescaleRadius(filteredSaleDataMap.get(latLonKey).get("totalSales"))}`}
		/>

		<path
			class="defaultCustomer"
			d={"M " + String(rescale_lon(latLonKey[0], usedWidth)) + " " + String(rescale_lat(latLonKey[1], usedHeight)) + " l 0.0001 0"}
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