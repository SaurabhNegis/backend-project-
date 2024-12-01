import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
   username: {
    type: String,
    required:  [true,'username is required'],
    unique: true,
    lowercase: true,
    trim: true,
    index: true
   }, 
   email: {
    type: String,
    required:  [true,'email is required'],
    unique: true,
    lowercase: true,
    trim: true
   },
   fullname: {
    type: String,
    required:  [true,'fullname is required'],
     trim: true,
    index: true
   },
   avatar: {
    type: String, //cloudinary url
    required: [true,'avatar is required']
   },
   coverImage:{
    type: String,
   },
   watchHistory: [
    {
        type: Schema.Types.ObjectId,
        ref: "Video"
    }
   ],
   password: {
    type: String,
    required: [true,'Password is required']
    
   },
   refreshToken:{
    type: String

   }



    },
    { 
        timestamps: true 
    }
)

userSchema.pre("save", async function (next) {
    if (this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})
 

userSchema.methods.isPasswardCorrect = async function
(password){
 return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
  return  jwt.sign(
        {
          _id: this._id,
          email: this.email,
          username: this.username,
          fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:  process.env.ACCESS_TOKEN_EXPIRY
        }

    )
}
userSchema.methods.generateRefreshToken = function(){
    return  jwt.sign(
        {
          _id: this._id
        },
        process.env.REPRESH_TOKEN_SECRET,
        {
            expiresIn:  process.env.REPRESH_TOKEN_EXP
        }

    )
}
 

export const User = mongoose.model("User",userSchema)