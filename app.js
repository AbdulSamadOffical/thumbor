// import modules
const axios = require('axios');
var AWS = require("aws-sdk");
require('dotenv').config()
const db = require('./db');

const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: 'data.csv',
  header: [
    {id: 'imageId', title: 'ImageId'},
    {id: 'extension', title: 'Extension'},
  ]
});


// Writing to csv
// csvWriter
//   .writeRecords(data)
//   .then(()=> console.log('The CSV file was written successfully'));


// reading from csv
// const csv = require('csv-parser');
// const fs = require('fs');

// fs.createReadStream('data.csv')
//   .pipe(csv())
//   .on('data', (row) => {
//     console.log(row);
//   })
//   .on('end', () => {
//     console.log('CSV file successfully processed');
//   });




// aws credentials
let s3 = new AWS.S3({
    accessKeyId: 'AKIAY3O5JOZIHDT44HMZ',
    secretAccessKey: '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'
})


// get the product_skus
const getAllProductSkus = async(limit, offset) => {
    let data = await db('product_sku').select('image').limit(limit).offset(offset);
   
    return data;
}

// get the product_sku counts
const getProductSkusCount = async() => {
    let data = await db('product_sku').count().first();
    return data; 
}



// get image Extensions
const getImageExtension = async(imageId) => {
    var params = { Bucket: process.env.AWS_BUCKET, Key: imageId };    
      try{
        let extensionInfo = new Promise((resolve, reject) => {
            s3.getObject(params, function(err, data) {
                if(data != null && data.hasOwnProperty('ContentType')){
                    extensionInfo = data.ContentType.split('/');
                    resolve(extensionInfo[1]);
                }else{
                    resolve(null)
                }
            });
        })    
        const extension = await extensionInfo;
        return extension;
      }
      catch(err){
        console.log(err)
        throw new Error(err);
      }        
}

 

const generateThumborUrl = async(dimensions, productSkus) => {
    // filtering the null images
    const filterImages = productSkus.filter((images) => {

        if(images.image != null && images.image.length > 1 &&images.image!='null'){
            return true 
        }      
    })
    // returning the image ids and accumulating the promises for image extensions
    let promises =[]
    const imageNames = filterImages.map((images,i) =>{
      let imageUrl = images.image.split('.com/')
      let imageId = imageUrl[1]
      const result =  getImageExtension(imageId);
      promises.push(result)
      return imageId;
    })

    // if anyone of the promise reject all the statements should reject

    return Promise.all(promises).then((val) => {
    let thumborUrls=[];
    for(let i = 0;i<promises.length;i++){
        thumborUrls.push(`http://54.254.235.11:8888/unsafe/fit-in/${dimensions}/filters:upscale()/${imageNames[i]}.${val[i] ?val[i]:''}`)
    }
        return thumborUrls;
    })

}

async function makeRequest (url) {
    try{
    const result = await axios.get(url);
    return result;
    }catch(err){
        return err
    }
}


async function callThumborUrl (){
    
    let count = await getProductSkusCount();
    let offset  = 0;
    let limit = 281
    for (let i = 0;i<150;i++){
    let data = await getAllProductSkus(limit,offset);
    let thumborUrlsWithExtensions = await generateThumborUrl('200x200', data)
    console.log(thumborUrlsWithExtensions)
    console.log(i)
    offset = offset + limit
   
    }
  
    // thumborUrlsWithExtensions.forEach(async (urls) => {
    // const result =  await makeRequest(urls);
    // console.log(result.code, 'status info')
    // })
}

// callThumborUrl();



