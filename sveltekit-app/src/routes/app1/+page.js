import Papa from 'papaparse';

export const load = async ({ fetch }) => {
    const responseSales = await fetch('http://localhost:5173/SalesData.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvSales = await responseSales.text()
    let parsedCsvSales = Papa.parse(csvSales, {header: true})

    // Sort the 'sales' data based on 'SalesOrderCreationDate'
    parsedCsvSales.data.sort((a, b) => new Date(a.SalesOrderCreationDate) - new Date(b.SalesOrderCreationDate));

    // Extract unique SalesOrderCreationDate values
    const uniqueDates = [...new Set(parsedCsvSales.data.map(item => item.SalesOrderCreationDate))];

    const responseSalesRadar = await fetch('http://localhost:5173/sales_radar.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvSalesRadar = await responseSalesRadar.text()
    let parsedCsvSalesRadar = Papa.parse(csvSalesRadar, {header: true})

    return {
      sales: parsedCsvSales.data,
      salesradar: parsedCsvSalesRadar.data,
      total_dates: uniqueDates      
    };
};

