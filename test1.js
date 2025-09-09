const axios = require('axios');

const pool = require('./dbconfig/db')

// pool.getConnection(function (err, connection) {
//     if (err) throw err
//     console.log("Database connected in app.js")

//     connection.query(`select * from user where id=${4}`, async (err, result) => {
//         if (err) throw err
//         console.log(result)
//     })
// })

const getcoinList = async (req, res) => {

    pool.getConnection(function (err, connection) {
        if (err) throw err
        console.log("Database connected in app.js")
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://api.coindcx.com/exchange/v1/markets_details',
            headers: {
                'Cookie': '__cf_bm=gEL2NSbLOW0MfJ9H1lStpvKTYQBE2PZRLTPEdufuzqs-1688538451-0-AbBaCqujoamdxNAafJ6rxILZB3szPlhuujLAF562cmt/599tVMPyZPzCeJC4clsGWG5N69zfkN3UXyS/cbRNfkg=; _cfuvid=M3bZluYDNBzJvw3psWxvhEI52PApFNWM77fqEO11DLQ-1688538451527-0-604800000'
            }
        };

        axios.request(config)
            .then((response) => {

                response.data.forEach(async (e, i) => {
                    await sleep(500 * i)
                    console.log(e.coindcx_name)
                    let records = [
                        [e.coindcx_name, e.symbol, e.pair, "0", "0", e.target_currency_name, e.target_currency_short_name, e.base_currency_name, e.base_currency_short_name, e.min_quantity, e.max_quantity_market, e.min_price, e.max_price, e.base_currency_precision, e.target_currency_precision],
                    ];
                    connection.query(
                        "insert into coins (coin, symbol, coinpair, status, active,target , targetsybl,base,basesybl , min_quantity,max_quantity,min_price,max_price,base_precision,target_precision) VALUES ?",
                        [records],
                        async (err, result, field) => {
                            if (err) throw err;
                            console.log("Coin inserted successfully", response.data.length, i)
                        })

                });
                // console.log(response.data.length);
            })
            .catch((error) => {
                console.log(error);
            });

    })
}

async function sleep(millis) {
    return new Promise((resolve) => setTimeout(resolve, millis));
}


// {
//     "coindcx_name": "EDUBTC",
//     "base_currency_short_name": "BTC",
//     "target_currency_short_name": "EDU",
//     "target_currency_name": "Open Campus",
//     "base_currency_name": "Bitcoin",
//     "min_quantity": 1.0,
//     "max_quantity": 92141578.0,
//     "max_quantity_market": 10000000.0,
//     "min_price": 1.0e-08,
//     "max_price": 1000.0,
//     "min_notional": 0.001,
//     "base_currency_precision": 8,
//     "target_currency_precision": 0,
//     "step": 1.0,
//     "order_types": [
//         "take_profit",
//         "stop_limit",
//         "market_order",
//         "limit_order"
//     ],
//     "symbol": "EDUBTC",
//     "ecode": "B",
//     "bo_sl_safety_percent": null,
//     "max_leverage": null,
//     "max_leverage_short": null,
//     "pair": "B-EDU_BTC",
//     "status": "active"
// },




