import Papa from 'papaparse'

export const load = async ({ fetch }) => {
    // Plants data
    const responsePlants = await fetch('http://localhost:5173/Plants.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvPlants = await responsePlants.text()
    let parsedCSVPlants = Papa.parse(csvPlants, {header: true})

    // Customer data
    const responseCustomers = await fetch('http://localhost:5173/Customers.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvCustomers = await responseCustomers.text()
    let parsedCSVCustomers = Papa.parse(csvCustomers, {header: true})

    // customer plant data
    const responseCustomerPlant = await fetch('http://localhost:5173/CustomerPlantRelation.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvCustomerPlant = await responseCustomerPlant.text()
    let parsedCSVCustomerPlant = Papa.parse(csvCustomerPlant, {header: true})

    // Coordinates data
    // coordinates are first latitude then longitude
    const responseCoordinates = await fetch('http://localhost:5173/Coordinates.csv', {
      headers: {
        'Content-Type': 'text/csv'
    }})
    let csvCoordinates = await responseCoordinates.text()
    let parsedCSVCoordinates = Papa.parse(csvCoordinates, {header: true})

    return {
      plants: parsedCSVPlants.data,
      customers: parsedCSVCustomers.data,
      customerPlant: parsedCSVCustomerPlant.data,
      coordinates: parsedCSVCoordinates.data
    }
}