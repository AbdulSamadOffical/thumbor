var AWS = require("aws-sdk");
require('dotenv').config()
const data = require('./Dummies/data');

// aws credentials
let s3 = new AWS.S3({
    accessKeyId: 'AKIAY3O5JOZIHDT44HMZ',
    secretAccessKey: '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'
})

const getImageExtension = async(imageId) => {
    var params = { Bucket: process.env.AWS_BUCKET, Key: imageId };    
      try{
        let extensionInfo = new Promise((resolve, reject) => {
            s3.getObject(params, function(err, data) {
                if(data != null && data.hasOwnProperty('ContentType')){
                    extensionInfo = data.ContentType.split('/');
                    resolve(extensionInfo[1]);
                }else{
                    reject('Something went wrong')
                }    
            });
        })    
        const extension = await extensionInfo;
        return extension;
      }
      catch(err){
        throw new Error(err);
      }        
}

 

const generateThumborUrl = async(dimensions) => {

 
    // filtering the null images
    const filterImages = data.productSkus.filter((images) => {
        if(images.image != null && images.image.length > 1){
            return true 
        }else{
            return false
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
        thumborUrls.push(`http://54.254.235.11:8888/unsafe/fit-in/${dimensions}/filters:upscale()/${imageNames[i]}.${val[i]}`)
    }
        return thumborUrls;
    })

}


generateThumborUrl('200x200')
.then((data) => {
   console.log(data)
}).catch((err) => {
    console.log(err.message)
})
