const mongoose=require("mongoose")
const Job=require("./Models/Jobs")
const fs=require("fs")
const { json } = require("express")
const dotenv=require("dotenv")
dotenv.config({path:"./config.env"})


const DB=process.env.DATABASE
console.log(DB)
mongoose.connect(DB)
.then(()=>{console.log("DB connection established successfully")})
.catch((err)=>{console.log(err)})


const data=JSON.parse(fs.readFileSync("./data/company.json","utf-8"))
console.log(data)
const UploadTourData=async (data)=>{
        try {
          await Job.create(data);
          console.log('Data successfully loaded!');
        } catch (err) {
          console.log(err);
        }
        process.exit();
}
UploadTourData(data)

