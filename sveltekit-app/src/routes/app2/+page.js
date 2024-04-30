import Papa from 'papaparse'

export const load = async ({ fetch }) => {


    const responsePlants = await fetch('http://localhost:5173/Plants.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvPlants = await responsePlants.text()
    let parsedCSVPlants = Papa.parse(csvPlants, {header: true})

    return {
      plants: parsedCSVPlants.data
    }
}