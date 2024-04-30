<script>
    import SvelteHeatmap from 'svelte-heatmap';

    export let data = { sales: [] }; // Define the data object\

    function generateData() {
        const aggregatedData = {};

        // Check if data.sales exists and is not empty
        if (data && data.sales && data.sales.length > 0) {
            // Loop through each sale in data.sales
            data.sales.forEach(sale => {
                // Check if sale has SalesOrderCreationDate and OrderQuantity properties
                if (sale.SalesOrderCreationDate && sale.OrderQuantity && sale.MaterialKey) {
                    // Extract SalesOrderCreationDate and OrderQuantity from sale
                    const { SalesOrderCreationDate, OrderQuantity, MaterialKey } = sale;

                    // Convert OrderQuantity from string to number
                    const quantity = parseInt(OrderQuantity);

                    if (!isNaN(quantity)) {
                        if (SalesOrderCreationDate in aggregatedData) {
                            // If SalesOrderCreationDate already exists, add OrderQuantity to existing total
                            aggregatedData[SalesOrderCreationDate] += quantity;
                        } else {
                            // If SalesOrderCreationDate doesn't exist, initialize it with the OrderQuantity
                            aggregatedData[SalesOrderCreationDate] = quantity;
                        }
                    }
                }
            });
        }

        // Convert aggregated data object to arrays of dates and quantities
        const dates = Object.keys(aggregatedData);
        const quantities = Object.values(aggregatedData);
        const heatmap = dates.map((date, index) => ({ date, value: quantities[index] }));

        return { dates, quantities , heatmap};
    }
    
    const { dates, quantities, heatmap } = generateData()
    console.log("Sales Order Creation Date", dates)
    console.log("Order Quantity", quantities)

    // function heatmapData(){
    //     const heatmap = []
    //     console.log("Sales Order Creation Dates:", dates);
    //     console.log("Order Quantities:", quantities);
    //         for (i = 0; i < cars.length; i++) {
                
    //         }
    // }

    // const heatmap = heatmapData()

</script>


<!-- {#if data.sales.length > 0}
    <ul>
        {#each data.sales as sale}
            {#if sale.SalesOrderCreationDate && sale.OrderQuantity}

                <li>Day: {sale.day}, Month: {sale.month}, Year: {sale.year}, Order Quantity: {sale.OrderQuantity}</li>
            {/if}
        {/each}
    </ul>
{:else}
    <p>Loading...</p>
{/if} -->


<div class="container">
    <h1>First Heatmap</h1>
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
        data={heatmap}
        dayLabelWidth={20}
        emptyColor={'#ecedf0'}
        endDate={dates[30]}
        monthGap={20}
        monthLabelHeight={20}
        startDate={dates[0]}
        view={'monthly'}
        
    />
</div>

<div class="container">
    <h1>Second Heatmap</h1>
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
    data={heatmap}
    dayLabelWidth={20}
    emptyColor={'#ecedf0'}
    endDate={dates[58]}
    monthGap={20}
    monthLabelHeight={20}
    startDate={dates[31]}
    view={'monthly'}
/>
</div>


  <style>
    .container {
      border: 1px solid;
      padding: 20px;
      width: 250px;
    }
  </style>

  
