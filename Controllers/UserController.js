const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const User = require("../Models/User")
const RestrictTo = require("../middleware/action")
const crypto = require("crypto")
const jwt = require("jsonwebtoken")
const bcrypt = require("bcryptjs")
const Jobs = require("../Models/Jobs")
const nodemailer = require('nodemailer');
const catchAsync=require("../utils/catchAsync")


exports.SendEmailOnViewOfResume= (req, res) => {
    const { applicant, Company } = req.body;
    // Create a transporter
    const transporter = nodemailer.createTransport({
        // host: "smtp.ethereal.email",
        service: "gmail",
        port: 587,
        secure: false,// Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });
    // console.log(transporter)

    // Email content
    const mailOptions = {
        from: process.env.EMAIL_USER, // sender address
        to: `${applicant.email}`, // list of receivers
        subject: "Application viewd on Job-portal", // Subject line
        text: `Dear ${applicant.name},
        Your Application in ${Company} has been viewed
        by the recruiter on job-portal 
        `
    }

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            res.json({ 'Error occurred:': error });
        } else {
            res.json({ 'Email sent:': info.response });
        }
    });

}

exports.UpdateNewsSubscribtion=async (req, res) => {
    const updateData = { subscribe: req.body.flag }
    const response = await User.findByIdAndUpdate(req.user._id, updateData, { new: true });
    console.log(response)
    if (req.user) {
        return res.json({
            "Status": 201,
            "LoggedIn": true,
            "type": req.user.role,
            "user": req.user,
            "flag": req.user.subscribe
        })
    }
    res.json({
        "Status": 400,
        "Error": "Something went wrong"
    })
}

exports.GetLoggedInUser=(req, res) => {
    if (req.user) {
        return res.json({
            "Status": 201,
            "LoggedIn": true,
            "type": req.user.role,
            "user": req.user,
            "subscribe": req.user.subscribe
        })
    }
    res.json({
        "Status":401,
        "Error":"Something went wrong"
    })

}

exports.ApplyOnJob=catchAsync(async (req, res) => {
        // Get user ID from authentication token (assuming user is authenticated)
        const userId = req.user.id;
        console.log(userId)
        // Extract job ID and resume link from request body
        const { jobId, resume } = req.body;
        // Find user by ID and update appliedJobs array
        const user = await User.findById(userId);
        user.appliedJobs.push({ jobId, resume });

        const job = await Jobs.findByIdAndUpdate({ _id: jobId }, { $push: { applicant: userId } }, { returnOriginal: false })
        await user.save();
        res.json({
            "Status": 201,
            "Message": "Job applied successful"
        })   
})


exports.GetUserAppliedJobs=catchAsync(async (req, res) => {
  
        const userId = req.user.id
        const user = await User.find({ _id: userId })
        console.log(user[0].appliedJobs)
        const yourJobs = await Promise.all(user[0].appliedJobs.map(async (elm) => {
            const data = await Jobs.find({ _id: elm.jobId })
            return [data[0], elm.resume]
        }))
        res.json({
            "Status": 201,
            "Data": yourJobs
        })
})

