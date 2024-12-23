import express from "express";
import cors from "cors";
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
app.use(express.static("./public"));

// to perform crud operation with cookies like to save delete in client browser
app.use(cookieParser());


app.use((err, req, res, next) => {
    if (res.headersSent) {
        // Avoid sending another response if headers are already sent
        return next(err);
    }
    res.status(err.status || 500).json({
        message: err.message || "Internal Server Error",
    });
});


// routes import 
import userRouter from './routes/user.routes.js'

//routes declaration. this is middleware it will go to userRouter where we will handle all the requested URL
// this is prefix "/api/v1/users"
app.use("/api/v1/users", userRouter);


export  {app}