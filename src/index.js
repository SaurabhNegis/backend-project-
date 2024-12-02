// require('dotenv').config({path: './env'})
import dotenv from "dotenv";
import {connectDB} from "./db/index.js";
import app from "./app.js";

 dotenv.config({
    path: './env'
 })


connectDB() 
.then(() => {
    app.listen(process.env.PORT || 8000, () =>{
        console.log(`Serber is running at PORT: ${process.env.PORT}`)
   
        app.on("error", (error) =>{
        console.log("ERROR in App:", error);
        throw error
        })
    })
})
.catch((error) => {
    console.log("MONGO db connection Failed !!! ", error)
})




    




















/* 
import express from "express"
const app = express()
( async () => {
     try {
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
       app.on("error", (error) => {
        console.log("ERRR: ", error)
        throw error
       })

    app.liten(process.env.PORT, () => {
        console.log(`App is litening on port ${process.env.PORT}`)
    })

     } catch (error) {
        console.error("ERROR: ", error)
        throw error
     }
})()
     */