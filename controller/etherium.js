var Wallet = require('ethereumjs-wallet');
const Web3 = require("web3")
// const testnet = 'https://ropsten.infura.io/';
const testnet = 'https://rpc2.sepolia.org';
// const testnetgoerli = 'https://eth-goerli.alchemyapi.io/v2/${alchemyApiKey}';
//[ MAIN--NET
// const web3 = new Web3(new Web3.providers.HttpProvider("https://mainnet.infura.io/v3/YOUR_PROJECT_ID"))
// web3.eth.getBalance("0x52bc44d5378309EE2abF1539BF71dE1b7d7bE3b5", function(err, result) {
//     if (err) {
//       console.log(err)
//     } else {
//       console.log(web3.utils.fromWei(result, "ether") + " ETH")
//     }
//   })
// ]

// const web3 = new Web3(new Web3.providers.HttpProvider(testnet));
const EthWallet = Wallet.default.generate();
// console.log("address: " + EthWallet.getAddressString());
// console.log("privateKey: " + EthWallet.getPrivateKeyString());
// let walletAddress = EthWallet.getAddressString()
// let privateKey = EthWallet.getPrivateKeyString()
// console.log("address: " + walletAddress);
// console.log("address: " + privateKey);
// const getBalance = await web3.eth.getBalance(walletAddress)
// const ethBalance = web3.utils.fromWei(getBalance, 'ether')
// console.log(ethBalance)

const getETHaddress = () => {
    return new Promise(async (res, rej) => {
        let walletAddress = EthWallet.getAddressString()
        let privateKey = EthWallet.getPrivateKeyString()
        let data = { address: walletAddress, privateKey: privateKey }
        // console.log(data)
        return res(data)
        // const getBalance = await web3.eth.getBalance(walletAddress)
        // console.log(getBalance)
        // const ethBalance = web3.utils.fromWei(getBalance, 'ether')
        // console.log(ethBalance)
        // let gasP = await web3.eth.getGasPrice();
        // console.log(gasP)
    })
}

const getEtherwallet = async () => {
    return new Promise(async (resolve, reject) => {
        const EthWallet = Wallet.default.generate();
        // console.log("erch0",EthWallet);
        let w = {
            "address": EthWallet.getAddressString(),
            "privatekey": EthWallet.getPrivateKeyString(),
        }
        //   "mnemonic":EthWallet.getPrivateKeyString()
        //   let walletAddress = EthWallet.getAddressString()
        //   let privateKey = EthWallet.getPrivateKeyString()
        //   let privateKey = EthWallet.getPrivateKeyString()
        //   let data = { address: walletAddress, privateKey: privateKey }
        //   // console.log(data)
        //   return res(data)
        // console.log("EthWallet", w);
        // response = { "success": true, "message": "Success", data: w };
        return resolve(w);

    });
};


async function getEthBalance(address) {

    await web3.eth.getBalance(address, (err, balance) => { console.log(address + " Balance: ", web3.utils.fromWei(balance)) });

}


// getETHaddress().then(r => {
//     console.log(r)
// })

module.exports = {
    getETHaddress,
    getEtherwallet
}