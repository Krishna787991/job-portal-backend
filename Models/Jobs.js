const mongoose = require("mongoose")

const PostJobSchema = new mongoose.Schema({
    jobTitle: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    companyLogo: {
        type: String,
        required: true
    },
    minPrice: {
        type: Number,
        required: true
    },
    maxPrice: {
        type: Number,
        required: true
    },
    salaryType: {
        type: String,
        required: true
    },
    jobLocation: {
        type: String,
        required: true
    },
    postingDate: {
        type: Date,
        required: true
    },
    experienceLevel: {
        type: String,
        required: true
    },
    employmentType: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    skills: [String],
    postedEmail: {
        type: String
    },
    applicant: [{
        type: mongoose.Schema.Types.ObjectId, // Corrected
        ref: 'User'
    }]
}) 

const Jobs = mongoose.model("Job", PostJobSchema)


module.exports = Jobs