var express = require('express');
var mysql = require('mysql');
var bodyParser = require('body-parser');
var axios = require('axios');
const app = express();
const { query, response } = require('express');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
const request = require('request')
const crypto = require('crypto');
const { setTimeout } = require('timers/promises');

const method = 'POST';
const baseUrl = 'https://api.latoken.com'
const endpoint = '/v2/auth/order/place'
var myVar;

var pool = mysql.createPool({
    connectionLimit: 1000, // default = 10
    host: '64.227.177.68',
    port: 3306,
    user: 'root',
    password: 'S@urabh@1234$',
    database: 'tradebot',               // this is the max number of connections before your pool starts waiting for a release
    multipleStatements: true
});

pool.getConnection(function (err, connection) {
    if (err) {
        console.log(err)
        console.log({ "first": false })
    }
    else {
        // console.log(connection)
        console.log({ "mysql connection": true })
    }
});



function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function randPrice(min, max) {
    let randomNum = Math.random() * (max - min) + min;
    return parseFloat(randomNum).toFixed(8);
}

app.post('/start', function (req, res) {
    var minQty = req.body.minQty;
    var maxQty = req.body.maxQty;
    var apiKey = req.body.apiKey;
    var apiSecret = req.body.apiSecret;

    axios.get('https://api.latoken.com/v2/book/b53ad99e-4241-4222-a24e-1826e70d8490/0c3a106d-bde3-4c13-a26e-3fd2394529e5').then(resp => {
        var ask = resp.data.ask[0].price;
        var bid = resp.data.bid[0].price;

        console.log("ask", ask);
        console.log("bid", bid);

        var quantity = getRndInteger(parseInt(minQty), parseInt(maxQty));
        let price = randPrice(parseFloat(bid), parseFloat(ask));
        console.log(quantity, price);

        cancelAllOrder(quantity, price, apiKey, apiSecret)
        callSellExchangeAPI(quantity, price, apiKey, apiSecret);
        callBuyExchangeAPI(quantity, price, apiKey, apiSecret);
        res.send("successfully");
    });
});

app.post('/sell', function (req, res) {
    var totalQuantity = req.body.qty;
    var totalPrice = req.body.price;
    const params = {
        baseCurrency: 'b53ad99e-4241-4222-a24e-1826e70d8490',
        quoteCurrency: '0c3a106d-bde3-4c13-a26e-3fd2394529e5',
        side: 'SELL',
        condition: 'GOOD_TILL_CANCELLED',
        type: 'LIMIT',
        clientOrderId: 'MySellOrder',
        price: totalPrice,
        quantity: totalQuantity,
        timestamp: Date.now()
    }
    const body = JSON.stringify(params);
    const bodySignParams = Object.entries(params).map(([key, val]) => key + '=' + val).join('&');

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(method + endpoint + bodySignParams)
        .digest('hex')

    const options = {
        method: method,
        url: baseUrl + endpoint,
        headers: {
            'Content-Type': 'application/json',
            'X-LA-APIKEY': apiKey,
            'X-LA-SIGNATURE': signature
        },
        body: body
    }

    request.post(
        options,
        async function (error, response, responseBody) {
            let result = JSON.parse(responseBody)
            let orderid = result.id
            console.log(orderid)
            await getOrderById(orderid).then((result) => {
                console.log(result)
                res.send(result)

            })
        }
    )



}) //ok

app.post('/buy', function (req, res) {
    var totalQuantity = req.body.qty;
    var totalPrice = req.body.price;

    const params = {
        baseCurrency: 'b53ad99e-4241-4222-a24e-1826e70d8490',
        quoteCurrency: '0c3a106d-bde3-4c13-a26e-3fd2394529e5',
        side: 'BUY',
        condition: 'GOOD_TILL_CANCELLED',
        type: 'LIMIT',
        clientOrderId: 'MyBuyOrder',
        price: totalPrice,
        quantity: totalQuantity,
        timestamp: Date.now()
    }
    const body = JSON.stringify(params);
    const bodySignParams = Object.entries(params).map(([key, val]) => key + '=' + val).join('&');

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(method + endpoint + bodySignParams)
        .digest('hex')

    const options = {
        method: method,
        url: baseUrl + endpoint,
        headers: {
            'Content-Type': 'application/json',
            'X-LA-APIKEY': apiKey,
            'X-LA-SIGNATURE': signature
        },
        body: body
    }

    request.post(
        options,
        async function (error, response, responseBody) {
            let result = JSON.parse(responseBody)
            let orderid = result.id
            console.log(orderid)
            await getOrderById(orderid).then((result) => {
                console.log(result)
                res.send(result)

            })
        }
    )


}) //ok

app.post('/getOrderById', function (req, res) {

    let id = req.body.orderId

    const endpoint = '/v2/auth/order/getOrder/' + id
    const method = 'GET';


    const params = {
        id: id,

    }
    const queryParams = Object.entries(params).map(([key, val]) => key + '=' + val).join('&');

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(method + endpoint + queryParams)
        .digest('hex')

    const options = {
        method: method,
        url: baseUrl + endpoint + '?' + queryParams,
        headers: {
            'X-LA-APIKEY': apiKey,
            'X-LA-SIGNATURE': signature
        }
    }

    request.get(
        options,
        async function (error, response, responseBody) {
            let data = JSON.parse(responseBody)
            let base = data.baseCurrency
            let quote = data.quoteCurrency
            var baseName;
            var quoteName;

            if (flage) {
                var baseName = await getName(base).then(
                    function (result) {
                        console.log(result)
                        flage = false
                        return result
                    },
                    function (error) {
                        return error
                    }
                );

                var quoteName = await getName(quote).then(
                    function (result) {
                        console.log(result)
                        flage = false
                        return result
                    },
                    function (error) { return error }
                );

            }

            let result = { "orderID": data.id, "price": data.price, "type": data.type, "side": data.side, "status": data.status, "orderCreatedAt": data.timestamp, "quantity": data.quantity }
            var baseSymbol = baseName.toUpperCase();
            var quoteSymbol = quoteName.toUpperCase();
            result.coin_pair = baseSymbol + "-" + quoteSymbol;
            console.log(typeof baseName, quoteName)
            res.send(result)

        }
    )
}) //ok

app.post('/getAllOrders', function (req, res) {
    const endpoint = '/v2/auth/order'
    const method = 'GET';

    const params = {
        from: Date.now(),
        limit: '50'
    }
    const queryParams = Object.entries(params).map(([key, val]) => key + '=' + val).join('&');

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(method + endpoint + queryParams)
        .digest('hex')

    const options = {
        method: method,
        url: baseUrl + endpoint + '?' + queryParams,
        headers: {
            'X-LA-APIKEY': apiKey,
            'X-LA-SIGNATURE': signature
        }
    }

    request.get(
        options,
        async function (error, response, responseBody) {
            let array = JSON.parse(response.body)
            console.log(array.length)
            var temparray = [];
            var flage = true

            for (let i = 0; i < array.length; i++) {

                let base = array[i].baseCurrency
                let quote = array[i].quoteCurrency
                var baseName;
                var quoteName;

                if (flage) {
                    var baseName = await getName(base).then(
                        function (result) {
                            // console.log(result)
                            flage = false
                            return result
                        },
                        function (error) {
                            return error
                        }
                    );

                    var quoteName = await getName(quote).then(
                        function (result) {
                            // console.log(result)
                            flage = false
                            return result
                        },
                        function (error) { return error }
                    );

                }

                let result = { "orderID": array[i].id, "price": array[i].price, "type": array[i].type, "side": array[i].side, "status": array[i].status, "orderCreatedAt": array[i].timestamp, "quantity": array[i].quantity }
                var baseSymbol = baseName.toUpperCase();
                var quoteSymbol = quoteName.toUpperCase();
                result.coin_pair = baseSymbol + "-" + quoteSymbol;

                temparray.push(result);
                if (temparray.length == array.length) {
                    console.log(temparray)
                    res.send({ "status": true, "data": temparray })
                }
            }
        }
    )
}) //ok

app.post('/getActiveOrders', async function (req, res) {
    let base = req.body.base
    let quote = req.body.quote
    let baseCode
    let quoteCode


    getCoincode(base).then(r => r).catch(error => error)
    getCoincode(quote).then(r => r).catch(error => error)
    console.log(baseCode, quoteCode)

    const baseUrl = 'https://api.latoken.com'
    const endpoint = '/v2/auth/order/pair/b53ad99e-4241-4222-a24e-1826e70d8490/0c3a106d-bde3-4c13-a26e-3fd2394529e5/active'
    const method = 'GET';

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(method + endpoint)
        .digest('hex')

    const options = {
        method: method,
        url: baseUrl + endpoint + '?',
        headers: {
            'X-LA-APIKEY': apiKey,
            'X-LA-SIGNATURE': signature
        }
    }

    // request.get(
    //     options,
    //     async function (error, response, responseBody) {
    //         let array = JSON.parse(response.body)
    //         // console.log(array)
    //         console.log(array.length)
    //         var temparray = [];
    //         var flage = true

    //         if (array.length == 0) {
    //             // console.log({ "message": "no active order" })
    //             res.send({ "message": "no active order" })

    //         } else {
    //             for (let i = 0; i < array.length; i++) {
    //                 let base = array[i].baseCurrency
    //                 let quote = array[i].quoteCurrency
    //                 var baseName;
    //                 var quoteName;

    //                 if (flage) {
    //                     var baseName = await getName(base).then(
    //                         function (result) {
    //                             console.log(result)
    //                             flage = false
    //                             return result
    //                         },
    //                         function (error) {
    //                             return error
    //                         }
    //                     );

    //                     var quoteName = await getName(quote).then(
    //                         function (result) {
    //                             console.log(result)
    //                             flage = false
    //                             return result
    //                         },
    //                         function (error) { return error }
    //                     );

    //                 }

    //                 let result = { "orderID": array[i].id, "price": array[i].price, "type": array[i].type, "side": array[i].side, "status": array[i].status, "orderCreatedAt": array[i].timestamp, "quantity": array[i].quantity }
    //                 var baseSymbol = baseName.toUpperCase();
    //                 var quoteSymbol = quoteName.toUpperCase();
    //                 result.coin_pair = baseSymbol + "-" + quoteSymbol;
    //                 console.log(typeof baseName, quoteName)

    //                 temparray.push(result);
    //                 if (temparray.length == array.length) {
    //                     console.log(result)
    //                     res.send(temparray)
    //                 }
    //             }
    //         }


    //     }
    // )
}); // ok


function getCoincode(base) {
    return new Promise(async (resolve, reject) => {
        pool.getConnection(function (err, connection) {
            var querys = 'SELECT  latoken_id FROM coins WHERE symbol= ' + "'" + base + "'"
            connection.query(querys, function (err, result, body) {
                if (err) {
                    console.log(err);
                    return;
                }
                connection.release();
                data = result[0].latoken_id
                console.log(result[0].latoken_id);
                return resolve(data)
            })
        });
    })
}

app.post('/cancelAllOrder', function (req, res) {
    console.log(req.body);
    const method = 'POST';
    const baseUrl = 'https://api.latoken.com'
    const endpoint = '/v2/auth/order/cancelAll'


    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(method + endpoint)
        .digest('hex')

    const options = {
        method: method,
        url: baseUrl + endpoint,
        headers: {
            'Content-Type': 'application/json',
            'X-LA-APIKEY': apiKey,
            'X-LA-SIGNATURE': signature
        },

    }

    request.post(
        options,
        async function (error, response, responseBody) {
            let array = JSON.parse(responseBody)
            console.log(array)
            res.send(JSON.parse(responseBody))
            // var temparray = [];
            // var flage = true

            // if (array.length == 0) {
            //     res.send({ "message": "no order for cancel" })

            // } else {
            //     for (let i = 0; i < array.length; i++) {

            //         let base = array[i].baseCurrency
            //         let quote = array[i].quoteCurrency
            //         var baseName;
            //         var quoteName;

            //         if (flage) {
            //             var baseName = await getName(base).then(
            //                 function (result) {
            //                     console.log(result)
            //                     flage = false
            //                     return result
            //                 },
            //                 function (error) {
            //                     return error
            //                 }
            //             );

            //             var quoteName = await getName(quote).then(
            //                 function (result) {
            //                     console.log(result)
            //                     flage = false
            //                     return result
            //                 },
            //                 function (error) { return error }
            //             );

            //         }

            //         let result = { "orderID": array[i].id, "price": array[i].price, "type": array[i].type, "side": array[i].side, "status": array[i].status, "orderCreatedAt": array[i].timestamp, "quantity": array[i].quantity }
            //         var baseSymbol = baseName.toUpperCase();
            //         var quoteSymbol = quoteName.toUpperCase();
            //         result.coin_pair = baseSymbol + "-" + quoteSymbol;

            //         temparray.push(result);
            //         if (temparray.length == array.length) {
            //             console.log(result)
            //             res.send({ "status": true, "data": temparray })
            //         }
            //     }

            // }
        }
    )
})   //ok


app.post('/cancelOrder', function (req, res) {

    var requestID = req.body.orderId;
    console.log(req.body);
    const method = 'POST';
    const baseUrl = 'https://api.latoken.com'
    const endpoint = '/v2/auth/order/cancel'

    const params = {
        id: requestID
    }
    const body = JSON.stringify(params);
    const bodySignParams = Object.entries(params).map(([key, val]) => key + '=' + val).join('&');

    const signature = crypto
        .createHmac('sha256', apiSecret)
        .update(method + endpoint + bodySignParams)
        .digest('hex')

    const options = {
        method: method,
        url: baseUrl + endpoint,
        headers: {
            'Content-Type': 'application/json',
            'X-LA-APIKEY': apiKey,
            'X-LA-SIGNATURE': signature
        },
        body: body
    }

    request.post(
        options,
        async function (error, response, responseBody) {
            let result = JSON.parse(responseBody)
            console.log(result)
            let orderid = result.id
            console.log(orderid)
            await getOrderById(orderid).then((result) => {
                console.log(result)
                res.send(result)

            })
        }
    )


})//ok

app.post('/bulkBuy', function (req, res) {
    var minQty = req.body.minQty;
    var maxQty = req.body.maxQty;
    var minPrice = req.body.minPrice;
    var maxPrice = req.body.maxPrice;
    var numTrade = req.body.numTrade;

    let arrayData = [];
    for (var i = 0; i < numTrade; i++) {
        var totalQuantity = getRndInteger(parseInt(minQty), parseInt(maxQty));
        let price = randPrice(parseFloat(minPrice), parseFloat(maxPrice));
        console.log(totalQuantity, price);
        var objectData = { "totalQuantity": totalQuantity, "price": price };
        arrayData.push(objectData)

    }

    const key = 'price';
    const arrayUniqueByKey = [...new Map(arrayData.map(item => [item[key], item])).values()];
    console.log(arrayUniqueByKey.length);
    var temparray = []
    for (let i = 0; i < arrayUniqueByKey.length; i++) {
        var value = arrayUniqueByKey[i];
        console.log(value)
        // await sleep(10000);
        callBuyExchangeAPI(value.totalQuantity, value.price).then(result => {
            // console.log(result)
            let orderid = result.id
            console.log(orderid)
            getOrderById(orderid).then((result) => {
                console.log(result)
                temparray.push(result);
                if (temparray.length == arrayUniqueByKey.length) {
                    res.send({ "status": true, "data": temparray })
                }


            })
        })

    }




});//ok

app.post('/bulkSell', function (req, res) {
    var minQty = req.body.minQty;
    var maxQty = req.body.maxQty;
    var minPrice = req.body.minPrice;
    var maxPrice = req.body.maxPrice;
    var numTrade = req.body.numTrade;
    let arrayData = [];
    for (var i = 0; i < numTrade; i++) {
        var totalQuantity = getRndInteger(parseInt(minQty), parseInt(maxQty));
        let price = randPrice(parseFloat(minPrice), parseFloat(maxPrice));
        console.log(totalQuantity, price);
        var objectData = { "totalQuantity": totalQuantity, "price": price };
        arrayData.push(objectData)

    }

    const key = 'price';
    const arrayUniqueByKey = [...new Map(arrayData.map(item => [item[key], item])).values()];
    console.log(arrayUniqueByKey.length);
    var temparray = [];
    for (let i = 0; i < arrayUniqueByKey.length; i++) {
        var value = arrayUniqueByKey[i];
        console.log(value)
        // await sleep(10000);
        callSellExchangeAPI(value.totalQuantity, value.price).then(result => {
            // console.log(result)
            let orderid = result.id
            console.log(orderid)
            getOrderById(orderid).then((result) => {
                console.log(result)
                temparray.push(result);
                if (temparray.length == arrayUniqueByKey.length) {
                    res.send({ "status": true, "data": temparray })
                }


            })
        })

    }

});//ok

const getName = async (code) => {
    return new Promise(function (resolve, reject) {
        pool.getConnection(async function (err, connection) {
            var query = 'SELECT symbol FROM coins WHERE latoken_id = ' + "'" + code + "'";
            connection.query(query, async function (err, result, fields) {
                if (err) {
                    return reject(Error("It broke"));
                }
                else {
                    console.log(result[0].symbol)
                    return resolve(result[0].symbol);
                }
            })
        });
    });
}



function getOrderById(id) {
    return new Promise(async (resolve, reject) => {
        const endpoint = '/v2/auth/order/getOrder/' + id
        const method = 'GET';
        const params = {
            id: id,
        }
        const queryParams = Object.entries(params).map(([key, val]) => key + '=' + val).join('&');

        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(method + endpoint + queryParams)
            .digest('hex')

        const options = {
            method: method,
            url: baseUrl + endpoint + '?' + queryParams,
            headers: {
                'X-LA-APIKEY': apiKey,
                'X-LA-SIGNATURE': signature
            }
        }

        request.get(
            options,
            async function (error, response, responseBody) {
                let data = JSON.parse(responseBody)
                let base = data.baseCurrency
                let quote = data.quoteCurrency
                var flage = true
                var baseName;
                var quoteName;

                if (flage) {
                    var baseName = await getName(base).then(
                        function (result) {
                            // console.log(result)
                            flage = false
                            return result
                        },
                        function (error) {
                            return error
                        }
                    );

                    var quoteName = await getName(quote).then(
                        function (result) {
                            // console.log(result)
                            flage = false
                            return result
                        },
                        function (error) { return error }
                    );
                    // console.log(data)
                    let result = { "orderID": data.id, "price": data.price, "type": data.type, "side": data.side, "status": data.status, "orderCreatedAt": data.timestamp, "quantity": data.quantity }
                    var baseSymbol = baseName.toUpperCase();
                    var quoteSymbol = quoteName.toUpperCase();
                    result.coin_pair = baseSymbol + "-" + quoteSymbol;
                    // console.log(result)
                    return resolve(result)
                }
            }
        )
    })
}

function cancelAllOrder(req, res) {
    return new Promise(async (resolve, reject) => {
        console.log(req.body);
        const method = 'POST';
        const baseUrl = 'https://api.latoken.com'
        const endpoint = '/v2/auth/order/cancelAll'


        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(method + endpoint)
            .digest('hex')

        const options = {
            method: method,
            url: baseUrl + endpoint,
            headers: {
                'Content-Type': 'application/json',
                'X-LA-APIKEY': apiKey,
                'X-LA-SIGNATURE': signature
            },

        }

        request.post(
            options,
            async function (error, response, responseBody) {
                let array = JSON.parse(response.body)
                console.log(array)
                // res.send(JSON.parse(response.body))
                return resolve(array)
            }
        )

    })

}

function callSellExchangeAPI(totalQuantity, totalPrice) {
    return new Promise(async (resolve, reject) => {
        var result;
        const params = {
            baseCurrency: 'b53ad99e-4241-4222-a24e-1826e70d8490',
            quoteCurrency: '0c3a106d-bde3-4c13-a26e-3fd2394529e5',
            side: 'SELL',
            condition: 'GOOD_TILL_CANCELLED',
            type: 'LIMIT',
            clientOrderId: 'MySellOrder',
            price: totalPrice,
            quantity: totalQuantity,
            timestamp: Date.now()
        }
        const body = JSON.stringify(params);
        const bodySignParams = Object.entries(params).map(([key, val]) => key + '=' + val).join('&');

        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(method + endpoint + bodySignParams)
            .digest('hex')

        const options = {
            method: method,
            url: baseUrl + endpoint,
            headers: {
                'Content-Type': 'application/json',
                'X-LA-APIKEY': apiKey,
                'X-LA-SIGNATURE': signature
            },
            body: body
        }

        request.post(options, function (error, response, responseBody) {
            result = JSON.parse(responseBody);
            console.log(JSON.parse(responseBody))
            return resolve(result);
        }
        )
    })
}

function callBuyExchangeAPI(totalQuantity, totalPrice) {
    return new Promise(async (resolve, reject) => {
        var result;

        const params = {
            baseCurrency: 'b53ad99e-4241-4222-a24e-1826e70d8490',
            quoteCurrency: '0c3a106d-bde3-4c13-a26e-3fd2394529e5',
            side: 'BUY',
            condition: 'GOOD_TILL_CANCELLED',
            type: 'LIMIT',
            clientOrderId: 'MyBuyOrder',
            price: totalPrice,
            quantity: totalQuantity,
            timestamp: Date.now()
        }
        const body = JSON.stringify(params);
        const bodySignParams = Object.entries(params).map(([key, val]) => key + '=' + val).join('&');

        const signature = crypto
            .createHmac('sha256', apiSecret)
            .update(method + endpoint + bodySignParams)
            .digest('hex')

        const options = {
            method: method,
            url: baseUrl + endpoint,
            headers: {
                'Content-Type': 'application/json',
                'X-LA-APIKEY': apiKey,
                'X-LA-SIGNATURE': signature
            },
            body: body
        }

        request.post(
            options,
            function (error, response, responseBody) {
                result = JSON.parse(responseBody);
                console.log(JSON.parse(responseBody))
                return resolve(result);
            }
        )

    })


}

console.log("Server is running on  ", "http://localhost:5000/")
app.listen(5000);