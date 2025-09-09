const axios = require('axios');
const pool = require('../dbconfig/db')

const getCandleDetail = (req, res) => {
    let { target, base } = req.body;
    // let { interval, limit } = req.body;
    // let target = 'waves'
    // let base = 'USDT'
    pool.getConnection(function (err, connection) {
        if (err) throw err
        try {
            // console.log("Database connected in app.js")
            let sql = `SELECT * FROM coins where basesybl='${base}' and targetsybl='${target}' and active=${1}`
            connection.query(sql, async (err, result) => {
                if (err) throw err
                if (!result || result.length < 1) {
                    console.log("coin is not active")
                } else {
                    // console.log(result)
                    console.log(result.length)
                    let config = {
                        method: 'get',
                        maxBodyLength: Infinity,
                        // url: `https://public.coindcx.com/market_data/candles?pair=B-${target}_${base}&interval=1m&limit=10`,
                        url: `https://public.coindcx.com/market_data/candles?pair=${result[0].coinpair}&interval=1m&limit=10`,
                        headers: {
                            'Cookie': '__cf_bm=xENnrKYJMR3.X3rTcwyVFSjzIzd0O..ITQQToRoxUko-1688543137-0-AZE9TvT2JzqIjRDpMqHeXFu0wXu+hdEgCj/v9vaE+4jmQGBqN98srzBrPWboXmctvQ8TDRd+yOXskRp+LBnm1gQ=; _cfuvid=M3bZluYDNBzJvw3psWxvhEI52PApFNWM77fqEO11DLQ-1688538451527-0-604800000'
                        }
                    };

                    axios.request(config)
                        .then((response) => {
                            console.log(response.data.length);
                            res.send(response.data)
                        })
                        .catch((error) => {
                            console.log(error);
                        });
                }
            })
        } catch (error) {
            console.log(error)

        } finally {
            connection.release()
        }

    })

}

const getBaseCoinList = (req, res) => {
    let basesybl = req.body.base;
    // let basesybl = "USDT";
    pool.getConnection(function (err, connection) {
        if (err) throw err
        try {
            // console.log("Database connected in app.js")
            let sql = `SELECT * FROM coins where basesybl='${basesybl}' and active=${1}` // 
            connection.query(sql, async (err, result) => {
                if (err) throw err
                // console.log(result)
                console.log(result.length)
                res.send(result)
            })

        } catch (error) {
            console.log(error)

        } finally {
            connection.release()
        }
    })
}

const getCoinStatus = (req,res) => {
    let { target, base } = req.body;
    // let target = 'Waves'
    // let base = 'USDT'
    pool.getConnection(function (err, connection) {
        if (err) throw err
        try {
            // console.log("Database connected in app.js")
            let sql = `SELECT * FROM coins where basesybl='${base}' and targetsybl='${target}' and active=${1}`
            connection.query(sql, async (err, result) => {
                if (err) throw err
                if (!result || result.length < 1) {
                    console.log("coin is not active")
                } else {
                    // console.log(result)
                    console.log(result.length)
                    res.send(result)
                }
            })

        } catch (error) {
            console.log(error)

        } finally {
            connection.release()
        }
    })

}

const getMarketTicker = () => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://api.coindcx.com/exchange/ticker',
        headers: {
            'Cookie': '__cf_bm=Rvd0R..EU5Ii.bJ9rNPzz_Psnp1nkmj7ynIo4dvHgHU-1688552778-0-Afy/1FN4o1VIf7Fuo5H7PQ2jDKbt9R9MTBqwSlUWj7XpYuOmil5fdkossbWVGn9eZjbXMwEMV/pzEbNCP/stHQE=; _cfuvid=M3bZluYDNBzJvw3psWxvhEI52PApFNWM77fqEO11DLQ-1688538451527-0-604800000'
        }
    };

    axios.request(config)
        .then((response) => {
            console.log(JSON.stringify(response.data));
        })
        .catch((error) => {
            console.log(error);
        });
}




module.exports = {
    getCandleDetail,
    getBaseCoinList,
    getCoinStatus,
}




