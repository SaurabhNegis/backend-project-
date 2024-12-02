import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { UploadOnCloudnary } from "../utils/cloudnary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
const registerUser = asyncHandler(  async (req, res) => {
   // get user info from frontend
   // validation - not empty
   //  check if user already exist: username, email
   // check for images, check for avatar
   // upload them to cloudinary. avatar
   // create user object - create ent¸ry in db
   // remove passwaord and refresh token field from response
   //  check for user creation   
   // return response


   const { fullName, email, username, password} = req.body
   console.log('email:', email)


   if (
      [ fullName, email, username, password].some((field) => 
         field?.trim() === "")

   ) {
        throw new ApiError(400, "all fields are required!")
        
   }

   const existedUer =  User.findOne({
      $or: [{ username },{ email }]
   })
   if (existedUer) {
      throw new ApiError(409, "User with email  or username already exists")
      
   } 

   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = req.files?.coverImage[0]?.path;

   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is required!");
   }




   const avatar =  await UploadOnCloudnary(avatarLocalPath)
   const coverImage =  await UploadOnCloudnary(coverImageLocalPath)


if (!avatar) {
   throw new ApiError(400, "Avatar file is required!");
   
}
  
 const user = await  User.create({
      fullName,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      passwaord,
      username: username.toLowerCase()
    })
 const createduser =   await User.findById(user._id).select(
   "-password -refreshToken"
 )

 if(!createduser){
   throw new ApiError(500, "something went wrong while registering the user")
   
 }


 return res.status(201).json(
   new ApiResponce(200, createduser, "User registered Successfully")
 )
})

export { registerUser}  