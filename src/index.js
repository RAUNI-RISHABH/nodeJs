/* eslint-disable no-undef */
// require('dotenv').config({path: './env'}) earlier approach with require/commonJS
import dotenv from "dotenv";
import {app} from './app.js'

dotenv.config({
  path: './.env'
})


import connectDB from "./db/connectionDb.js";

// filepath: /c:/Users/risha/OneDrive/Documents/my-projects/nodejs/src/index.js
connectDB()
.then(() => {
  app.listen(process.env.PORT || 0, () => { // Changed port to 8001
    console.log(`Server is running at port : ${process.env.PORT || 8001}`);
  });
})
.catch((err) => {
  console.log("MONGO db connection failed !!! ", err);
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('Process terminated');
    process.exit(0);
  });
});





















// Noraml appraoch with non modular approach
// import mongoose from "mongoose";
// import express from "express"
// import { DB_NAME } from "./constants";
// const app = express();

// ( async () => {
//   try {
//    await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);

//    app.on("error", (err) => {

//     console.log("ERR: ", err);
//     throw err
//    })

//    app.listen(process.env.PORT, () => {
//     console.log(`App is listening on port ${process.env.PORT}`);
    
//    });

//   } catch (error) {
//     console.error("ERROR: ", error);
//     throw error
//   }
// })()
