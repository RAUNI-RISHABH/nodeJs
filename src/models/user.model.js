import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    avatar: {
        type: String, // cloudinary URL
        required: true,
    },
    coverImage: {
        type: String, // cloudinary URL
    },
    watchHistory: [
        {
            type: Schema.Types.ObjectId,
            ref: "Video"
        }
    ],
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    refreshToken: {
        type: String
    }
}, {timestamps: true});

// this is hook of mongoose and will run only before save event occurs with user model
userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) return next(); // will check if password has been changed or not then only it will proceed further else return and pass on

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// custom methods which is used here to compare password
userSchema.methods.isPasswordCorrect =async function (password) {

    // 1st param is from paramter second is from userschema where encrypted password has been store
   return await bcrypt.compare(password, this.password);
}

// custom function in schema for generating access token 
userSchema.methods.generateAccessToken = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

// custom function in schema for generating refresh token 
userSchema.methods.generateRefreshToken = function() {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}





export const User = mongoose.model("User", userSchema);