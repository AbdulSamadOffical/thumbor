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

 
// generate image data and storing it in csv

const generateImagData = async(productSkus) => {
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
    let imageMetaData = [];
    for(let i = 0;i<promises.length;i++){
        imageMetaData.push({imageId: imageNames[i],  extension: val[i] ?val[i]:''})
    }
    console.log(imageMetaData)
    // Writing to csv
    csvWriter
        .writeRecords(imageMetaData)
        .then(()=> console.log('The CSV file was written successfully'));

    })

}

// async function makeRequest (url) {
//     try{
//     const result = await axios.get(url);
//     return result;
//     }catch(err){
//         return err
//     }
// }


async function main (){
    
    let count = await getProductSkusCount();
    let offset  = 0;
    let limit = 281
    for (let i = 0;i<150;i++){
    let data = await getAllProductSkus(limit,offset);
    let thumborUrlsWithExtensions = await generateImagData(data)
    console.log(thumborUrlsWithExtensions)
    console.log(i)
    offset = offset + limit
    }
  
}

main();



