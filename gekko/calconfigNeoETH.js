// Everything is explained here:
// @link https://gekko.wizb.it/docs/commandline/plugins.html

var calconfigNeoBTC = {};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                          GENERAL SETTINGS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigNeoBTC.debug = true; // for additional logging / debugging

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                         WATCHING A MARKET
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigNeoBTC.watch = {

  // see https://gekko.wizb.it/docs/introduction/supported_exchanges.html
  exchange: 'luno',
  currency: 'ZAR',
  asset: 'ETH',
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigNeoBTCURING TRADING ADVICE
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigNeoBTC.tradingAdvisor = {
  enabled: true,
  method: 'NEO',
  candleSize: 1,
  historySize: 10,
};

calconfigNeoBTC.NEO = {

  SMA_long: 9,
  SMA_short: 5,


  BULL_RSI: 5,
  BULL_RSI_high: 84,
  BULL_RSI_low: 62,


  IDLE_RSI: 6,
  IDLE_RSI_high: 60,
  IDLE_RSI_low: 39,

  BEAR_RSI: 8,
  BEAR_RSI_high: 45,
  BEAR_RSI_low: 25,

  ROC: 6,
  ROC_lvl: 0,

};

// settings for other strategies can be found at the bottom, note that only
// one strategy is active per gekko, the other settings are ignored.

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigNeoBTCURING PLUGINS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// do you want Gekko to simulate the profit of the strategy's own advice?
calconfigNeoBTC.paperTrader = {
  enabled: false,
  // report the profit in the currency or the asset?
  reportInCurrency: true,
  // start balance, on what the current balance is compared with
  simulationBalance: {
    // these are in the unit types calconfigNeoBTCured in the watcher.
    asset: 1,
    currency: 446403,
  },
  // how much fee in % does each trade cost?
  feeMaker: 0.00,
  feeTaker: 0.001,
  feeUsing: 'maker',
  // how much slippage/spread should Gekko assume per trade?
  slippage: 0.0035,
};

calconfigNeoBTC.performanceAnalyzer = {
  enabled: true,
  riskFreeReturn: 5
};

// Want Gekko to perform real trades on buy or sell advice?
// Enabling this will activate trades for the market being
// watched by `calconfigNeoBTC.watch`.
calconfigNeoBTC.trader = {
  enabled: true,
  key: 'dxxe5b4u9warg',
  secret: '8p5pceLimWYRzFuHFLrs83TE_gIRVQf1mnFjx6DBeqc',
  username: '', // your username, only required for specific exchanges.
  passphrase: '', // GDAX, requires a passphrase.
};

calconfigNeoBTC.eventLogger = {
  enabled: false,
  // optionally pass a whitelist of events to log, if not past
  // the eventLogger will log _all_ events.
  // whitelist: ['portfolioChange', 'portfolioValueChange']
};

// want Gekko to send a mail on buy or sell advice?

calconfigNeoBTC.pushbullet = {
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

calconfigNeoBTC.telegrambot = {
  enabled: false,
  // Receive notifications for trades and warnings/errors related to trading
  emitTrades: false,
  token: 'YOUR_TELEGRAM_BOT_TOKEN',
};

calconfigNeoBTC.candleWriter = {
  enabled: true
};

calconfigNeoBTC.adviceWriter = {
  enabled: true,
  muteSoft: true,
};

calconfigNeoBTC.backtestResultExporter = {
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

calconfigNeoBTC.candleUploader = {
  enabled: false,
  url: '',
  apiKey: ''
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigNeoBTCURING ADAPTER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigNeoBTC.adapter = 'sqlite';

calconfigNeoBTC.sqlite = {
  path: 'plugins/sqlite',

  dataDirectory: 'history',
  version: 0.1,

  journalMode: require('./web/isWindows.js') ? 'DELETE' : 'WAL',

  dependencies: []
};

// Postgres adapter example calconfigNeoBTC (please note: requires postgres >= 9.5):
calconfigNeoBTC.postgresql = {
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
calconfigNeoBTC.mongodb = {
  path: 'plugins/mongodb',
  version: 0.1,
  connectionString: 'mongodb://localhost/gekko', // connection to mongodb server
  dependencies: [{
    module: 'mongojs',
    version: '2.4.0'
  }]
};

calconfigNeoBTC.candleUploader = {
  enabled: false,
  url: '',
  apiKey: ''
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigNeoBTCURING BACKTESTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Note that these settings are only used in backtesting mode, see here:
// @link: https://gekko.wizb.it/docs/commandline/backtesting.html

calconfigNeoBTC.backtest = {
  daterange: 'scan',
  // daterange: {
  //   from: "2020-03-01",
  //   to: "2030-04-28"
  //},
  batchSize: 1
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigNeoBTCURING IMPORTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigNeoBTC.importer = {
  daterange: {
    // NOTE: these dates are in UTC
    from: "2017-11-01 00:00:00",
    to: "2022-11-20 00:00:00"
  }
};


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      OTHER STRATEGY SETTINGS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigNeoBTC['talib-macd'] = {
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

calconfigNeoBTC['talib-macd'] = {
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

calconfigNeoBTC['tulip-adx'] = {
  optInTimePeriod: 10,
  thresholds: {
    down: -0.025,
    up: 0.025,
  }
};



calconfigNeoBTC['I understand that Gekko only automates MY OWN trading strategies'] = true;

module.exports = calconfigNeoBTC;