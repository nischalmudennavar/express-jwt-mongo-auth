const mongoose = require("mongoose")
require("dotenv").config(); 

mongoose
.connect(process.env.DB_URI, {dbName: process.env.DB_NAME})
.then(() => {
    console.log("MongoDB connected")
}).catch((err) => {
    console.log(err)
})


mongoose.connection.on('connected',()=>{
    console.log("MongoDB connected to db ")
})

mongoose.connection.on('disconnected',()=>{
    console.log("MongoDB disconnected")
})

mongoose.connection.on('error',(error)=>{
    console.log(error.message)
})

process.on('SIGINT', async () => {

    await mongoose.connection.close()
    process.exit(0)
    
})