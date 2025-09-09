
function getRndInteger(min, max) {
    console.log(Math.floor(Math.random() * (max - min)) + min)
    return Math.floor(Math.random() * (max - min)) + min;
}


function randSellPrice(min, max) {
    let rannum = Math.random().toFixed(6)
    let randomNum = rannum * (max * 2 - min * 2) / 1.9 + min;

    console.log(parseFloat(randomNum).toFixed(6), "----", rannum, "-----", rannum * (max * 2 - min * 2) / 1.9 + min)
    return parseFloat(randomNum).toFixed(6);
}

function randBuyPrice(min, max) {
    let rannum = Math.random().toFixed(6)
    let randomNum = rannum * (max / 2 - min / 2) / 4.7 + min;

    console.log(parseFloat(randomNum).toFixed(6), "----", rannum, "-----", rannum * (max / 2 - min / 2) / 4.7 + min)
    return parseFloat(randomNum).toFixed(6);
}


randSellPrice(100, 200) //big
randBuyPrice(100, 200) //low
getRndInteger(1000, 5000) //low