const express=require("express")
// sign in with google
const User=require("./Models/User")
const session=require("express-session")
const passport=require("passport")
const OAuth2Strategy=require("passport-google-oauth2").Strategy

const Jobs=require("./Models/Jobs")
const UserRoutes=require("./Routes/UserRoutes")
const JobRoutes=require("./Routes/JobRoutes")
const NewsRotes=require("./Routes/NewsRoutes")
const cookieParser = require("cookie-parser")


const cors=require("cors")
const dotenv=require("dotenv")

const app=express()
dotenv.config({path:"config.env"})
const mongoose=require("mongoose")


const AppError=require("./utils/appError")
const globalErrorHandler=require("./Controllers/errorController")


app.use(express.json())
app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173', // Replace with the actual origin of your React app
    credentials: true // Allow credentials (cookies, authorization headers, etc.)
  }));

const DB=process.env.DATABASE
mongoose.connect(DB)
.then(()=>{console.log("DB connection established successfully")})
.catch((err)=>{console.log(err)})

const client_id=process.env.CLIENT_ID
const client_secret=process.env.CLIENT_SECRET





// setup session
app.use(session({
  secret:"JOBPORTALSECRET",
  resave:false,
  saveUninitialized:true
}))



// set up passport
app.use(passport.initialize());
app.use(passport.session());


passport.use(
  new OAuth2Strategy({
    clientID:client_id,
    clientSecret:client_secret,
    callbackURL:"/auth/google/callback",
    scope:["profile","email"]
  },
    async(accessToken,refreshToken,profile,done)=>{
      let name=profile.displayName;
      let email=profile.email
      console.log(name,email)
      try{
        return done(null,{name,email})
        // let newuser= new User({name,email})
        // await newuser.save({validateBeforeSave:false});
        // return done(null,{ _id: newuser._id });
      }
      catch(err){
        console.log(err)
        return done(err,false)
        }
    }
  )
)

passport.serializeUser((user,done)=>{
  done(null,user);
})


passport.deserializeUser((user,done)=>{
  done(null,user);
})

// intitial google oauth login
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}))


app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
  (req, res) => {
    // Successful authentication, redirect to role with user data
    res.redirect(`http://localhost:5173/role?name=${req.user.name}&email=${req.user.email}`);
  }
);



app.use("/api/v1/user",UserRoutes)
app.use("/api/v1/jobs",JobRoutes)
app.use("/api/v1/news",NewsRotes)

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);




const PORT=process.env.PORT
app.listen(PORT,()=>{
    console.log(`server is running at port ${PORT}`)
})

