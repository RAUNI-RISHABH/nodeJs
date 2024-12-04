import express from "express";
import cots from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json({limit: "16kb"}));


//extended mean here it can take nested object also
app.use(express.urlencoded({extended: true, limit: "16kb"}));

//just to keep file for public use like used basically to keep static file 
// like uploaded file later upload to any third party from here
app.use(express.static("public"));

// to perform crud operation with cookies like to save delete in client browser
app.use(cookieParser());

export  {app}