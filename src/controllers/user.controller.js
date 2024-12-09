import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { UploadOnCloudnary } from "../utils/cloudnary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken"


const generateAccessAndRefereshTokens = async(userId) => {
  try {
   const user  = await User.findById(userId)
   const accessToken = user.generateAccessToken()
   const refreshToken =  user.generateRefreshToken()
   

   user.refreshToken = refreshToken
  await user.save({validateBeforeSave: false})

    return {accessToken, refreshToken}
  } catch (error) {
    throw new ApiError(500,"something went wrong while generating refresh and access token!");
    
  }


}



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

   const existedUer =  await User.findOne({
      $or: [{ username },{ email }]
   })

   if (existedUer) {
      throw new ApiError(409, "User with email  or username already exists")
      
   } 
   // console.log(req.files)

   const avatarLocalPath = req.files?.avatar[0]?.path;
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;



// also correct
   // let coverImageLocalPath = null;
   // if (req.files?.coverImage?.length > 0) {
   //     coverImageLocalPath = req.files.coverImage[0]?.path;
   // }


   
   let coverImageLocalPath;
   if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
      coverImageLocalPath = req.files?.coverImage[0]?.path;
   }



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
      password,
      username: username.toLowerCase()
    })
 const createdUser =   await User.findById(user._id).select(
   "-password -refreshToken"
 )

 if(!createdUser){
   throw new ApiError(500, "something went wrong while registering the user")
   
 }


 return res.status(201).json(
   new ApiResponce(200, createdUser, "User registered Successfully")
 )


})


const loginUser = asyncHandler(async (req, res) =>{
// req body - data
// username or email
// check the password
// find the referesh token
// send cookies

  const {email ,password, username} = req.body

  if (!username && !email) {
   throw new ApiError(400, "username or password is required!");
  }

  const user = await User.findOne({
   $or: [{ username },{ email }]
  })

  if (!user) {
   throw new ApiError(404,"user does not exist!");
   
  }

  console.log(user);

  const ispasswordvalid = await user.isPasswordCorrect(password)
   
  if (!ispasswordvalid) {
   throw new ApiError(401,"incorrect password!");
   
  }
  
  const {refreshToken, accessToken} =  await generateAccessAndRefereshTokens(user._id)


  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")


  const options = {
   httpOnly: true,
   secure: true
  }

  return res
  .status(200)
  .cookie("accessToken", accessToken, options)
  .cookie("refreshToken", refreshToken, options)
  .json(
   new ApiResponce(
      200,
      {
         user: loggedInUser, accessToken, refreshToken
      },
      "User logged in successfully"
   )
  )

   


})



const logoutUser = asyncHandler(async (req, res) => {
   
  await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:
         {
            refreshToken: undefined
         }
      
      },
      {
         new: true
      }

   )
   const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure flag only in production
      sameSite: "strict",
    };
  
 // Clear cookies
  res.clearCookie("accessToken", options);
  res.clearCookie("refreshToken", options);
  
  // Send success response
  return res.status(200).json(
   new ApiResponce(200, {}, "User logged out successfully")
 );


      

})


const refereshAccessToken = asyncHandler (async (req, res)  => {
  const incomingRefreshToken  = req.cookies.refreshToken || req.body.refreshToken
  

  if (!incomingRefreshToken) {
   throw new ApiError(401, "unauthrized request");
  }

  try {
   const decodedToken   = jwt.verify(incomingRefreshToken, process.env.REPRESH_TOKEN_SECRET);
  const user = await  User.findById(decodedToken?._id)



   if (!user) {
      throw new ApiError(401, "Invalid refresh token");
   }
   
   if (incomingRefreshToken !== user?.refereshToken) {
      throw new ApiError(401, "refresh token is expired or used");
      
   }

    const options = {
      httpOnly: true,
      secure: true
    }
   
   const {newrefreshToken, accessToken} =   await generateAccessAndRefereshTokens(user._id)
   
   return res
   .status(200)
   .cookie("accessToken",accessToken,options)
   .cookie("responceToken", newrefreshToken, options)
   .json(
      new ApiResponce(
         200,
         {accessToken, refreshToken: newrefreshToken },
         "access Token refreshed successfully"
      )
   )
  } catch (error) {
   throw new ApiError("Invalid refresh token");
   
  }
   
})


const changeCurrentPassword = asyncHandler( async (req, res) =>{
   const {oldPassword, newPassword} = req.body

    const user  = await User.findById(req.user?._id)

    const ispasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!ispasswordCorrect) {
      throw new ApiError(400, "Invalid Old Password!")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false}) 

    return res
    .status(200)
    .json(new ApiResponce(200, {}, "Password changed Successfully!"))

})


const getCurrentUser = asyncHandler( async (req, res) => {
   return res.status(200)
   .json(200, req.user, "current user fetched Successfully")
})


const updateAccountDetails = asyncHandler( async (req, res) =>{
   const {fullName, email} = req.body

   if(!fullName || email) {
      throw new ApiError(400, "All fields are required!")
   }

   const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
         $set:{
            fullName,
            email: email
         }
      },
      {new: true}
   ).select("-password")


   return res
   .status(200)
   .json(new ApiResponce(200, user, "Account details updated successfully!"))

})

const updateUserAvatar = asyncHandler( async (req, res) => {
   const avatarLocalPath  = req.file?.path

   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing!");
      
   }
  const avatar =   await UploadOnCloudnary(avatarLocalPath)
   
  if (!avatar.url) {
   throw new ApiError(400, "Error while uploading on avatar");
  }

  await User.findByIdAndUpdate(
   req.user?._id,
  {
   $set:{
      avatar: avatar.url
   }
  },
  {new: true}

  ).select("-password")
  
  return  res
  .status(200)
  .json(new ApiResponce(200, user, "Avatar updated successfully!"))


})


const updateUserCoverImage = asyncHandler( async (req, res) => {
   const coverImageLocalPath  = req.file?.path

   if (!coverImageLocalPath) {
      throw new ApiError(400, "cover Image file is missing!");
      
   }
  const coverImage =   await UploadOnCloudnary(coverImageLocalPath)
   
  if (!coverImage.url) {
   throw new ApiError(400, "Error while uploading on coverImage!");
  }

  await User.findByIdAndUpdate(
   req.user?._id,
  {
   $set:{
      coverImage: coverImage.url
   }
  },
  {new: true}

  ).select("-password")

  return  res
  .status(200)
  .json(
   new ApiResponce(200, user, "Cover image updated successfully!"
      
   ))

})




export { 
   registerUser,
   loginUser,
   logoutUser,
   refereshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateUserAvatar
}  