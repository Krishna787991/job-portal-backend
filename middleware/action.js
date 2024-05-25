const RestrictTo=(req,res,next)=>{
    const role=req.user.role
    if(role!="admin"){
        return res.json({"status":401,"error":"you are not authorized to perform this action"})
    }
    console.log(role)
    next()
}
module.exports=RestrictTo

