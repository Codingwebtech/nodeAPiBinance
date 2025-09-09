const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
var deeplink = require('node-deeplink');
require('dotenv').config()
const jwt = require('jsonwebtoken');
// const jwtSecret = process.env.JWT_SECRET;
const jwtTime = "2m";
const session = require('express-session');
const prisma = require('../utils/prisma')
const { generateOTP, generateRefral } = require('../utils/getotp')
const { signupSchema, signupResponse, successResponseSchema, errorResponseSchema, loginSchema, tokenResponseSchema } = require("../schema/userSchema")

// console.log(process.env.JWT_SECRET, jwtSecret)

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
                return resolve(true)
            }
        });
    })
}

const protected = (req, res) => {
    // const token = req.session.token;
    // const token = req.headers.authorization;
    const token = req.body.token || req.session.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized!! Please login again.' });
    }
    // Verify JWT
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        res.status(200).json({ message: 'Token is valid. Protected resource accessed' });
    });
}

const registration = async (req, res) => {
    try {
        const { name, email, mobile, password, referralId } = signupSchema.parse(req.body);
        let subject = "Registration OTP for BigBank Exchange"

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        bcrypt.hash(password, 10, async (err, hash) => {
            if (err) {
                return res.status(500).json({ message: 'Error hashing password' });
            }
            const otp = (await generateOTP()).toString()
            const referral = (await generateRefral()).toString()
            let emailstatus = await sendEmail(email, subject, otp)
            // console.log(emailstatus)
            if (emailstatus) {
                const status = "0";
                const newUser = { email, name, mobile, password: hash, referralId, otp, status };

                // Create user
                const user = await prisma.user.create({
                    data: newUser,
                });
                const newReferral = { user_id: user.id.toString(), email, referral, status: "0" };
                const userReferral = await prisma.referral.create({
                    data: newReferral,
                });
                // const data = signupResponse.parse(user)
                // console.log(user, userReferral)

                return res.json({ status: true, message: 'User created successfully' });
            } else {
                return res.json({ error: 'Something went wrong on sending email' })
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json(errorResponseSchema.parse({ error: 'Internal server error' }));
    }
}
const registrationlink = async (req, res) => {
    pool.getConnection(async function (err, connection) {
        if (err) throw err
        try {
            const { name, email, mobile, password } = signupSchema.parse(req.body);
            const referralId = req.body.referralId | req.query.referralId;

            console.log(referralId)

            let subject = "Registration OTP for BigBank Exchange"

            if (!email || !name || !mobile || !password) {
                return res.status(401).json({ error: 'Please enter all fields' });
            }
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({ where: { email } });

            if (existingUser) {
                return res.status(400).json({ error: 'User already exists' });
            }

            bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                    return res.status(500).json({ message: 'Error hashing password' });
                }
                const otp = (await generateOTP()).toString()
                const referral = (await generateRefral()).toString()
                const mainId = await getUserId()
                let emailstatus = await sendEmail(name, email, subject, otp)
                // console.log(emailstatus)
                if (emailstatus) {
                    const status = "0";
                    const newUser = { email, name, mobile, password: hash, referralId, otp, status };
                    // Create user
                    const user = await prisma.user.create({
                        data: newUser,
                    });
                    const newReferral = { user_id: user.id.toString(), email, referral, status: "0" };
                    const userReferral = await prisma.referral.create({
                        data: newReferral,
                    });
                    let records = [[user.id, email, mainId, "0"]]
                    try {
                        connection.query("insert into unique_id (user_id, email, main_id,status) VALUES ?",
                            [records], async (err, result) => {
                                if (err) throw err
                                if (result) console.log("mainId created");
                            })
                    } catch (error) {
                        console.log(error)
                    } finally {
                        connection.release()
                    }
                    return res.json({ status: true, message: 'User created successfully' });
                    // const data = signupResponse.parse(user)
                    // console.log(user, userReferral)

                } else {
                    return res.json({ error: 'Something went wrong on sending email' })
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json(error);
        }
    })
}

const signupOtpVerify = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Check if user already exists
        // const existingUser = await prisma.user.findMany({ where: { AND: [{ email }, { status: "0" }] } });
        const existingUser = await prisma.user.findUnique({ where: { email } });
        // console.log(existingUser)
        if (!existingUser) {
            return res.status(400).json({ error: 'User Not exist' });
        }
        if (existingUser.status == 1) {
            return res.status(400).json({ error: 'User already verify' });
        }
        if (existingUser.otp !== otp) {
            return res.status(400).json({ error: 'Invalid Credential' });
        }

        const updateUser = await prisma.user.update({
            where: {
                email
            },
            data: {
                status: "1",
            },
        })
        console.log(updateUser)

        return res.json({ message: 'User verified successfully' });
    } catch (error) {
        console.log(error)

    }

}

const requestOtp = async (req, res) => {
    try {
        const { userId, email } = req.body
        let subject = "Request OTP for BigBank Exchange"
        const existingUser = await prisma.user.findUnique({ where: { email } });
        // console.log(existingUser)
        if (!existingUser) {
            return res.status(400).json({ error: 'User Does Not exist' });
        }

        const otp = (await generateOTP()).toString();
        let emailstatus = await sendEmail(email, subject, otp).then(r => r)
        // console.log(emailstatus)
        if (emailstatus) {
            const newOtp = { user_id: userId, email, otp, status: "0" };
            // Create user
            const userOtp = await prisma.otp.create({
                data: newOtp,
            });
            console.log(userOtp)

            return res.status(200).json({ data: userOtp });
        } else {
            return res.json({ error: 'Something went wrong on sending email' })
        }

    } catch (error) {
        console.log(error)
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body
        const existingUser = await prisma.otp.findMany({
            take: 1,
            where: { email }, orderBy: {
                id: 'desc',
            }
        });

        // console.log(existingUser, existingUser.length)
        if (!existingUser) {
            return res.status(400).json({ error: 'User Does Not exist' });
        }
        if (existingUser[0].otp !== otp || existingUser[0].status == 1) {
            return res.status(400).json({ error: 'Invalid Otp' });
        }
        console.log(existingUser[0].email)
        const token = jwt.sign({ email: existingUser[0].email }, process.env.JWT_SECRET, {
            expiresIn: jwtTime,
        });
        const updateUser = await prisma.otp.update({
            where: {
                id: existingUser[0].id
            },
            data: {
                status: "1",
            },
        })
        await prisma.user.update({
            where: {
                email
            },
            data: {
                status: "1",
            },
        })
        // console.log(updateUser)

        return res.json({ message: 'User otp verified successfully', token });
    } catch (error) {
        console.log(error)
    }
}

const updatePassword = async (req, res) => {
    try {
        const { email, password, token } = req.body
        // Check if user already exists
        // const token = req.body.token || req.session.token;
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'Invalid token' });
            }
            // console.log(decoded)
            // res.status(200).json({ message: 'Token is valid. Protected resource accessed' });
            const existingUser = await prisma.user.findUnique({ where: { email } });

            if (!existingUser) {
                return res.status(400).json({ error: 'User Does not exists' });
            }

            bcrypt.hash(password, 10, async (err, hash) => {
                if (err) {
                    return res.status(500).json({ message: 'Error hashing password' });
                }

                const updateUser = await prisma.user.update({
                    where: {
                        email
                    },
                    data: {
                        password: hash
                    },
                })
                // console.log(updateUser)

                return res.json({ message: 'User password updated successfully' });

            });
        });


    } catch (error) {
        console.log(error)

    }
}

const login = async (req, res) => {
    try {
        const { email, password } = loginSchema.parse(req.body);

        // Check if user exists
        const user = await prisma.user.findUnique({ where: { email } });
        // console.log(user)

        if (!user) {
            return res.status(401).send(errorResponseSchema.parse({ error: 'User does not exist' }));
        }
        if (user.status !== "1") {
            return res.status(401).send(errorResponseSchema.parse({ error: 'User Not verified' }));
        }

        bcrypt.compare(password, user.password, async (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Error comparing passwords' });
            }
            if (!result) {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
            // Generate JWT
            const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
                expiresIn: jwtTime,
            });
            // Generate JWT token
            // const token = jwt.sign({ userId: user.id }, 'your_secret_key');
            // Set session token
            // req.session.token = token;
            const otp = await generateOTP()
            console.log(token, otp)
            return res.json({ message: 'Login successful', data: user, token });

        });

    } catch (error) {
        console.error(error);
        return res.status(500).json(errorResponseSchema.parse({ error: 'Internal server error' }));
    }
}

const getReferralDeeplink = async (req, res) => {
    console.log("Working getReferralUrl")
    try {
        const { email } = req.body
        const existingUser = await prisma.referral.findUnique({ where: { email } });
        if (!existingUser) {
            return res.status(400).json({ error: 'User Does Not exist' });
        }
        console.log(existingUser.referral)
        let refurl = ``
        return res.status(200).json({ statue: true, data: `http://api.bigbankexchange.com/api/registrationlink?invitationCode=${existingUser.referral}` });
    } catch (error) {
        console.log(error)

    } finally {
        

        var app = express();

        app.get(
            '/deeplink',
            deeplink({
                fallback: 'https://cupsapp.com',
                android_package_name: 'com.citylifeapps.cups',
                ios_store_link:
                    'https://itunes.apple.com/us/app/cups-unlimited-coffee/id556462755?mt=8&uo=4'
            })
        );
    }
}

module.exports = {
    registration,
    registrationlink,
    signupOtpVerify,
    login,
    protected,
    requestOtp,
    verifyOtp,
    updatePassword
    
}