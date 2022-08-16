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
                    reject('some thing went wrong')
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
    // imageUrls which are neither null or empty string
    const imageNames = filterImages.map((images) =>{
      let imageUrls = images.image.split('.com/')
      return imageUrls[1]
    })
    let thumborUrls=[];
    for(let i = 0;i<imageNames.length;i++){
        const result = await getImageExtension(imageNames[i]);
        console.log(`http://54.254.235.11:8888/unsafe/fit-in/${dimensions}/filters:upscale()/${imageNames[i]}.${result}`)
        thumborUrls.push(`http://54.254.235.11:8888/unsafe/fit-in/${dimensions}/filters:upscale()/${imageNames[i]}.${result}`)
       
    }
    return thumborUrls;

}
generateThumborUrl('200x200')
.then((data) => {
   console.log(data)
})
