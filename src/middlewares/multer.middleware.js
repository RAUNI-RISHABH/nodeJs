import multer from 'multer';
import fs  from 'fs';

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, "./public/temp");
//     },
//     filename: function (req, file, cb) {
//       cb(null, file.originalname)// this will return the local file path which later will be used in saving the uploaded files to the server/cloud
//     }
//   })

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./public/temp/";
    fs.access(dir, fs.constants.W_OK, (err) => {
      if (err) {
        console.error("Directory not writable or does not exist:", err);
        return cb(err); // Ensure you handle errors
      }
      cb(null, dir);
    });
  },
  filename: function (req, file, cb) {
    console.log("Saving file:", file.originalname);
    cb(null, file.originalname);
  },
});

  
  export const upload = multer({ storage,
    fileFilter: (req, file, cb) => {
      console.log("File received: from 33", file.originalname);
      cb(null, true); // Allow all files
    },
   })