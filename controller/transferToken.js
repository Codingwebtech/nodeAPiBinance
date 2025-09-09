
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

const transferToken = async (req, res) => {
    // let CONTRACT_ADDRESS = req.body.CONTRACT_ADDRESS

    const { code, CONTRACT_ADDRESS, Id, ACCOUNT, TOKEN, PVIKEY } = req.body

    // Id = user.Id;
    // PVIKEY = user.PrivKey;
    // ACCOUNT = user.WalletAddress;
    console.log("CONTRACT_ADDRESS", CONTRACT_ADDRESS, "Account and token", Id, ACCOUNT, TOKEN, PVIKEY);
    // USDT_Token = user.Amount;


    if (code !== "B!gB@nk") {
        res.send({ error: "Unauthorise" })
    } else if (code == "B!gB@nk") {
        transferAnyToken(CONTRACT_ADDRESS, PVIKEY, ACCOUNT, TOKEN)
            .then(async (result) => {
                console.log("ok", result);
                try {
                    if (result) {
                        console.log("ok>>>>transferHash>>>>>>>", result);
                        let data = { Id, ACCOUNT, TOKEN, transferHash: result }
                        res.send({ status: true, data })
                    } else {
                        res.send({ status: false, data: "INVALID ARGUMENT" })
                    }
                } catch (error) {
                    console.log("catchIN", error)
                    res.send({ status: false, error: error })
                }
            })
            .catch((err) => {
                console.log("error:", err);
                res.send({ status: false, error: err })
            });
    }
}

async function transferAnyToken(CONTRACT_ADDRESS, privateKey, receiver, val) {
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

module.exports = {
    transferToken
}