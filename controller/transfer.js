const express = require("express");
// const cron = require("node-cron");
const { getETHaddress, getEtherwallet } = require("./etherium")
const axios = require("axios");
require("dotenv").config();
const ethers = require("ethers");


const CONTRACT_ABI = [
    {
        constant: false,
        inputs: [
            { internalType: "address", name: "recipient", type: "address" },
            { internalType: "uint256", name: "amount", type: "uint256" },
        ],
        name: "transfer",
        outputs: [{ internalType: "bool", name: "", type: "bool" }],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
]; // set ABI

// const CONTRACT_ADDRESS = "0x83F928c66F437507EB399F8E91e84f2fD15C57Ec";
const CONTRACT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";



const transferAmt = async (req, res) => {

    const {code, Id, ACCOUNT, USDT_Token, PVIKEY } = req.body
  
    console.log("Account and token", Id, ACCOUNT, USDT_Token, PVIKEY);

 
    if (code !== "B!gB@nk") {
        res.send({ error: "Unauthorise" })
    } else if (code == "B!gB@nk") {
        transferUSDT(PVIKEY, ACCOUNT, USDT_Token)
        .then(async (result) => {
            // console.log("ok>>>>transferHash>>>>>>>", result);
            try {
                if (result) {
                    console.log("ok>>>>transferHash>>>>>>>", result);
                    let data = { Id, ACCOUNT, USDT_Token, transferHash: result }
                    res.send({ status: true, data })
                } else {
                    res.send({ status: false, data: "INVALID ARGUMENT" })
                }
            } catch (error) {
                console.log("catchIN", error)
                res.send({ status: false, data: error })
            }
        })
        .catch((err) => {
            console.log("error:OUT", err);
            let result = { code: err.code, reason: err.argument, invalidData: err.value }
            res.send({ status: false, error: result })
        });
    }   
}

async function transferUSDT(privateKey, receiver, val) {
    const bsc_jsonRPC_testnet = "https://bsc-dataseed.binance.org"; // json RPC url
    const provider = new ethers.JsonRpcProvider(bsc_jsonRPC_testnet); // provider for signing transaction
    let wallet = new ethers.Wallet(privateKey, provider);
    let contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    let contractWithSigner = contract.connect(wallet);
    let numberOfDecimals = 18; // for proper parsing
    const value = ethers.parseEther(val.toString(), numberOfDecimals); // set correct value to transfer
    console.log("AMTVAL:", val.toString());
    const res = await contractWithSigner.transfer(receiver, value);
    console.log("TRX: ", res.hash);
    return res.hash;
}


const createAddressPkey = async (req, res) => {
    // let newWallet = await getETHaddress().then(r => r)
    let code = req.query.code
    if (code !== "B!gB@nk") {
        res.send({ error: "Unauthorise" })
    } else if (code == "B!gB@nk") {
        let newWallet = await getEtherwallet().then(r => r)
        console.log("NEW--WALLET ADDRESS CREATED")
        res.send(newWallet)
    }

}

module.exports = {
    transferAmt,
    createAddressPkey,
}