const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const User = require("../Models/User");
const Jobs = require("../Models/Jobs")
const catchAsync=require("../utils/catchAsync")

 
exports.JobBasedOnMultipleFilter=catchAsync(async (req, res) => {
    const { location, salary, experienceLevel, employment } = req.query;
    const query = {};
    if (location) {
        query.jobLocation = location.charAt(0).toUpperCase() + location.substring(1);
    }
    if (salary) {
        query.maxPrice = { $lt: salary };
    }
    if (experienceLevel) {
        query.experienceLevel = experienceLevel;
    }
    if (employment) {
        query.employmentType = employment;
    }
    console.log(query)

        const Data = await Jobs.find(query)
        res.send({
            "Status": 201,
            "length": Data.length,
            "Data": Data
        })
})

exports.JobBasedOnID=catchAsync(async(req,res)=>{
    const {id}=req.params;
    console.log(id)
    
        const job=await Jobs.findOne({_id:id})
        console.log(job)
        res.json({
            "Status":201,
            "Data":job
        })

})

exports.GetAllApplicantOnJob= catchAsync(async (req, res) => { 
    
        const {jobID}=req.body;
        console.log(jobID)
        const jobs = await Jobs.find({ _id: jobID })
        const userList=[]
        const applicantList =await Promise.all(jobs[0].applicant.map(async(elm)=>{
            const users=await User.find({_id:elm})
            // console.log(users) 
            let resume=''
            users[0].appliedJobs.forEach(val=>{
                let id=val.jobId
                console.log(id.toString()==jobID)
                if(id.toString()==jobID){
                    resume=val.resume;
                    return;
                }
            })
            // console.log(resume)
            return  [users[0],resume]
        }))
        res.json({
            "Status":201,
            "length":applicantList.length,
            "Data":applicantList,
            "Company":jobs[0].companyName
        })
})
  
exports.GetRecruiterPostedJob=catchAsync(async (req, res) => {
    console.log("hello")
    // console.log(req.user)
    console.log(req.cookies)
    

        const MyJobData=await Jobs.find({postedEmail:req.user.email});
        res.json({
            "Status":201,
            "length":MyJobData.length,
            "Data":MyJobData
        })

})

exports.UpdatePostedJob=catchAsync(async(req,res)=>{
    const {jobs_id}=req.params;
    console.log(req.body)


        const filter={_id:jobs_id}
        const updateDocument = {
            $set: req.body // Use $set to update specific fields
        };
        const updateDataByJobID=await Jobs.findOneAndUpdate(filter,updateDocument)
        console.log(updateDataByJobID)
        res.json({
            "Status":201,
            "Message":"Job Updated Successfully"
        })
    

})

exports.DeletePostedJob=catchAsync(async (req,res)=>{
  
        const DeleteIDResponse=await Jobs.deleteOne({_id:req.params.id})
        console.log(DeleteIDResponse)
        res.json({
            "Status":201,
            "Message":"Data Deleted Successfully"
        })
   
})

exports.GetJobForEdit=catchAsync(async (req, res) => {
    const {jobs_id}=req.params;
    
        const DataBasedOnJobID=await Jobs.find({_id:jobs_id});
        console.log(DataBasedOnJobID)
        res.json({
            "Status":201,
            "Data":DataBasedOnJobID
        })
})

exports.SearchJob=catchAsync(async (req, res) => {
   
        const { location, BannerPosition } = req.body;
        const jobLocation = location.charAt(0).toUpperCase() + location.substring(1)
        const arr = BannerPosition.split(" ")
        const maparr = arr.map(elm => {
            const a = elm.charAt(0).toUpperCase() + elm.substring(1)
            return a
        })
        jobTitle = maparr.join(" ")
        const Data = await Jobs.find({ jobLocation: jobLocation, jobTitle: BannerPosition })
        console.log(Data)
        res.send({
            "Status": 201,
            "length": Data.length,
            "Data": Data
        })

})
 
exports.GetUniqueLocation=catchAsync(async (req, res) => {

        const AllData = await Jobs.find({})
        const Locations = AllData.map((elm) => {
            return elm["jobLocation"]
        })
        const uniqueLocations = [...new Set(Locations)]
        console.log(uniqueLocations)
        res.json({
            "Status": 201,
            "Total": uniqueLocations.length,
            "Data": uniqueLocations
        })
   
})


exports.PublishJob= catchAsync(async (req, res) => {
    const { jobTitle, companyName, companyLogo,
        minPrice, maxPrice, salaryType, jobLocation,
        postingDate, experienceLevel, employmentType,
        description, skills,postedEmail } = req.body;

        if (!jobTitle || !companyName || !companyLogo || !minPrice || !maxPrice || !salaryType || !jobLocation || !postingDate
            || !experienceLevel || !employmentType || !description || skills.length == 0) {
            res.json({ "Status": 400, "Error": "Please full all the field" });
        }
        else {
            // min and max price has to  be set
            const newPost = await Jobs.create({
                jobTitle, companyName, companyLogo, minPrice, maxPrice, salaryType, jobLocation, postingDate, experienceLevel
                , employmentType, description, skills,postedEmail
            })
            console.log(newPost);
            res.json({
                "Status": 201,
                "Message": "Job posted successfully"
            })
        }
})

