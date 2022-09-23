const randomExt = require('random-ext');
const configTest3 = {
    stratName: 'MYNEO',
    // stratName: 'EMAWIN',
    gekkoConfig: {
        // watch: {
        //     exchange: 'binance',
        //     currency: 'USDT',
        //     asset: 'DOGE',
        // },
        watch: {
            exchange: 'luno',
            currency: 'ZAR',
            asset: 'XBT',
        },
        daterange: {
            // daterange: 'scan',
            from: '2021-02-01 11:11',
            to: '2021-03-01 11:11'
        },

        candleWriter: {
            enabled: true
        },
        importer: {
            daterange: {
                // NOTE: these dates are in UTC
                from: "2020-02-18 22:13"//,to: "2022-11-11 00:00:00"
            }
        },
        simulationBalance: {
            'asset': 0.002,
            'currency': 1200
        },
        slippage: 0.004,
        feeTaker: 0.001,
        feeMaker: 0.001,
        feeUsing: 'taker', // maker || taker
    },
    apiUrl: 'http://localhost:3000',
    // Population size, better reduce this for larger data
    populationAmt: 16,
    // How many completely new units will be added to the population (populationAmt * variation must be a whole number!!)
    variation: 0.25,
    // How many components maximum to mutate at once
    mutateElements: 7,
    // How many parallel queries to run at once
    parallelqueries: 4,
    // Min sharpe to consider in the profitForMinSharpe main objective
    minSharpe: 0.01,
    // profit || score || profitForMinSharpe
    // score = ideas? feedback?
    // profit = recommended!
    // profitForMinSharpe = same as profit but sharpe will never be lower than minSharpe
    mainObjective: 'profit',//'profitForMinSharpe',
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

    // getProperties: () => ({
    //     lowerVal: randomExt.float(1, 0.9999),
    //     upperVal: randomExt.float(1.0001, 1),
    //     stoploss_threshold: randomExt.float(1.1, 0.9),
    //     tema: randomExt.integer(9, 2),
    //     sellPriceMod: randomExt.float(1.001, 0.999),
    //     buyPriceMod: randomExt.float(1.001, 0.999),

    //     candleSize: 1,
    //     historySize: 30,
    // })
    candleSizes: [1, 2, 3, 5, 15],
    getProperties: () => ({
        bearbullMod: randomExt.float(0.4, -0.4),

        // volumeThreshold: randomExt.float(50, 0),
        aboveZeroAmbitionMod: randomExt.float(0.9999, 0.0001),
        belowZeroAmbitionMod: randomExt.float(2, 0.02),

        baseBuyAmbitionVal: randomExt.float(1.2, 0.8),
        baseSellAmbitionVal: randomExt.float(1.2, 0.8),
        rsimod: randomExt.float(5, -1),
        rsimodBull: randomExt.float(5, -1),
        // BULL_RSI_high: randomExt.integer(100, 50),
        // BULL_RSI_low: randomExt.integer(50, 0),

        // IDLE_RSI_high: randomExt.integer(100, 50),
        // IDLE_RSI_low: randomExt.integer(50, 0),_Bear

        IDLE_RSI_high: randomExt.float(100, 50),
        IDLE_RSI_low: randomExt.float(50, 0),
        IDLE_RSI_low_Bear: randomExt.float(50, 0),
        IDLE_RSI_high_Bear: randomExt.float(100, 50),
        IDLE_RSI: randomExt.integer(50, 2),
        // volumeLength: randomExt.integer(200, 2),
        EMA_LENGTH: randomExt.integer(50, 2),
        IDLE_RSISLOW: randomExt.integer(50, 3),
        withAmbitionFeature: randomExt.boolean(),
        usingBearBull: randomExt.boolean(),
        smoothK: randomExt.integer(50, 2),
        smoothD: randomExt.integer(50, 2),
        candleSize: randomExt.pick(configTest3.candleSizes),


        ambition: 3,

        historySize: 200,

        onDoge: false,

    })

    // getProperties: () => ({//neo


    //     sellPriceMod: 1,
    //     buyPriceMod: 1,
    //     ROC: 6,
    //     rsimod: 1,
    //     ROC_lvl: 0,
    //     SMA_long: 6,
    //     BULL_RSI: 2,
    //     IDLE_RSI: 2,
    //     BEAR_RSI: 2,
    //     SMA_short: 2,
    //     IDLE_RSISLOW: 4,
    //     BEAR_RSI_low: 40,
    //     rsimodEponent: 1,
    //     BEAR_RSI_high: 60,
    //     stoploss_threshold: 1,

    //     // stoploss_threshold: 1,

    //     // rsimodEponent: 1,
    //     // rsimod: 1,

    //     // // BULL_RSI_high: randomExt.integer(100, 50),
    //     // // BULL_RSI_low: randomExt.integer(50, 0),

    //     // // IDLE_RSI_high: randomExt.integer(100, 50),
    //     // // IDLE_RSI_low: randomExt.integer(50, 0),

    //     // BEAR_RSI_high: Math.round(randomExt.float(100, 50) * 100) / 100,
    //     // BEAR_RSI_low: Math.round(randomExt.float(50, 0) * 100) / 100,
    //     // sellPriceMod: randomExt.float(1.001, 0.999),
    //     // buyPriceMod: randomExt.float(1.001, 0.999),


    //     // IDLE_RSISLOW: 4,
    //     // BEAR_RSI: 2,
    //     candleSize: 1,
    //     historySize: 30,
    // })
};

module.exports = configTest3;
