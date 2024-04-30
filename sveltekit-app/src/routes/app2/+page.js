import Papa from 'papaparse'

export const load = async ({ fetch }) => {


    const responsePlants = await fetch('http://localhost:5173/Plants.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvPlants = await responsePlants.text()
    let parsedCSVPlants = Papa.parse(csvPlants, {header: true})

    const responseCoordinates = await fetch('http://localhost:5173/Coordinates.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvCoordinates = await responseCoordinates.text()
    let parsedCSVCoordinates = Papa.parse(csvCoordinates, {header: true})

    return {
      plants: parsedCSVPlants.data,
      coordinates: parsedCSVCoordinates.data
    }
}