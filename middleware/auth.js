const jwt = require("jsonwebtoken")
const User=require("../Models/User");



const Authentication = async (req, res, next) => {
    let token;
    // if (req.headers.authorization && req.headers.authorization.startsWith('Bearear')) {
    //     token = req.headers.authorization.split(' ')[1];
    // }
    token=req.cookies.jwt;
    if (!token) {
        return res.json({ "Status": 401, "Error": "You are not logged in" })
    }
    try {
        // 2) Verification token

        const decoded = await jwt.verify(token, process.env.JWT_SECRET)
    
        // 3) Check if user still exists if user has been deleted after token issued 
        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.json({ "Status": 401, "Error": "User belonging to this token is no longer exist" })
        }
        // 4) Check if user changed password after the token was issued
        // if someone has stolen the jwt token so user has changed the password so new token should be issued.
        if (await currentUser.changedPasswordAfter(decoded.iat)) {
            return res.json({"Status":401,"Error":"User recently changed password! Please log in again."})
        }

        // GRANT ACCESS TO PROTECTED ROUTE
        req.user = currentUser;
    }
    catch (err) {
        return res.json({
            "Status":500,
            "error": err 
        })
    }
    next();
}
module.exports = Authentication 