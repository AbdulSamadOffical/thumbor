const csv = require('csv-parser');
const fs = require('fs');
let count = 0;
fs.createReadStream('data.csv')
  .pipe(csv())
  .on('data', (row) => {
    count++
    console.log(row);
    console.log(count)
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });

// let dimensions = {
//     banners: '500x300',
//     images: '200x400'
// }

// for(let dim in dimensions){
    
// }