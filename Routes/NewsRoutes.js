const express = require("express")
const router = express.Router()
const User = require("../Models/User")
const axios = require("axios")
const cron = require('node-cron');
const nodemailer = require("nodemailer")
const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" })

async function sendEmail(article) {
    // Create a transporter
    const response = await User.find({ subscribe: true })
    const allUser = response.map(elm => {
        return elm.email
    })

    const transporter = nodemailer.createTransport({
        // host: "smtp.ethereal.email",
        service: "gmail",
        port: 587,
        secure: false,// Use `true` for port 465, `false` for all other ports
        auth: {
            user: process.env.EMAIL_USER,
            pass:process.env.EMAIL_PASS
        },
    });

    // Email content
    const mailOptions = {
        from: process.env.EMAIL_USER, // sender address
        to: `${allUser.map(elm => elm)}`, // list of receivers
        subject: article.title,
        html: `
            <h1>${article.title}</h1>
            <p><strong>Author:</strong> ${article.author}</p>
            <p><strong>Description:</strong> ${article.description}</p>
            <p><strong>Published At:</strong> ${article.publishedAt}</p>
            <a href="${article.url}">Read more</a>
            <img src="${article.urlToImage}" alt="Article Image" style="max-width: 100%; height: auto;">
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

async function sendNewsTOSubcribedUser(){
    const response = await axios.get("https://newsapi.org/v2/top-headlines?country=in&category=business&apiKey=1660953b788c4f7fbe3b209d0de0602c")
    const randomNumber = Math.floor(Math.random() * 5);
    console.log(randomNumber)
    const article = response.data.articles[randomNumber]
    sendEmail(article)
    res.json(article)
}




// Schedule cron job to hit API endpoint every minute
// cron.schedule('*/1 * * * *', hitApiEndpoint);


// Schedule cron job to send email daily at 8 AM
cron.schedule('0 8 * * *', sendNewsTOSubcribedUser);



module.exports = router