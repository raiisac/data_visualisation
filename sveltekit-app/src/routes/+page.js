import Papa from 'papaparse'

export const load = async ({ fetch }) => {
    const responseSales = await fetch('https://raw.githubusercontent.com/raiisac/data_visualisation/main/sveltekit-app/static/sales_radar.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvSales = await responseSales.text()
    let parsedCsvSales = Papa.parse(csvSales, {header: true})

    return {
      sales: parsedCsvSales.data
    }
}