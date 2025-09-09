const fetch = require("node-fetch");
const express = require("express");
// const { strategyGenerator } = require("./StrategyMachine");
const { emailNotification } = require("./EmailNotification");

const app = express();
const port = 3000;
const token = "YOUR TOKEN HERE";


const strategyGenerator = async (stockInfo) => {
    const selectedStocks = [];
    for (let stock in stockInfo) {
        const stockDetails = stockInfo[stock];
        const chart = stockDetails.chart;
        const stockPriceArray = [];
        for (let item of chart) {
            stockPriceArray.push(item.close);
        }
        const lowestPrice = Math.min(...stockPriceArray);
        const todayChart = chart[0];
        const todayPrice = todayChart.close;
        console.log(stock, " Today price :", todayPrice, " lowest price :", lowestPrice);
        if (todayPrice === lowestPrice) {
            selectedStocks.push(stock);
        }
    }
    return selectedStocks;
};

const getStockData = async () => {
    fetch(
        `https://cloud.iexapis.com/stable/stock/market/batch?symbols=aapl,fb&types=chart&range=1m&last=30&token=${token}`
    )
        .then(async (res) => res.json())
        .then(async (stockData) => {
            const selectedStocks = await strategyGenerator(stockData);
            await emailNotification(selectedStocks);
        });
};

const dayInMillseconds = 86400 * 1000;
setInterval(getStockData, dayInMillseconds);

app.listen(port, () => {
    console.log(`Algorithm Trading App listening at http://localhost:${port}`);
});