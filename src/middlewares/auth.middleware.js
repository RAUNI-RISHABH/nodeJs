/* eslint-disable no-undef */
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// if res is not used then it can be written as _ instead of res

export const verifyJWT = asyncHandler(async (req, _, next) => {

  console.log("req.cookies", req.cookies);
  
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

    console.log("token", token);
    
  if (!token) {
    throw new ApiError(401, "Unauthorize access");
  }

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    console.log("decodedToken", decodedToken);
    
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    req.user = user;
    next();
  } catch (err) {
   throw new ApiError(500, err?.message || "Invalid Access Token");
  }

  next();
});
