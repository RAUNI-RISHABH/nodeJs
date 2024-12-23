import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {cookieOptions} from "../constants.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // add a refreshTocken object properties in user object and save it without validating else it would ask for pwd again to skip we are using it this way
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something Went Wrong While generting refresh and access token"
    );
  }
};

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

  if (existedUser) {
    throw new ApiError(409, "User with given credentials already exists");
  }

  // console.log("request", req);

  const avatarLocalPath = req.files?.avatar[0]?.path;

  //  was throwing some error for array 0 if file were not uploaded
  //  const coverImageLocalPath = req.files?.coverImage[0]?.path || "";

  let coverImageLocalPath;

  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  console.log("avatar local path", avatarLocalPath);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  console.log("avatar", avatar);

  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wronf while registring the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "New User Registered Successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "username or email is requried");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );


  // with these options this cookie will be secured at UI end no one can change it, only can be changed at backend side.

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken, refreshToken },
        "Logged In successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  try {
      // Update the user's refresh token to undefined
      await User.findByIdAndUpdate(req.user._id, {
          $set: { refreshToken: undefined },
      }, {
          new: true, // Ensures the returned document reflects the update
      });

      // Set options for clearing cookies
      const options = {
          httpOnly: true,
          secure: true,
      };

      // Clear cookies and send response
      res
          .status(200)
          .clearCookie("accessToken", options)
          .clearCookie("refreshToken", options)
          .json(new ApiResponse(200, {}, "User logged out"));
  } catch (error) {
      // Let the asyncHandler handle the error; avoid throwing an additional error
      res.status(500).json(new ApiError(500, error?.message || "Something went wrong while logging out the user"));
  }
});

const refreshAccessToken = asyncHandler(async (req, res) => {

  const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

  if(!incomingRefreshToken) {
    throw new ApiError(400, "Refresh Token is required");
  }

 try {
   jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
     if(err) {
       throw new ApiError(401, "Invalid Refresh Token");
     }
 
     const user = await User.findById(decoded?._id);
 
     if(!user) {
       throw new ApiError(401, "Invalid Refresh Token");
     }
 
     if(user?.refreshToken !== incomingRefreshToken) {
       throw new ApiError(401, "Token is expired or used");
     }
 
     const { accessToken,newRefreshToken } = await generateAccessAndRefreshTokens(user._id);
 
     return res
       .status(200)
       .cookie("accessToken", accessToken, cookieOptions)
       .cookie("refreshToken", newRefreshToken, cookieOptions)
       .json(new ApiResponse(200, { accessToken, newRefreshToken }, "Access Token Refreshed Successfully"));
 });
 } catch (error) {
    throw new ApiError(500, error?.message || "Something went wrong while refreshing access token");
 }

});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
