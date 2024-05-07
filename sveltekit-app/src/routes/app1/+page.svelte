<script>
    import SvelteHeatmap from 'svelte-heatmap';
	import { LayerCake, Svg } from 'layercake'; // for the radar graph
  	import { scaleLinear, scaleOrdinal  } from 'd3-scale'; // for the radar graph
	import Radar from '../../components/Radar.svelte'; // for the radar graph
	import AxisRadial from '../../components/AxisRadial.svelte'; // for the radar graph
	import Legend from "../../components/Legend.svelte"; // for the radar graph

    export let data = { sales: [] ,  salesradar: [] , total_dates }; // Define the data object
    export let selectedProduct = '1'; // Initialize selected product as Product 1
    export let selectedYear = '2022'; // Initialize selected year as 2022
    export let selectedPlantKey = '4'; // Initialize selected plant key as 4
	


    function generateData(product, year, plantKey, month) {
        const aggregatedData1 = {}; // Database for Product 1
        const aggregatedData2 = {}; // Database for Product 2
        const aggregatedData12 = {}; // Database for the sum of Product 1 and Product 2

        // Loop through each sale in data.sales
        data.sales.forEach(sale => {
            // Check if sale has SalesOrderCreationDate and OrderQuantity properties
            if (sale.SalesOrderCreationDate && sale.OrderQuantity && sale.MaterialKey && sale.PlantKey) {
                // Extract SalesOrderCreationDate and OrderQuantity from sale
                const { SalesOrderCreationDate, OrderQuantity, MaterialKey, PlantKey } = sale;

                // Extract the year and month from SalesOrderCreationDate
                const saleYear = SalesOrderCreationDate.substring(0, 4);
                
                // Only consider sales for the selected year, plant key, and month
                if (saleYear === year && PlantKey === plantKey) {
                    // Convert OrderQuantity from string to number
                    const quantity = parseInt(OrderQuantity);

                    if (!isNaN(quantity)) {
                        // Add OrderQuantity to the respective database based on MaterialKey
                        if (MaterialKey === '1') {
                            if (SalesOrderCreationDate in aggregatedData1) {
                                aggregatedData1[SalesOrderCreationDate] += quantity;
                            } else {
                                aggregatedData1[SalesOrderCreationDate] = quantity;
                            }
                        } else if (MaterialKey === '2') {
                            if (SalesOrderCreationDate in aggregatedData2) {
                                aggregatedData2[SalesOrderCreationDate] += quantity;
                            } else {
                                aggregatedData2[SalesOrderCreationDate] = quantity;
                            }
                        }

                        // Add OrderQuantity to the sum database
                        if (SalesOrderCreationDate in aggregatedData12) {
                            aggregatedData12[SalesOrderCreationDate] += quantity;
                        } else {undefined
                            aggregatedData12[SalesOrderCreationDate] = quantity;
                        }
                    }
                }
            }
        });

        // Convert aggregated data objects to arrays of dates and quantities
        const dates12 = Object.keys(aggregatedData12);
        const quantities12 = Object.values(aggregatedData12);
        const heatmap12 = dates12.map((date, index) => ({ date, value: quantities12[index] }));

        const dates1 = Object.keys(aggregatedData1);
        const quantities1 = Object.values(aggregatedData1);
        const heatmap1 = dates1.map((date, index) => ({ date, value: quantities1[index] }));

        const dates2 = Object.keys(aggregatedData2);
        const quantities2 = Object.values(aggregatedData2);
        const heatmap2 = dates2.map((date, index) => ({ date, value: quantities2[index] }));

        return { dates1, quantities1, heatmap1, dates2, quantities2, heatmap2, dates12, quantities12, heatmap12 };
    }

    function filterArrayByYear(arr, year) {
        // Filter the array by checking if the year of each date matches the provided year
        return arr.filter(item => {
            // Parse the item as a Date object
            const date = new Date(item);
            // Check if the date is a valid date object and its year matches the provided year
            return !isNaN(date) && date.getFullYear() == year;
        });
    }

	const seriesKey = 'plantkey';
  	const xKey = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	const zKey = 'materialkey'; // for the (fill colors)
	// colors for the legend
	const values = ["EV Car Battery", "Home Battery"];
	const ramp = ["#67c4c5", "#00001d"];
	const columns = 1;
	const seriesNames = Object.keys(data.salesradar[0]).filter(d => d !== seriesKey); 
	data.salesradar.forEach(d => {
		seriesNames.forEach(name => {
			d[name] = +d[name];
		});
	});	//seriesNames = fastball,change,slider,cutter,curve
	
	// Query results
	let temp = [];
	let filteredradardata = [];
	
	// For Select Menu
	$: if (selectedPlantKey) getfiltereddata();//update data when the plant is chosen
	$: if (selectedProduct ) getfiltereddata();//update data when the product is chosen
	$: if (selectedYear) getfiltereddata();//update data when the year is chosen
	//$: console.log(filteredradardata, selectedPlantKey);
	
	const getfiltereddata = () => {		
		if ( selectedProduct === "1") {
		   temp = data.salesradar.filter(sale => sale.materialkey === 1);
		} 
		if ( selectedProduct === "2") {
		   temp = data.salesradar.filter(sale => sale.materialkey === 2);
		} 
		if ( selectedProduct === "12") {
		   temp = data.salesradar;
		} 
		return filteredradardata = temp.filter(sale => sale.year === parseInt(selectedYear) && sale.plantkey  === selectedPlantKey);
	}	
	//Conditionally hide the legend for the products
    let legendvisible = false;

    function toggleVissible() {
		if(selectedProduct === "12"){
			legendvisible = true;
		}
		if(selectedProduct === "1"){
			legendvisible = false;
		}
		if(selectedProduct === "2"){
			legendvisible = false;
		}
    }
	function hideDiv(elem) {
		var x = document.getElementById("hideDiv");
    if(selectedProduct === "12")
	x.style.visibility = "visible";
    else
	x.style.visibility = "hidden";
}
</script>

<!-- Dropdown menu to select the product -->
<select bind:value={selectedProduct} on:change={toggleVissible}>
    <option value="1">EV Car Battery</option>
    <option value="2">Home Battery</option>
    <option value="12">Home and Car Battery</option>
</select>

<!-- Dropdown menu to select the year -->
<select bind:value={selectedYear}>
    <option value="2022">2022</option>
    <option value="2023">2023</option>
    <option value="2024">2024</option>
</select>

<!-- Dropdown menu to select the plant key -->
<select bind:value={selectedPlantKey}>
    <option value="4">Antwerp DC</option>
    <option value="5">Wroclaw DC</option>
    <option value="6">Lyon DC</option>
    <option value="7">Birmingham DC</option>
    <option value="8">Goteburg DC</option>
</select>

<h1>Heatmap for {#if selectedProduct == "1"}
	EV Car Batteries 
	{:else if selectedProduct == "2"} 
	Home Batteries
	{:else}
	EV Car and Home batteries
	{/if}
	in {selectedYear}
	for {#if selectedPlantKey== "4"}
	Antwerp DC
	{:else if selectedPlantKey == "5"}
	Wroclaw DC
	{:else if selectedPlantKey == "6"}
	Lyon DC
	{:else if selectedPlantKey == "7"}
	Birmingham DC
	{:else }
	Goteburg DC
	{/if}
</h1>


<div class="legend"></div>

<div class="heatmap-jan">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-jan">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[30]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[0]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-jan">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                dayLabels= {['', 'Mon', '', 'Web', '', 'Fri', '']}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[30]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[0]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-jan">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                dayLabels= {['', 'Mon', '', 'Web', '', 'Fri', '']}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[30]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[0]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-feb">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-feb">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[58]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[31]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-feb">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[58]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[31]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-feb">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[58]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[31]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-mar">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-mar">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[89]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[61]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-mar">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[89]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[61]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-mar">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[89]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[61]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-apr">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-apr">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[119]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[95]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-apr">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[119]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[95]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-apr">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[119]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[95]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-may">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-may">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[150]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[125]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-may">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[150]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[125]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-may">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[150]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[125]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-jun">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-jun">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[180]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[155]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-jun">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[180]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[155]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-jun">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[180]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[155]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-jul">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-jul">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[211]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[185]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-jul">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[211]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[185]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-jul">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[211]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[185]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-aug">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-aug">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[242]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[218]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-aug">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[242]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[218]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-aug">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[242]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[218]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-sep">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-sep">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[272]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[248]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-sep">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[272]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[248]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-sep">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[272]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[248]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-oct">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-oct">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[303]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[278]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-oct">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[303]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[278]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-oct">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[303]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[278]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-nov">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-nov">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[333]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[309]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-nov">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[333]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[309]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-nov">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[333]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[309]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="heatmap-dec">
    <!-- Conditional rendering based on the selected product -->
    {#if selectedProduct === '1'}
        <div class="container-dec">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap1}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[364]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[339]}
                view={'monthly'}
                />
        </div>
    {/if}
    {#if selectedProduct === '2'}
        <div class="container-dec">
                <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap2}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[364]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[339]}
                view={'monthly'}
            />
        </div>
    {/if}
    {#if selectedProduct === '12'}
        <div class="container-dec">
            <SvelteHeatmap
                allowOverflow={true}
                cellGap={5}
                cellRadius={1}
                colors={[
                    '#a1dab4', // Light shade of green
                    '#42b6c4', // Shade of blue with a hint of green 
                    '#2c7fb9', // Darker shade of blue
                    '#263494', // Deep shade of blue
                    '#ffeda0', // Light shade of yellow
                    '#feb24c', // Shade of orange
                    '#f03b20', // Shade of red
                    '#bd0026'  // Dark shade of red
                ]}
                data={generateData(selectedProduct, selectedYear, selectedPlantKey).heatmap12}
                dayLabelWidth={20}
                emptyColor={'#ecedf0'}
                endDate={filterArrayByYear(data.total_dates, selectedYear)[364]}
                monthGap={20}
                monthLabelHeight={20}
                fontSize={20}
                startDate={filterArrayByYear(data.total_dates, selectedYear)[339]}
                view={'monthly'}
                />
        </div>
    {/if}
</div>

<div class="radar-fig">
    <LayerCake
	  padding={{ top: 30, right: 0, bottom: 7, left: 0 }}
	  x={xKey}
	  z={zKey}
	  xDomain={[0, null]}
	  xRange={({ height }) => [0, height / 2]}
	  data = {filteredradardata}
	  zScale={scaleOrdinal()}
	  zRange={ramp}
	>
	<Svg>
		<AxisRadial/>	
		<Radar/>
	</Svg>
	</LayerCake>
</div>

<!-- Legend for the colors -->
<div class="legend">
    <p>No orders</p>
    <div class="legend-item" style="background-color: #ecedf0;"></div> 
    <div class="legend-item" style="background-color: #a1dab4;"></div> 
    <div class="legend-item" style="background-color: #42b6c4;"></div> 
    <div class="legend-item" style="background-color: #2c7fb9;"></div> 
    <div class="legend-item" style="background-color: #263494;"></div> 
    <div class="legend-item" style="background-color: #ffeda0;"></div> 
    <div class="legend-item" style="background-color: #feb24c;"></div> 
    <div class="legend-item" style="background-color: #f03b20;"></div> 
    <div class="legend-item" style="background-color: #bd0026;"></div>
    <p>Highest amount of orders</p>
</div>


<div id="hideDiv" style="width:100%; height: 100%; background-color:#eee;">
	{#if legendvisible}
	<Legend
		title="Product"
		{...{ ramp, values, columns}}
	/>
	{/if}
</div>

<style>
    .container-jan {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 300px; /* Adjust as needed */
        left: 600px; /* Adjust as needed */
    }

    .container-jan:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-feb {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 340px; /* Adjust as needed */
        left: 775px; /* Adjust as needed */
    }

    .container-feb:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-mar {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 450px; /* Adjust as needed */
        left: 900px; /* Adjust as needed */
    }

    .container-mar:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-apr {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 600px; /* Adjust as needed */
        left: 975px; /* Adjust as needed */
    }

    .container-apr:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-may {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 750px; /* Adjust as needed */
        left: 900px; /* Adjust as needed */
    }

    .container-may:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-jun {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 860px; /* Adjust as needed */
        left: 775px; /* Adjust as needed */
    }

    .container-jun:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-jul {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 900px; /* Adjust as needed */
        left: 600px; /* Adjust as needed */
    }

    .container-jul:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-aug {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 860px; /* Adjust as needed */
        left: 425px; /* Adjust as needed */
    }

    .container-aug:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-sep {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 750px; /* Adjust as needed */
        left: 300px; /* Adjust as needed */
    }

    .container-sep:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-oct {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 600px; /* Adjust as needed */
        left: 225px; /* Adjust as needed */
    }

    .container-oct:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-nov {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 450px; /* Adjust as needed */
        left: 300px; /* Adjust as needed */
    }

    .container-nov:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .container-dec {
        padding: 0px;
        width: 75px;
        margin-bottom: 0px;
        display: inline-block; /* Display heatmaps inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 340px; /* Adjust as needed */
        left: 425px; /* Adjust as needed */
    }

    .container-dec:hover {
        transform: scale(3); /* Scale heatmap on hover */
        z-index: 1; /* Ensure heatmap appears on top when scaled */
    }

    .legend {
        margin-top: 20px;
        padding: 10px;
        border-radius: 100px;
        display: grid; /* Use flexbox */
        position: absolute; /* Set position to relative */
        top: 700px; /* Adjust as needed */
        left: 0px; /* Adjust as needed */
    }

    .legend-item {
        width: 20px;
        height: 20px;
        margin-bottom: 0px; /* Add spacing between items */
        
    }

	.radar-fig {
        padding: 0px;
        width: 400px;
		height: 400px;
        margin-bottom: 0px;
        display: inline-block; /* Display radar inline */
        margin-right: 0px; /* Add some space between heatmaps */
        position: absolute; /* Set position to relative */
        top: 425px; /* Adjust as needed */
        left: 425px; /* Adjust as needed */
    }

</style>

