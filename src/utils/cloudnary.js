import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

    // Configuration
    cloudinary.config({ 
        cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
        api_key: process.env.CLOUDNARY_API_KEY, 
        api_secret:process.env.CLOUDNARY_API_SECRET
    });

    const UploadOnCloudnary = async (localFilePath) => {
        try {
    if(!localFilePath) return null
    const responce  = await cloudinary.uploader.upload(localFilePath, {
         resource_type: "auto"

     })     
// console.log("file is uploaded on cloudnary", responce.url );
   fs.unlinkSync(localFilePath)
return responce
      } 
      catch (error) { 
     fs.unlinkSync(localFilePath)//remove the locally saved temporary file as thr upload fails
             return null;
        }
    }
    
    const deleteFromCloudinary = async (publicUrl) => {
        try {
            // Extract the public ID from the URL (works for both images and videos)
            const segments = publicUrl.split('/');
            const fileNameWithExtension = segments.pop();
            let publicId = fileNameWithExtension.split('.')[0]; // Extract publicId by removing file extension
    
            // Determine resource type based on file extension
            const fileExtension = fileNameWithExtension.split('.').pop().toLowerCase();
            const resourceType = (fileExtension === 'mp4' || fileExtension === 'mov') ? 'video' : 'image';
    
            console.log("Public ID extracted:", publicId); // Log the public ID
            console.log("Resource type determined:", resourceType); // Log the resource type
    
            // Perform the deletion from Cloudinary
            const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
    
            if (result.result === 'ok') {
                console.log(`Successfully deleted: ${publicId}`);
            } else {
                console.log(`Failed to delete: ${publicId}`);
            }
        } catch (error) {
            console.error("Error deleting from Cloudinary:", error);
        }
    };
    
    

    const optimizeUrl =  cloudinary.url( {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    console.log(optimizeUrl);
     // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.url('shoes', {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });
    console.log(autoCropUrl);    

    
 
export { UploadOnCloudnary, deleteFromCloudinary}
