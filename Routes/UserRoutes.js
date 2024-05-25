const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const UserController=require("../Controllers/UserController")
const AuthController=require("../Controllers/authController")



router.post("/sendmail",UserController.SendEmailOnViewOfResume)
router.patch("/", auth,UserController.UpdateNewsSubscribtion)
router.get("/", auth, UserController.GetLoggedInUser)
router.post('/apply', auth, UserController.ApplyOnJob)
router.get("/appliedjobs", auth, UserController.GetUserAppliedJobs)


router.post("/signup", AuthController.SignUp)
router.post("/login", AuthController.Login)
router.get("/logout", auth, AuthController.Logout)
router.post("/forgotpassword", AuthController.ForgotPassword)
router.post("/verifyotp/:otp", AuthController.VerifyOtp)
router.post("/resetpassword/:id", AuthController.ResetPassword)
// handle role coming from sign in with gooogle
router.post("/google/role",AuthController.GoogleRole)


module.exports = router 