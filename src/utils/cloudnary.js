import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
        api_key: process.env.CLOUDNARY_API_KEY, 
        api_secret: CLOUDNARY_API_SECRET
    });

    const uploadOnCloudnary = async (localFilePath) => {
        try {
    if(!localFilePath) return null
    const responce  = await cloudinary.uploader.upload(
     'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', {
         public_id: 'shoes',

     })     
console.log("file is uploaded on cloudnary", responce.url );
return responce
      } catch (error) { 
     fs.unlinkSync(localFilePath)//remove the locally saved temporary file as thr upload fails
             return null;
        }
    }
 
export default uploadOnCloudnary
