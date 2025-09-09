const web3 = require('web3');
const Binance = require('binance-api-node').default
// // Initialize a web3 instance with the BSC provider
// const providerUrl = 'https://bsc-dataseed1.binance.org'; // Replace with your preferred BSC provider
// const web3 = new Web3(providerUrl);

// // Address and contract information
// const tokenAddress = '0xTOKENADDRESS'; // Replace with the BEP-20 token address
// const userAddress = '0xUSERADDRESS'; // Replace with the user's address

// // Contract ABI (Application Binary Interface) of the BEP-20 token
// const tokenABI = [
//     // Standard ERC-20 functions
//     {
//         constant: true,
//         inputs: [{ name: '_owner', type: 'address' }],
//         name: 'balanceOf',
//         outputs: [{ name: 'balance', type: 'uint256' }],
//         payable: false,
//         stateMutability: 'view',
//         type: 'function',
//     },
// ];

// // Create a contract instance
// const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

// // Fetch the balance of the BEP-20 token
// async function fetchTokenBalance() {
//     try {
//         const balance = await tokenContract.methods.balanceOf(userAddress).call();
//         console.log(`Token balance of ${userAddress}: ${balance}`);
//     } catch (error) {
//         console.error('Error fetching token balance:', error);
//     }
// }

// Call the function to fetch the token balance
// fetchTokenBalance();

// const Binance = require('binance-api-node');

// // Initialize a Binance client
// const client = Binance();

// // Address and contract information
// const tokenAddress = '0x55d398326f99059ff775485246999027b3197955'; // Replace with the BEP-20 token address
// const userAddress = '0xedcbcfebbb706345afbf1f6e30b5c971604cc352'; // Replace with the user's address

// // Fetch the balance of the BEP-20 token
// async function fetchTokenBalance() {
//     try {
//         const balance = await client.getTokenBalance(tokenAddress, userAddress);
//         console.log(`Token balance of ${userAddress}: ${balance}`);
//     } catch (error) {
//         console.error('Error fetching token balance:', error);
//     }
// }

// // Call the function to fetch the token balance
// fetchTokenBalance();



const busdAddress = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
const holderAddress = "0x8894e0a0c962cb723c1976a4421c95949be2d4e3";

// just the `balanceOf()` is sufficient in this case
const abiJson = [
    { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" },
];


const getBal = async () => {
    const contract = await new web3.eth.Contract(abiJson, busdAddress);

    const balance = await contract.methods.balanceOf(holderAddress).call();
    // note that this number includes the decimal places (in case of BUSD, that's 18 decimal places)
    console.log(balance);
}

// getBal()



// Initialize a Binance client
const client = Binance();

// Binance wallet address
const addresss = 'your_wallet_address'; // Replace with the Binance wallet address you want to check
const address = '0xedcbcfebbb706345afbf1f6e30b5c971604cc352';

// Fetch the USDT balance
async function fetchUSDTBalance() {
    try {
        const balances = await client.accountInfo({ address });
        const usdtBalance = balances.balances.find((balance) => balance.asset === 'USDT');
        console.log(`USDT balance of ${address}: ${usdtBalance.free}`);
    } catch (error) {
        console.error('Error fetching USDT balance:', error);
    }
}

// Call the function to fetch the USDT balance
fetchUSDTBalance();

