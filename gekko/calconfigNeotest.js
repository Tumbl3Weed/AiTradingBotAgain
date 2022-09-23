// Everything is explained here:
// @link https://gekko.wizb.it/docs/commandline/plugins.html

var calconfig = {};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                          GENERAL SETTINGS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfig.debug = true; // for additional logging / debugging

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                         WATCHING A MARKET
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfig.watch = {

  // see https://gekko.wizb.it/docs/introduction/supported_exchanges.html
  exchange: 'luno',
  currency: 'ZAR',
  asset: 'XBT',
};

// calconfig.watch = {

//   // see https://gekko.wizb.it/docs/introduction/supported_exchanges.html
//   exchange: 'binance',
//   currency: 'USDT',
//   asset: 'DOGE',
// };

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING TRADING ADVICE
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfig.tradingAdvisor = {
  enabled: true,
  method: 'NEO',
  candleSize: 1,
  historySize: 2,
};

calconfig.NEO = {

  onDoge: true,
  ROC: 6,
  ROC_lvl: 0,
  SMA_long: 6,
  SMA_short: 2,
  IDLE_RSISLOW: 6,
  BULL_RSI: 2,
  IDLE_RSI: 2,
  BEAR_RSI: 2,
  stoploss_threshold: 1,
  rsimod: 1.6267563332310533,
  BULL_RSI_low: 3.803726422817988,
  IDLE_RSI_low: 45.23230798611081,
  BEAR_RSI_low: 9.473197481881213,
  BULL_RSI_high: 51.034720403633,
  IDLE_RSI_high: 59.79808324595167,
  BEAR_RSI_high: 51.96865914395773,
  rsimodEponent: 1,
  rsimodWeight: 1,
};

// MACD settings:
calconfig.MACD = {
  // EMA weight (α)
  // the higher the weight, the more smooth (and delayed) the line
  short: 10,
  long: 21,
  signal: 9,
  // the difference between the EMAs (to act as triggers)
  thresholds: {
    down: -0.025,
    up: 0.025,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 2
  }
};

calconfig.neuralnetcal = {
  method: 'adadelta',
  threshold_buy: 1.0201,

  learning_rate: 0.000079,
  momentum: 0.01,
  decay: 0.001,
  stoploss_enabled: true,
  stoploss_threshold: 0.9799,
  hodl_threshold: 0.975,
  price_buffer_len: 100,
  min_predictions: 100,
  minPredictionAccuracy: 4,

  interval: 14,

  thresholds: {
    low: 33,
    high: 40,
    persistence: 9,
  },
  bbands: {
    TimePeriod: 20,
    NbDevUp: 2,
    NbDevDn: 2
  }

};



// settings for other strategies can be found at the bottom, note that only
// one strategy is active per gekko, the other settings are ignored.

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING PLUGINS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// do you want Gekko to simulate the profit of the strategy's own advice?
calconfig.paperTrader = {
  enabled: true,
  // report the profit in the currency or the asset?
  reportInCurrency: true,
  // start balance, on what the current balance is compared with
  simulationBalance: {
    // these are in the unit types calconfigured in the watcher.
    asset: 0.1,
    currency: 1000,
  },
  // how much fee in % does each trade cost?
  feeMaker: 0.001,
  feeTaker: 0.001,
  feeUsing: 'maker',
  // how much slippage/spread should Gekko assume per trade?
  slippage: 0.001,
};

calconfig.performanceAnalyzer = {
  enabled: true,
  riskFreeReturn: 5
};

// Want Gekko to perform real trades on buy or sell advice?
// Enabling this will activate trades for the market being
// watched by `calconfig.watch`.
calconfig.trader = {
  enabled: false,
  key: 'dxxe5b4u9warg',
  secret: '8p5pceLimWYRzFuHFLrs83TE_gIRVQf1mnFjx6DBeqc',
  username: '', // your username, only required for specific exchanges.
  passphrase: '', // GDAX, requires a passphrase.
};

calconfig.eventLogger = {
  enabled: false,
  // optionally pass a whitelist of events to log, if not past
  // the eventLogger will log _all_ events.
  // whitelist: ['portfolioChange', 'portfolioValueChange']
};

// want Gekko to send a mail on buy or sell advice?

calconfig.pushbullet = {
  // sends pushbullets if true
  enabled: false,
  // Send 'Gekko starting' message if true
  sendMessageOnStart: true,
  // Send Message for advice? Recommend Flase for paper, true for live
  sendOnAdvice: true,
  // Send Message on Trade Completion?
  sendOnTrade: true,
  // For Overall P/L calc. Pass in old balance if desired, else leave '0'
  startingBalance: 0,
  // your pushbullet API key
  key: '',
  // your email
  email: 'calvin.nel00@gmail.com',
  // Messages will start with this tag
  tag: '[GEKKO Cal]'
};

calconfig.telegrambot = {
  enabled: false,
  // Receive notifications for trades and warnings/errors related to trading
  emitTrades: false,
  token: 'YOUR_TELEGRAM_BOT_TOKEN',
};

calconfig.candleWriter = {
  enabled: true
};

calconfig.adviceWriter = {
  enabled: true,
  muteSoft: false,
};

calconfig.backtestResultExporter = {
  enabled: true,
  writeToDisk: true,
  data: {
    stratUpdates: false,
    portfolioValues: false,
    stratCandles: true,
    roundtrips: true,
    trades: true
  }
};

calconfig.candleUploader = {
  enabled: false,
  url: '',
  apiKey: ''
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING ADAPTER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfig.adapter = 'sqlite';

calconfig.sqlite = {
  path: 'plugins/sqlite',

  dataDirectory: 'history',
  version: 0.1,

  journalMode: require('./web/isWindows.js') ? 'DELETE' : 'WAL',

  dependencies: []
};

// Postgres adapter example calconfig (please note: requires postgres >= 9.5):
calconfig.postgresql = {
  path: 'plugins/postgresql',
  version: 0.1,
  connectionString: 'postgres://user:pass@localhost:5432', // if default port
  database: null, // if set, we'll put all tables into a single database.
  schema: 'public',
  dependencies: [{
    module: 'pg',
    version: '7.4.3'
  }]
};

// Mongodb adapter, requires mongodb >= 3.3 (no version earlier tested)
calconfig.mongodb = {
  path: 'plugins/mongodb',
  version: 0.1,
  connectionString: 'mongodb://localhost/gekko', // connection to mongodb server
  dependencies: [{
    module: 'mongojs',
    version: '2.4.0'
  }]
};

calconfig.candleUploader = {
  enabled: false,
  url: '',
  apiKey: ''
};


calconfig.candleWriter = {
  enabled: true
};

calconfig.adviceWriter = {
  enabled: true,
  muteSoft: true,
};

calconfig.backtestResultExporter = {
  enabled: false,
  writeToDisk: true,
  data: {
    stratUpdates: false,
    portfolioValues: false,
    stratCandles: true,
    roundtrips: true,
    trades: true
  }
};
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING BACKTESTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Note that these settings are only used in backtesting mode, see here:
// @link: https://gekko.wizb.it/docs/commandline/backtesting.html

calconfig.backtest = {
  daterange: 'scan',
  daterange: {
    from: "2021-01-03 00:00:00",
    to: "2021-01-12 00:00:00"
  },
  batchSize: 50
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING IMPORTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfig.importer = {
  daterange: {
    // NOTE: these dates are in UTC
    from: "2020-01-15 00:00:00",
    to: "2021-01-20 00:00:00"
  }
};


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      OTHER STRATEGY SETTINGS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Exponential Moving Averages settings:
calconfig.DEMA = {
  // EMA weight (α)
  // the higher the weight, the more smooth (and delayed) the line
  weight: 21,
  // amount of candles to remember and base initial EMAs on
  // the difference between the EMAs (to act as triggers)
  thresholds: {
    down: -0.025,
    up: 0.025
  }
};

// PPO settings:
calconfig.PPO = {
  // EMA weight (α)
  // the higher the weight, the more smooth (and delayed) the line
  short: 12,
  long: 26,
  signal: 9,
  // the difference between the EMAs (to act as triggers)
  thresholds: {
    down: -0.025,
    up: 0.025,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 2
  }
};

// Uses one of the momentum indicators but adjusts the thresholds when PPO is bullish or bearish
// Uses settings from the ppo and momentum indicator calconfig block
calconfig.varPPO = {
  momentum: 'TSI', // RSI, TSI or UO
  thresholds: {
    // new threshold is default threshold + PPOhist * PPOweight
    weightLow: 120,
    weightHigh: -120,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 0
  }
};

// RSI settings:
calconfig.RSI = {
  interval: 14,
  thresholds: {
    low: 30,
    high: 70,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 1
  }
};

// TSI settings:
calconfig.TSI = {
  short: 13,
  long: 25,
  thresholds: {
    low: -25,
    high: 25,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 1
  }
};

// Ultimate Oscillator Settings
calconfig.UO = {
  first: {
    weight: 4,
    period: 7
  },
  second: {
    weight: 2,
    period: 14
  },
  third: {
    weight: 1,
    period: 28
  },
  thresholds: {
    low: 30,
    high: 70,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 1
  }
};

// CCI Settings
calconfig.CCI = {
  constant: 0.015, // constant multiplier. 0.015 gets to around 70% fit
  history: 90, // history size, make same or smaller than history
  thresholds: {
    up: 100, // fixed values for overbuy upward trajectory
    down: -100, // fixed value for downward trajectory
    persistence: 0 // filter spikes by adding extra filters candles
  }
};

// StochRSI settings
calconfig.StochRSI = {
  interval: 3,
  thresholds: {
    low: 20,
    high: 80,
    // How many candle intervals should a trend persist
    // before we consider it real?
    persistence: 3
  }
};

calconfig['talib-macd'] = {
  parameters: {
    optInFastPeriod: 10,
    optInSlowPeriod: 21,
    optInSignalPeriod: 9
  },
  thresholds: {
    down: -0.025,
    up: 0.025,
  }
};

calconfig['talib-macd'] = {
  parameters: {
    optInFastPeriod: 10,
    optInSlowPeriod: 21,
    optInSignalPeriod: 9
  },
  thresholds: {
    down: -0.025,
    up: 0.025,
  }
};

calconfig['tulip-adx'] = {
  optInTimePeriod: 10,
  thresholds: {
    down: -0.025,
    up: 0.025,
  }
};



calconfig['I understand that Gekko only automates MY OWN trading strategies'] = true;

module.exports = calconfig;