const nodemailer = require('nodemailer');
require('dotenv').config()
// console.log(process.env.EMAIL_PASSCODE)
const sendEmail = async (tomail, subject, text) => {
    return new Promise(async (resolve, reject) => {
        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'noreply@bigbankexchange.com',
                pass: process.env.EMAIL_PASSCODE
            }
        });

        let mailDetails = {
            from: 'noreply@bigbankexchange.com',
            to: tomail,
            subject: subject,
            text: text
        };

        await mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
                console.log('Error Occurs');
                return reject(err)
            } else {
                // console.log(data)
                console.log('Email sent successfully');
                return resolve("Email sent successfully")
            }
        });
    })
}
let result = sendEmail("sumitcodingwebtech23@gmail.com", "Testing", "function expression testing 999999999").then(r => r)

console.log(result)