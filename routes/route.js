const express = require('express');
const router = express.Router();


// const checkAuth = require('../middleware/checkAuth.middleware');
const userControllers = require('../controller/userController');
const coinDCX = require('../controller/coindcx');
const Transfer = require('../controller/transfer');
const TransferBNB = require('../controller/transferBNB');
const TransferToken = require('../controller/transferToken');


//-------------userController.js
router.get('/registrationlink', userControllers.registrationlink);
router.post('/registration', userControllers.registration);
router.post('/signupOtpVerify', userControllers.signupOtpVerify);
router.post('/login', userControllers.login);
router.post('/protected', userControllers.protected);
router.post('/requestOtp', userControllers.requestOtp);
router.post('/verifyOtp', userControllers.verifyOtp);
router.post('/updatePassword', userControllers.updatePassword);
// router.post('/getReferralUrl', userControllers.getReferralUrl);

//-----------coinDCX.js   

//--getCandleDetail,
//-- getBaseCoinList,
//-- getCoinStatus,

router.post('/getBaseCoinList', coinDCX.getBaseCoinList);
router.post('/getCoinStatus', coinDCX.getCoinStatus);
router.post('/getCandleDetail', coinDCX.getCandleDetail);


router.post('/transferAmt', Transfer.transferAmt);
router.post('/createAddressPkey', Transfer.createAddressPkey);
router.post('/transferBNB', TransferBNB.transferBNB);
router.post('/transferToken', TransferToken.transferToken);



module.exports = router