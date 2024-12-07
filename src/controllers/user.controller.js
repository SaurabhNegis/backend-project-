import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js";
import { UploadOnCloudnary } from "../utils/cloudnary.js";
import { ApiResponce } from "../utils/ApiResponce.js";


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
  .cookie("accesToken", accessToken, options)
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

   User.findByIdAndUpdate(
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
      secure: true
     }
   

     return res.status(200).clearCookies("accesToken", options).
     clearcookies("refreshToken",  options ).
     json(
      new ApiResponce(
         200,
         {},
         "User logged out successfully"
      )
     )

      

})

export { 
   registerUser,
   loginUser,
   logoutUser
}  