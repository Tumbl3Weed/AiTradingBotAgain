const randomExt = require('random-ext');

const config = {
    stratName: 'MYNEOGA',

    gekkoConfig: {


        // watch: {
        //   exchange: 'binance',
        //   currency: 'USDT',
        //   asset: 'DOGE',
        // },
        // daterange: {
        //   daterange: 'scan',
        //   from: '2021-02-02 19:20',
        //   to: '2021-02-04 19:20'
        // },


        watch: {
            exchange: 'luno',
            currency: 'ZAR',
            asset: 'XBT',
        },

        daterange: {
            // daterange: 'scan',
            from: '2021-02-02 06:44',
            to: '	2021-02-05 21:44'
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
            'asset': 0,
            'currency': 1200
        },

        slippage: 0.01,
        feeTaker: 0.01,
        feeMaker: 0.01,
        feeUsing: 'taker', // maker || taker

    },
    apiUrl: 'http://localhost:3000',

    // Population size, better reduce this for larger data
    populationAmt: 4,

    // How many completely new units will be added to the population (populationAmt * variation must be a whole number!!)
    variation: 0.25,

    // How many components maximum to mutate at once
    mutateElements: 2,

    // How many parallel queries to run at once
    parallelqueries: 1,

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



    /*SMA_long = 150
  SMA_short = 40
   
  # BULL
  BULL_RSI = 10
  BULL_RSI_high = 80
  BULL_RSI_low = 50
   
  # IDLE
  IDLE_RSI = 12
  IDLE_RSI_high = 65
  IDLE_RSI_low = 39
   
  # BEAR
  BEAR_RSI = 15
  BEAR_RSI_high = 50
  BEAR_RSI_low = 25
   
  # ROC
  ROC = 6
  ROC_lvl = 0
   
  # BULL/BEAR is defined by the longer SMA trends
  # if SHORT over LONG = BULL
  # if SHORT under LONG = BEAR
   
  # ROC is the LENGHT (averaging)
  # Leave ROC_lvl at 0 otherwise Results are negative*/



    getProperties: () => ({//neo
        ROC: 6,
        ROC_lvl: 0,

        SMA_long: randomExt.integer(20, 3),
        SMA_short: randomExt.integer(10, 2),

        historySize: 30,

        IDLE_RSISLOW: randomExt.integer(20, 3),

        BULL_RSI: randomExt.integer(10, 2),
        BULL_RSI_high: randomExt.float(100, 50),
        BULL_RSI_low: randomExt.float(50, 0),

        IDLE_RSI: randomExt.integer(10, 2),
        IDLE_RSI_high: randomExt.float(100, 50),
        IDLE_RSI_low: randomExt.float(50, 0),

        BEAR_RSI: randomExt.integer(10, 2),
        BEAR_RSI_high: randomExt.float(100, 50),
        BEAR_RSI_low: randomExt.float(50, 0),

        rsimod: randomExt.float(2, 1),

        candleSize: randomExt.integer(5, 1)
    })
};

module.exports = config;
