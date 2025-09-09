const axios = require('axios');
const crypto = require('crypto');

// API credentials
const apiKey = 'YOUR_API_KEY';
const apiSecret = 'YOUR_API_SECRET';

// API endpoints
const baseUrl = 'https://api.exchange.com';
const tickerEndpoint = '/api/ticker';
const orderEndpoint = '/api/orders';

// Token pair to trade
const baseToken = 'BTC';
const quoteToken = 'ETH';

// Trading parameters
const targetPrice = 0.05; // Target price to buy or sell
const quantity = 1; // Quantity to buy or sell

// Generate a random nonce for API requests
function generateNonce() {
    const nonceBytes = crypto.randomBytes(16);
    return nonceBytes.toString('hex');
}

// Generate a signature for authenticated requests
function generateSignature(nonce, url, body) {
    const hmac = crypto.createHmac('sha256', apiSecret);
    hmac.update(nonce + url + body);
    return hmac.digest('hex');
}

// Get current ticker data
async function getTicker() {
    try {
        const response = await axios.get(baseUrl + tickerEndpoint);
        return response.data;
    } catch (error) {
        console.error('Error fetching ticker:', error);
        return null;
    }
}

// Place a buy order
async function placeBuyOrder(price) {

    const nonce = generateNonce();

    const body = JSON.stringify({
        market: baseToken + quoteToken,
        side: 'buy',
        price: price,
        quantity: quantity,
        nonce: nonce
    });

    const signature = generateSignature(nonce, orderEndpoint, body);

    try {
        const response = await axios.post(baseUrl + orderEndpoint, body, {
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': apiKey,
                'Api-Signature': signature
            }
        });
        console.log('Buy order placed:', response.data);
    } catch (error) {
        console.error('Error placing buy order:', error.response.data);
    }
}

// Place a sell order
async function placeSellOrder(price) {
    const nonce = generateNonce();
    const body = JSON.stringify({
        market: baseToken + quoteToken,
        side: 'sell',
        price: price,
        quantity: quantity,
        nonce: nonce
    });
    const signature = generateSignature(nonce, orderEndpoint, body);

    try {
        const response = await axios.post(baseUrl + orderEndpoint, body, {
            headers: {
                'Content-Type': 'application/json',
                'Api-Key': apiKey,
                'Api-Signature': signature
            }
        });
        console.log('Sell order placed:', response.data);
    } catch (error) {
        console.error('Error placing sell order:', error.response.data);
    }
}

// Main bot loop
async function runBot() {
    const ticker = await getTicker();
    if (ticker) {
        const lastPrice = ticker.last_price;
        console.log('Last price:', lastPrice);

        if (lastPrice > targetPrice) {
            // Place a buy order
            await placeBuyOrder(lastPrice);
        } else if (lastPrice < targetPrice) {
            // Place a sell order
            await placeSellOrder(lastPrice);
        }
    }

    // Wait for some time before running the bot again
    setTimeout(runBot, 5000);
}

// Start the bot
// runBot();



const Binance = require('node-binance-api');
const binance = new Binance().options({
    APIKEY: 'your_api_key',
    APISECRET: 'your_api_secret',
});

const symbol = 'BTCUSDT'; // Symbol to trade (e.g., BTCUSDT)

// Function to place a market order to buy tokens
const buyTokens = (quantity) => {
    binance.marketBuy(symbol, quantity, (error, response) => {
        if (error) {
            console.error('Error buying tokens:', error);
        } else {
            console.log('Tokens bought successfully:', response);
        }
    });
};

// Function to place a market order to sell tokens
const sellTokens = (quantity) => {
    binance.marketSell(symbol, quantity, (error, response) => {
        if (error) {
            console.error('Error selling tokens:', error);
        } else {
            console.log('Tokens sold successfully:', response);
        }
    });
};

// Function to check the current token price
const checkTokenPrice = () => {
    binance.prices(symbol, (error, ticker) => {
        if (error) {
            console.error('Error getting token price:', error);
        } else {
            const tokenPrice = parseFloat(ticker[symbol]);
            console.log(`Current ${symbol} price: ${tokenPrice}`);
            // Implement your trading strategy here
            // Example strategy: Buy when price decreases by 5% and sell when price increases by 5%
            const buyPercentageThreshold = 0.95;
            const sellPercentageThreshold = 1.05;

            // Example: Buy condition
            if (tokenPrice <= buyPercentageThreshold * lastBuyPrice) {
                const buyQuantity = 0.01; // Set the desired quantity to buy
                buyTokens(buyQuantity);
                lastBuyPrice = tokenPrice;
            }

            // Example: Sell condition
            if (tokenPrice >= sellPercentageThreshold * lastBuyPrice) {
                const sellQuantity = 0.01; // Set the desired quantity to sell
                sellTokens(sellQuantity);
                lastBuyPrice = 0; // Reset last buy price
            }
        }
    });
};

// Interval in milliseconds to check token price
const checkInterval = 5000; // Every 5 seconds

let lastBuyPrice = 0; // Variable to store the last buy price

// Start the trading bot
setInterval(checkTokenPrice, checkInterval);

