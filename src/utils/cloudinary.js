import {v2 as Cloudinary} from 'cloudinary';
import exp from 'constants';
import fs  from 'fs';

 Cloudinary.config ({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if(!localFilePath) return null;

        // upload the file on cloudinary
       const response = await Cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto'
        });

        // file has been uploaded successfull
        console.log("file is uploaded on cloudinary", response.url);

        return response;
        
    } catch (error) {
        fs.unlinkSync(localFilePath); // delete the local file (this function will be called when an error occurs while uploading a file to cloudinary)
        return null;
    }
}

export {uploadOnCloudinary}
