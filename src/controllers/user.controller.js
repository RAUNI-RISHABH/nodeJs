import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/apiResponse.js"

const registerUser = asyncHandler(async (req, res) => {
  // get user details from frontend
  // validation
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary and save the url in db
  // make use user object, to save the data in mongodb, with create entry in db
  // remove password and refresh token field from response as it send as it is response what has been saved
  // check for user creation
  // return resposnse to client or error if occur any

  const { fullName, email, username, password } = req.body;

  console.log("email: ", email);
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }
  // User model will now deal with User DB in the database
 const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if(existedUser) {
    throw new ApiError(409, "User with given credentials already exists");
  }

 const avatarLocalPath = req.files?.avatar[0]?.path;
 const coverImageLocalPath = req.files?.coverImage[0]?.path;

 if(!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
 }

const avatar = await uploadOnCloudinary(avatarLocalPath);
const coverImage = await uploadOnCloudinary(coverImageLocalPath);

if(!avatar) {
    throw new ApiError(400, "Avatar file is required");
}

const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email, 
    password,
    username: username.toLowerCase(),  
})

const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
);

if(!createdUser) {
    throw new ApiError(500, "Something went wronf while registring the user");
}

return res.status(201).json(
   new ApiResponse(200, createdUser, "New User Registered Successfully")
)

});

export { registerUser };
