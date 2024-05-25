const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")
const crypto=require("crypto")

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: function() {
            // Require password only if not signing in with Google (e.g., local sign-up)
            return this.signInMethod !== 'google';
          }
    },
    signInMethod: {
        type: String,
        enum: ['local', 'google'],
        default: 'local'
      },
    role: {
        type: String,
        required: true
    },
    appliedJobs: [{
        jobId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Jobs', // Reference to the Job model
        },
        resume: {
            type: String,
            required: true
        },
    }],
    token: String,
    passwordChangedAt: Date,
    subscribe:Boolean,
    resetOtp:String,
    resetOtpExpires:Date
})  


UserSchema.pre("save", async function (next) {
    if (!this.isModified('password')) {
        return next()
    }
    this.password = await bcrypt.hash(this.password, 10)
    next()
})


UserSchema.methods.changedPasswordAfter = async function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        print("hello")
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10
        );
        console.log(changedTimestamp)
        return JWTTimestamp < changedTimestamp;
    }
    return false

}

UserSchema.methods.createResetOtp=async function(){
    const otp= Math.floor(Math.random() * (9000 - 1000 + 1)) + 1000;

    this.resetOtp = crypto
      .createHash('sha256')
      .update(`${otp}`)
      .digest('hex');

    console.log(this.resetOtp)
    this.resetOtpExpires = Date.now() + 10 * 60 * 1000;
    return otp;
}


const User = mongoose.model("User", UserSchema)


module.exports = User
