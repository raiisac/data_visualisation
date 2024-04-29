import Papa from 'papaparse'

export const load = async ({ fetch }) => {
<<<<<<< HEAD
    const responseSales = await fetch('https://raw.githubusercontent.com/raiisac/data_visualisation/sales-raisa/sveltekit-app/static/sales_radar.csv', {
=======
    const responseSales = await fetch('https://raw.githubusercontent.com/raiisac/data_visualisation/main/sveltekit-app/static/sales_radar.csv', {
>>>>>>> 0dccb2a9c3d2d0203c5c5e980a7196228a7947ac
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvSales = await responseSales.text()
    let parsedCsvSales = Papa.parse(csvSales, {header: true})

    return {
      sales: parsedCsvSales.data
    }
}