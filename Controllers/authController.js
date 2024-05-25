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

const createAndSendToken = (user, statusCode, res) => {
    const id = user._id
    console.log(id)
    const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    })
    console.log(token)
    const cookieOptions = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
        )
    };  
    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
    res.cookie("jwt", token, cookieOptions)
    console.log(res.cookie())
}


async function sendEmail(resetOtp, user) {
    // Create a transporter

    const transporter = nodemailer.createTransport({
        // host: "smtp.ethereal.email",
        service: "gmail",
        port: 587,
        secure: false,// Use `true` for port 465, `false` for all other ports
        auth: {
            user:process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });

    // Email content
    const mailOptions = {
        from: process.env.EMAIL_USER, // sender address
        to: `${user.email}`, // list of receivers
        subject: 'Your One-Time Password (OTP) for Job Portal',
        html: `
          <p>Dear ${user.name},</p>
          <p>You have requested to reset your password or perform a certain action on Job Portal. To proceed, please use the following One-Time Password (OTP):</p>
          <h2><strong>OTP:</strong> <b>${resetOtp}</b></h2>
          <p>Please enter this OTP within 10 minutes to complete your request. After 10 minutes, the OTP will expire, and you will need to request a new one.</p>
          <p>If you did not request this OTP or believe you have received this email in error, please disregard it.</p>
          <p>Thank you for using Job Portal.</p>
          <p>Best regards,<br/>The Job Portal Team</p>
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

exports.SignUp = catchAsync(async (req, res) => {
    const { name, email, password, confirmPassword, role, passwordChangerAt } = req.body;

    // check for field validation
    if (!name || !email || !password || !confirmPassword || !role) {
        return res.json({ "status": 401, "Error": "Please fill all the details" })
    }
    if (password != confirmPassword) {
        return res.json({ "status": 401, "Error": "passoword and confirm password not matched" })
    }

        const user = await User.findOne({ email })
        if (user) {
            return res.json({ "status": 400, "Error": "user exist" })
        }
        const newUser = await new User({ name, email, password, role })
        await newUser.save()
        const currUser = await User.findOne({ email })
        createAndSendToken(currUser, 201, res)
        console.log(currUser)
        return res.json({ "status": 201, "Message": "user created successfully" })


})

exports.Login=catchAsync(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ "status": 400, "Error": "Please fill all the fields" })
    }
   
        const user = await User.findOne({ email })

        if (!user) {
            return res.json({ "status": 401, "Error": "user not found" })
        }
        const comparepassword = await bcrypt.compare(password, user.password)
        if (!comparepassword) {
            return res.json({ "Error": "email or password is incorrect" })
        }
        createAndSendToken(user, 201, res)
        res.status(201).json({
            "Message": "You are logged in"
        })

})

exports.Logout=(req, res) => {
    res.clearCookie("jwt")
    console.log(req.cookies)
    res.json({
        "Status": 201,
        "Message": "You are Logged out"
    })
}

exports.ForgotPassword=async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    console.log(!user)
    if (!user) {
        return res.json({
            "Status": 404,
            "Error": "There is no user with email address"
        })
    }
    // 2) Generate the random reset token
    const resetOtp = await user.createResetOtp();
    console.log(resetOtp)

    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    try {
        // const resetURL = `${req.protocol}://localhost:5173/resetpassword/${resetOtp}`
        sendEmail(resetOtp, user)
        res.status(201).json({
            Status: 201,
            message: 'Otp sent to email!',
            id: user._id
        });
    } catch (err) {
        user.resetOtp = undefined;
        user.resetOtpExpires = undefined;
        await user.save({ validateBeforeSave: false });
        res.json({
            "Status": 500,
            "Error": "There was an error sending the email. Try again later!'"
        })
    }

}

exports.VerifyOtp=async (req, res) => {
    const otp = req.params.otp
    const hashedToken = crypto
        .createHash('sha256')
        .update(otp)
        .digest('hex');

    console.log(hashedToken)

    const user = await User.findOne({
        resetOtp: hashedToken,
        resetOtpExpires: { $gt: Date.now() }
    });
    console.log(user);

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        return res.json({
            "Status": 400,
            "Error": "Otp is invalid or has expired"
        })
    }
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    res.json({
        "Status": 201,
        "Message": "verified",
        "id": user._id
    })

}


exports.ResetPassword=async (req, res) => {
    const id = req.params.id
    const user = await User.findOne({ _id: id });
    console.log(user);

    // 2) If token has not expired, and there is user, set the new password
    if (!user) {
        res.json({
            "Status": 400,
            "Error": "Token is invalid or has expired"
        })
    }

    user.password = req.body.password;
    console.log(user.password)
    user.resetOtp = undefined;
    user.resetOtpExpires = undefined;
    await user.save();
    // 3) Update changedPasswordAt property for the user
    // 4) Log the user in, send JWT
    createAndSendToken(user, 200, res);
    res.json({
        "Status": 201,
        "Message": "your password has been updated please login again to continue"
    })
}


exports.GoogleRole=catchAsync(async (req, res) => {
        const { role, name, email } = req.body;
        const signInMethod = "google"
        const getuser = await User.findOne({ email })
        console.log(getuser)
        if (getuser) {
            createAndSendToken(getuser, 201, res);
            return res.json({
                "Status": 409,
                "Error": "user already exist",
                "role": getuser.role
            })
        }
        const user = await User.create({ name, email, role, signInMethod });
        console.log(user)
        createAndSendToken(user, 201, res);
        res.json({
            "Status": "201",
            "Message": "Your account has been created"
        })
}
)
