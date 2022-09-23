const randomExt = require('random-ext');

const configBinance = {
    stratName: 'MYNEO',
    gekkoConfig: {
        watch: {
            exchange: 'binance',
            currency: 'USDT',
            asset: 'DOGE',
        },
        daterange: {
            daterange: 'scan',
            from: '2021-02-01 07:26',
            to: '2021-02-04 19:20'
        },
        candleWriter: {
            enabled: true
        },
        importer: {
            daterange: {
                // NOTE: these dates are in UTC
                from: "2020-11-01 00:00:00",
                to: "2022-11-11 00:00:00"
            }
        },
        simulationBalance: {
            'asset': 0.02,
            'currency': 1200
        },
        slippage: 0.01,
        feeTaker: 0.001,
        feeMaker: 0.001,
        feeUsing: 'taker', // maker || taker
    },
    apiUrl: 'http://localhost:3000',
    // Population size, better reduce this for larger data
    populationAmt: 12,
    // How many completely new units will be added to the population (populationAmt * variation must be a whole number!!)
    variation: 0.25,
    // How many components maximum to mutate at once
    mutateElements: 3,
    // How many parallel queries to run at once
    parallelqueries: 3,
    // Min sharpe to consider in the profitForMinSharpe main objective
    minSharpe: 0.01,
    // profit || score || profitForMinSharpe
    // score = ideas? feedback?
    // profit = recommended!
    // profitForMinSharpe = same as profit but sharpe will never be lower than minSharpe
    mainObjective: 'profitForMinSharpe',//'profitForMinSharpe',
    // optionally recieve and archive new all time high every new all time high
    notifications: {
        email: {
            enabled: false,
            receiver: 'destination@some.com',
            senderservice: 'gmail',
            sender: 'origin@gmail.com',
            senderpass: 'password',
        },
    },
    getProperties: () => ({//neoga

        stoploss_threshold: randomExt.float(1, 0.92),

        volumeThreshold: randomExt.float(1, 0),
        aboveZeroAmbitionMod: randomExt.float(0.9, 0.01),
        belowZeroAmbitionMod: randomExt.float(1, 0.2),

        baseBuyAmbitionVal: randomExt.float(1.03, 1),

        baseSellAmbitionVal: randomExt.float(1, 0.97),
        rsimod: randomExt.float(2, 0),

        // BULL_RSI_high: randomExt.integer(100, 50),
        // BULL_RSI_low: randomExt.integer(50, 0),

        // IDLE_RSI_high: randomExt.integer(100, 50),
        // IDLE_RSI_low: randomExt.integer(50, 0),

        IDLE_RSI_high: randomExt.float(100, 40),
        IDLE_RSI_low: randomExt.float(60, 0),

        onDoge: true,

        usingBearBull: true,
        ambition: 0,
        candleSize: 1,
        historySize: 30,
        IDLE_RSISLOW: 3,
        IDLE_RSI: 2,
    })
    //     getProperties: () => ({//neo

    //     stoploss_threshold: randomExt.float(1, 0.92),

    //     rsimodEponent: randomExt.float(3, 0.5),
    //     rsimod: randomExt.float(2, 0),

    //     // BULL_RSI_high: randomExt.integer(100, 50),
    //     // BULL_RSI_low: randomExt.integer(50, 0),

    //     // IDLE_RSI_high: randomExt.integer(100, 50),
    //     // IDLE_RSI_low: randomExt.integer(50, 0),

    //     BEAR_RSI_high: Math.round(randomExt.float(100, 30) * 100) / 100,
    //     BEAR_RSI_low: Math.round(randomExt.float(70, 0) * 100) / 100,
    //     sellPriceMod: randomExt.float(1.001, 0.999),
    //     buyPriceMod: randomExt.float(1.001, 0.999),

    //     candleSize: 1,
    //     historySize: 30,
    //     rsimodWeight: 1,
    //     lastAction: '',
    //     ROC: 6,
    //     ROC_lvl: 0,
    //     SMA_long: 6,
    //     SMA_short: 2,
    //     IDLE_RSISLOW: 4,
    //     BULL_RSI: 2,
    //     IDLE_RSI: 2,
    //     BEAR_RSI: 2,
    // })
};

module.exports = configBinance;