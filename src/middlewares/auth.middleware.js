import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import {User} from "../models/user.model.js";




export const verifyJWT = asyncHandler(async(req, _, next) => {
    

    try {
        
    
   // Extract the accessToken from cookies or headers

  const token =   req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer", "")
     

  if (!token) {
    throw new ApiError(401 ,"unauthorized request")
  }

     // Verify the access token
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      

   const user =   await  User.findById(decoded?._id).select("-password -refreshToken")

   if (!user) {
    throw new ApiError( 401, "Invalid Access Token!");
    
   }

   req.user = user;
   next()

} catch (error) {
    throw new ApiError(401 , error?.message || "unauthorized request")


   }
})