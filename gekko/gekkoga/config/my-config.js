const randomExt = require('random-ext');

const configLuno = {
  stratName: 'MYNEO',

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
      from: '2022-02-06 18:11',
      // to: '2021-03-07 07:30'
    },

    candleWriter: {
      enabled: true
    },
    importer: {
      daterange: {
        // NOTE: these dates are in UTC
        from: "2022-02-06 18:11"//,to: "2022-11-11 00:00:00"
      }
    },
    simulationBalance: {
      'asset': 0.00309055,//dont change
      'currency': 1200  //dont change
    },
    slippage: 0.0001,
    feeTaker: 0.0004,
    feeMaker: 0.0002,
    feeUsing: 'taker', // maker || taker
  },
  apiUrl: 'http://localhost:3000',
  // Population size, better reduce this for larger data
  populationAmt: 8,
  // How many completely new units will be added to the population (populationAmt * variation must be a whole number!!)
  variation: 2 / 8,
  // How many components maximum to mutate at once
  mutateElements: 6,
  // How many parallel queries to run at once while using pc
  parallelqueries: 8,
  // How many parallel queries to run at once while not using pc
  // parallelqueries: 4,
  // parallelqueries: 8,
  // Min sharpe to consider in the profitForMinSharpe main objective
  minSharpe: 0.00001,
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

  candleSizes: [1, 2, 3, 4, 5, 9],
  getProperties: () => ({

    baseBuyAmbitionVal: parseFloat(randomExt.float(1.25, 0.75).toFixed(2)),
    baseSellAmbitionVal: parseFloat(randomExt.float(1.25, 0.75).toFixed(2)),
    bearBuyAmbitionVal: parseFloat(randomExt.float(1.25, 0.75).toFixed(2)),
    bearSellAmbitionVal: parseFloat(randomExt.float(1.25, 0.75).toFixed(2)),

    usingStoch: randomExt.boolean(),
    usingRsiVol: randomExt.boolean(),
    usingRsiVolOpposite: randomExt.boolean(),
    usingVWP: randomExt.boolean(),

    rsimod: parseFloat(randomExt.float(5, 0.2).toFixed(2)),

    IDLE_RSI_high: parseFloat(randomExt.float(150, 1).toFixed(1)),
    IDLE_RSI_low: parseFloat(randomExt.float(100, 1).toFixed(1)),
    BEAR_RSI_low: parseFloat(randomExt.float(100, 1).toFixed(1)),
    BEAR_RSI_high: parseFloat(randomExt.float(150, 1).toFixed(1)),
    stoch_low: parseFloat(randomExt.float(3, 0).toFixed(2)),
    stoch_high: parseFloat(randomExt.float(3, 0).toFixed(2)),
    ema: randomExt.integer(400, 1),

    IDLE_RSI: randomExt.integer(240, 1),
    IDLE_RSISLOW: randomExt.integer(240, 1),

    rsiVolume: randomExt.integer(500, 2),
    rsiVolume_low: parseFloat(randomExt.float(60, 20).toFixed(2)),
    rsiVolume_high: parseFloat(randomExt.float(80, 40).toFixed(2)),

    optInFastKPeriod: randomExt.integer(120, 2),
    optInSlowKPeriod: randomExt.integer(120, 3),
    optInSlowDPeriod: randomExt.integer(120, 3),


    candleSize: 1,// randomExt.pick(configLuno.candleSizes),//

    ambition: 0,
    historySize: 120,//randomExt.integer(193, 134),
  })
};
module.exports = configLuno;