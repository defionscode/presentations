// Demonstration for Operation Code on the advantage of strings
//
// To attempt to analyze the entire data dump without streams (will error)
// node stream-compare.js
//
// To attempt to analyze a 900MB chunk of the data without streams
// node stream-compare.js 1
//
// To attempt to analyze a 350MB chunk of the data without streams
// node stream-compare.js 2
//
// To attempt to analyze the entire data dump WITH streams
// node stream-compare.js streams
//
// To attempt to analyze a 900MB chunk of the data WITH streams
// node stream-compare.js streams 1
//
// To attempt to analyze a 350MB chunk of the data WITH streams
// node stream-compare.js streams 2
//
const fs = require('fs')
const readline = require('readline')
const { argv } = require('process')
let fileName = 'parking-citations.csv'
if (argv[3] === '1' || argv[2] === '1') fileName = 'parking1.csv'
if (argv[3] === '2' || argv[2] === '2') fileName = 'parking2.csv'

async function main () {
  let totalFines = 0
  const makes = {}
  const sortable = []

  if (argv[2] !== 'streams') {
    // when you run this without including 'streams' this part of the code will run
    console.time('no-streams') // start a timer
    fs.readFile(__dirname + '/data/' + fileName, { encoding: 'utf8' }, (err, data) => {
      // load the data file into memory
      if (err) {
        console.error(err)
        throw err
      }
      const lines = data.split(/\r\n/) // each line in the csv is delimited by \r\n

      lines.forEach((ln, index) => { // iterate over each line in the csv

        // we exclude the first and last line to avoid bad data
        if (index > 0 && index !== lines.length - 1) {

          const data = ln.split(',') // split the line at each comma to get the data

          if (data.length === 19) { // ensure there are 19 'rows' of data
            const fine = Number(data[16]) // try to make the 'fine' column a Number()
            // ensure it's a valid number before trying to add
            if (typeof fine === 'number' && !isNaN(fine)) totalFines += fine

            const make = data[8] // make of the vehicle
            if (!makes[make]) { // if the make hasn't been noted
              makes[make] = 1 // add it to the object with a value of 1
            } else {
              makes[make] += 1 // otherwise increment by 1
            }
          }
        }
      })

      for (const make in makes) {
        // we want to sort this, but sort() only works on arrays
        sortable.push([make, makes[make]])
      }

      // sort logic for the sortable array of arrays
      sortable.sort((x,y) => x[1] - y[1])

      // print out aggregate citations on a per-make basis
      sortable.map(x => console.log(`Make: ${x[0]} \t Total Citations ${x[1]}`))
      console.log(`Total Fines => ${totalFines}`)

      // end timer
      console.timeEnd('no-streams')
    })
  } else {
    console.time('streams')
    // initialize the stream
    const stream = fs.createReadStream(__dirname + '/data/' + fileName)

    // sets up readline so it knows how to break each line
    const rl = readline.createInterface({
      input: stream,
      crlfDelay: Infinity
    })

    // whenever a 'line' is detected
    rl.on('line', ln => {
      const data = ln.split(',')
      if (data.length === 19) {
        const fine = Number(data[16])
        if (typeof fine === 'number' && !isNaN(fine)) totalFines += fine

        const make = data[8]
        if (!makes[make]) {
          makes[make] = 1
        } else {
          makes[make] += 1
        }
      }
    })

    // when no more lines are left
    rl.on('close', () => {
      for (const make in makes) {
        sortable.push([make, makes[make]])
      }
      sortable.sort((x,y) => x[1] - y[1])
      sortable.map(x => console.log(`Make: ${x[0]} \t Total Citations ${x[1]}`))
      console.log(`Total Fines => ${totalFines}`)
      console.timeEnd('streams')
    })
  }
}

main()
