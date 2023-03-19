import axios from 'axios'

import * as yahooFinance from 'yahoo-finance'

const actions = {
    Buy: "BUY",
    Sell: "SELL",
}

const ToDate = '2023-02-01';
const FromDate = '2023-01-01';

export async function fetch_for_ticker(ticker_name) {
    const values = await yahooFinance.historical({
        symbol: ticker_name,
        from: FromDate,
        to: ToDate,
    });

    return values
        .reverse()
        .map(x => {
            return {
                date: x.date.toISOString(),
                open: x.open,
            }
        });
}
