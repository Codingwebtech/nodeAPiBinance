async function generateOTP() {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * digits.length);
        otp += digits[randomIndex];
    }
    return otp;
}

async function generateRefral() {
    const characters = '012345ABCDEFGHIJKLMNOPQRSTUVWXYZ6789abcdefghijkmnpqrstuvwxyz';

    let referralID = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        referralID += characters.charAt(randomIndex);
    }
    // console.log(referralID)
    return referralID;
}

// console.log(generateRefral())

module.exports = {
    generateOTP,
    generateRefral
}