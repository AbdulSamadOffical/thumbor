const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');


let dimensions = {
  banners: '500x300',
  images: '200x400'
}

async function makeRequest (url) {
    try{
    const result = await axios.get(url);
    return result;
    }catch(err){
        return err
    }
}




let count = 0;
fs.createReadStream('data.csv',{ highWaterMark: 1 * 1024, encoding: 'utf8' })
  .pipe(csv())
  .on('data', async (row) => {
    
   count++
    for (let dim in dimensions){
      console.log(`http://54.254.235.11:8888/unsafe/fit-in/${dimensions[dim]}/filters:upscale()/${row.ImageId}`)
  makeRequest(`http://54.254.235.11:8888/unsafe/fit-in/${dimensions[dim]}/filters:upscale()/${row.ImageId}`)   
  .then((res) => {
    console.log(res.code)
  })
    }
   
    console.log(count), count
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
  });


// how to get the size of the file in bytes
// const stats = fs.statSync('data.csv');
// console.log(stats.size)

// fs.createReadStream('data.csv')
//   .pipe(csv())
//   .on('data', async (row) => {
   
//     for (let dim in dimensions){
//       console.log(`http://54.254.235.11:8888/unsafe/fit-in/${dimensions[dim]}/filters:upscale()/${row.ImageId}`)
//     makeRequest(`http://54.254.235.11:8888/unsafe/fit-in/${dimensions[dim]}/filters:upscale()/${row.ImageId}`)   
//     .then((res) => {
//       console.log(res.code)
//     })
//     }
//   })
//   .on('end', () => {
//     console.log('CSV file successfully processed');
//   });


