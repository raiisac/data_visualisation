import Papa from 'papaparse';

export const load = async ({ fetch }) => {
    const responseSales = await fetch('https://raw.githubusercontent.com/raiisac/data_visualisation/sales-Tamaya/sveltekit-app/static/SalesData.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvSales = await responseSales.text()
    let parsedCsvSales = Papa.parse(csvSales, {header: true})

    // Sort the 'sales' data based on 'SalesOrderCreationDate'
    parsedCsvSales.data.sort((a, b) => new Date(a.SalesOrderCreationDate) - new Date(b.SalesOrderCreationDate));

    return {
      sales: parsedCsvSales.data
    };
};



