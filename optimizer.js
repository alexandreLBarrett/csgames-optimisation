import { fetch_for_ticker } from "./calls.js";
import * as fs from 'fs'
import * as path from 'path'

const tickers = ['AAL','DAL','UAL','LUV','HA']
//const tickers = ['GOOG', 'AMZN', 'META', 'MSFT', 'AAPL']

async function load_all_data() {
    let datas ={}
    for (let ticker of tickers) {
        if (fs.existsSync(`data/${ticker}.json`)) {
            datas[ticker] = JSON.parse(fs.readFileSync(`data/${ticker}.json`))
        } else {
            const data = await fetch_for_ticker(ticker);
            fs.writeFileSync(`data/${ticker}.json`, JSON.stringify(data, null, 2))
            datas[ticker] = data
        }
    }
    return datas;
}

function getDiff(data, ticker, start, end) {
    return data[ticker][end].open - data[ticker][start].open
}

function getBestActionForSingleDay(data, start, end) {
    let maxVal = 0
    let maxTicker = null
    for (let ticker of tickers) {
        const diff = getDiff(data, ticker, start, end)
        if (diff > maxVal) {
            maxTicker = ticker
            maxVal = diff
        }
    }
    return maxTicker
}

const data = await load_all_data();

const len = data[tickers[0]].length

let bests = []
let baught = null;

function sell(current_date) {
    let transaction = {
        date: current_date,
        action: "SELL",
        ticker: baught.ticker
    }
    bests.push(transaction)
    baught = null
}

function buy(current_date, bestToday) {
    let transaction = {
        date: current_date,
        action: "BUY",
        ticker: bestToday
    }
    bests.push(transaction)
    baught = transaction
}

for (let i = 0; i < len - 1; i++) {
    const current_date = data[tickers[0]][i].date.split('T')[0]

    if (baught !== null) {
        const todayDiff = getDiff(data, baught.ticker, i, i + 1)
        if (todayDiff < 0) {
            sell(current_date);
        } else {
            const bestTomorrow = getBestActionForSingleDay(data, i + 1, Math.min(i + 2, len - 1))
            // if (bestTomorrow !== null && bestTomorrow !== baught.ticker) {
            //     const baughtTomorrowDiff = getDiff(data, baught.ticker, i + 1, Math.min(i + 1, len - 1))
            //     const tomorrowDiff = getDiff(data, bestTomorrow, i + 1, Math.min(i + 5, len - 1))
            //     if (tomorrowDiff > todayDiff + baughtTomorrowDiff) {
            //         sell(current_date);
            //     }
            // }
        }
    } else {
        const bestToday = getBestActionForSingleDay(data, i, i + 1)
        if (bestToday !== null) {
            buy(current_date, bestToday)
        }
    }
}

if (baught !== null) {
    const dat = data[tickers[0]][len - 1].date.split('T')[0];
    sell(dat)
}

console.log(bests)