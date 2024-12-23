import {v2 as Cloudinary} from 'cloudinary';
import fs  from 'fs';

 Cloudinary.config ({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// const uploadOnCloudinary = async (localFilePath) => {
//     try {
//         console.log("here at 14", localFilePath);
        
//         if(!localFilePath) return null;

//         // upload the file on cloudinary
//        const response = await Cloudinary.uploader.upload(localFilePath, {
//             resource_type: 'auto'
//         });

//         // file has been uploaded successfull
//         console.log("file is uploaded on cloudinary", response.url);

//         return response;
        
//     } catch (error) {
//         console.log("here at 29", localFilePath);
        
//         fs.unlinkSync(localFilePath); // delete the local file (this function will be called when an error occurs while uploading a file to cloudinary)
//         return null;
//     }
// }

const uploadOnCloudinary = async (localFilePath) => {
    try {
        console.log("Processing file:", localFilePath);
        if (!localFilePath) {
            console.log("File path is invalid");
            return null;
        }

        let response;
        try {
            console.log("Uploading to Cloudinary...");
            response = await Cloudinary.uploader.upload(localFilePath, {
                resource_type: 'auto',
            });
        } catch (uploadError) {
            console.error("Upload failed:", uploadError.message);
            throw uploadError;
        }

        console.log("Upload successful:", response.url);
        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("Deleted local file after error.");
        } else {
            console.log("Local file was already missing.");
        }
        return response;
    } catch (error) {
        console.error("Caught an error:", error.message);

        if (fs.existsSync(localFilePath)) {
            fs.unlinkSync(localFilePath);
            console.log("Deleted local file after error.");
        } else {
            console.log("Local file was already missing.");
        }

        return null;
    }
};


export {uploadOnCloudinary}
