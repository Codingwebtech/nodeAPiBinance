
// var ethers = require("ethers");
// var url = "https://data-seed-prebsc-1-s3.binance.org:8545/";
var url = "https://bsc-dataseed.binance.org/";
require("dotenv").config();
// const fs = require("fs");
const axios = require("axios");
var Web3 = require("web3");



const web3 = new Web3(Web3.givenProvider || url);


const transferBNB = (req, res) => {
    // let { receiver, myAddress, privateKey, amount } = req.query
    let { code } = req.body
    let { receiver, myAddress, privateKey, amount } = req.body

    try {
        if (code !== "B!gB@nk") {
            res.send({ error: "Unauthorise" })
        } else if (code == "B!gB@nk") {
            sendBNB(receiver, myAddress, privateKey, amount).then(r => {
                // console.log(r, ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Hash")
                let data = { receiver, myAddress, amount, hash: r }
                res.send({ status: true, data: data })
            }).catch(err => {
                console.log(err)
                res.send({ status: false, error: err })
            })
        }
    } catch (error) {
        console.log(error)
        res.send({ status: false, error: error })
    }
}

async function sendBNB(receiver, myAddress, privateKey, amount) {
    return new Promise(async function executor(resolve, reject) {

        console.log(
            `Attempting to make transaction from ${myAddress} to ${receiver}  amount ${amount}`
        );

        await web3.eth.accounts
            .signTransaction(
                {
                    from: myAddress,
                    to: receiver,
                    value: web3.utils.toWei(amount.toString(), "ether"),
                    gas: "210000",
                },
                privateKey
            )
            .then(async (re) => {
                const createReceipt = await web3.eth.sendSignedTransaction(
                    re.rawTransaction
                );

                console.log(
                    `Transaction successful with hash: ${createReceipt.transactionHash}`
                );

                resolve(createReceipt.transactionHash);
            });
    });
}

// transferBNB()  
module.exports = {
    transferBNB
}