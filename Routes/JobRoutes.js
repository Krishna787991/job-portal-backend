const express = require("express")
const Jobs = require("../Models/Jobs")
const router = express.Router()
const auth = require("../middleware/auth")
const User=require("../Models/User")
const JobController=require("../Controllers/JobController")
    

router.get("/", JobController.JobBasedOnMultipleFilter)
router.post("/applicant", auth, JobController.GetAllApplicantOnJob)
// here also why get method is not working
router.post("/search", JobController.SearchJob)
// why get method is not working
router.get("/uniqueLocations", JobController.GetUniqueLocation)
router.post("/post-job",JobController.PublishJob)
router.get("/my-jobs",auth, JobController.GetRecruiterPostedJob)
router.get("/my-jobs/edit-jobs/:jobs_id", auth,JobController.GetJobForEdit)

router.get("/:id",JobController.JobBasedOnID)
router.delete("/:id",JobController.DeletePostedJob)
router.put("/:jobs_id",JobController.UpdatePostedJob)

module.exports = router