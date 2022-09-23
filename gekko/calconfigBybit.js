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
  exchange: 'bybit',
  currency: 'USD',
  asset: 'BTC',
};
// calconfig.watch = {
//   // see https://gekko.wizb.it/docs/introduction/supported_exchanges.html
//   exchange: 'luno',
//   currency: 'ZAR',
//   asset: 'XRP',
// };
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING TRADING ADVICE
// calconfig.tradingAdvisor = {
//   enabled: true,
//   method: 'neuralnetcalRFL',
//   candleSize: 1,
//   historySize: 100,
// };
// calconfig.neuralnetcalRFL = {
//   method: 'adadelta',
//   threshold_buy: 1.0001,
//  threshold_sell: -0.25,
//   experience_size: 9000,
//   learning_rate: 0.000079,
//   momentum: 0.01,
//   decay: 0.001,
//   stoploss_enabled: true,
//   stoploss_threshold: 0.9999,
//   hodl_threshold: 0.975,
//   min_predictions: 20,
//   interval: 14,
//   thresholds: {
//     low: 40,
//     high: 40,
//     persistence: 9,
//   },
// };

calconfig.NEOGABYBIT = {
  // rsimod: 0.8577512549116797,
  // volumeLength: 10,
  // onDoge: false,
  // ambition: 0,
  // IDLE_RSI: 2,
  // IDLE_RSI_low: 8.248320545208202,
  // IDLE_RSISLOW: 3,
  // IDLE_RSI_high: 91.12033716577221,
  // usingBearBull: true,
  // volumeThreshold: 0.6895450447162945,
  // stoploss_threshold: 0.9422484042189836,
  // baseBuyAmbitionVal: 1.0269214591195321,
  // baseSellAmbitionVal: 0.9788221729463534,
  // aboveZeroAmbitionMod: 0.5057921486417312,
  // belowZeroAmbitionMod: 0.44032793330617664,
  // bearbullMod: 0,
  // prevPrice: 0
  rsimod: 0.7468955229751808, onDoge: false, IDLE_RSI: 3, usingVWP: false, ambition: 0.13804727694811203, rsiVolume: 18, rsimodBull: 1.7156150690726122, dma_length: 35, sma_weight: 27, EMA_LENGTH: 6, candleSize: 1, bearbullMod: -5, historySize: 60, rsiTooLowVal: 63.44613385591171, IDLE_RSI_low: 48.1236732879949, BEAR_RSI_low: 49.351710782028455, IDLE_RSISLOW: 30, rsiTooHighVal: 81.57576633149857, IDLE_RSI_high: 53.73144203353416, BEAR_RSI_high: 93.36575155713413, thresholds_up: 0.9193858133141097, rsiVolume_low: 38.816893975782605, rsiVolume_high: 86.14733705318258, thresholds_down: 1.4421233643473341, rsiVolume_method: 2, baseBuyAmbitionVal: 1.0462984746709088, baseSellAmbitionVal: 0.9610388713014333, withAmbitionFeature: 2, aboveZeroAmbitionMod: 0.85, belowZeroAmbitionMod: 1, prevPrice: 737500, lastTrade: 'sell', sameSideCount: 1, previousAmountOfAsset: 0.00144

  // NEOGA 2021/04/13
  // rsimod: 1.3135287720329831, onDoge: false, smoothK: 11, smoothD: 13, IDLE_RSI: 12, ambition: -4.508016695299716, prevPrice: 856326, rsimodBull: 0.9760468893821219, EMA_LENGTH: 3, candleSize: 1,
  // bearbullMod: -0.22413286881340577, historySize: 60, IDLE_RSI_low: 46.49866462133291, IDLE_RSISLOW: 6, IDLE_RSI_high: 57.19078940376842, usingBearBull: true, IDLE_RSI_low_Bear: 39.866928660762746, baseBuyAmbitionVal: 1.0324176136835717, IDLE_RSI_high_Bear: 50.60049638333073, baseSellAmbitionVal: 0.8085279922973405,
  // withAmbitionFeature: false, aboveZeroAmbitionMod: 0.16827339331152105, belowZeroAmbitionMod: 0.25771633038957636
  //rsimod: 0.3646003735839316, onDoge: false, IDLE_RSI: 10, ambition: 0, rsimodBull: 0.9003393540534614, EMA_LENGTH: 43, candleSize: 60, bearbullMod: -0.05448973279672003, historySize: 100, IDLE_RSI_low: 38.17852656664715, volumeLength: 88, IDLE_RSISLOW: 15, IDLE_RSI_high: 92.1106306884713, usingBearBull: true, volumeThreshold: 14.47901101459096, baseBuyAmbitionVal: 1.0010592775346459, baseSellAmbitionVal: 1.0153067736616774, aboveZeroAmbitionMod: 0.8402579237937636, belowZeroAmbitionMod: 0.688747009083857
  // rsimod: 0.08045111437311459, onDoge: false, ambition: 0, IDLE_RSI: 9, EMA_LENGTH: 10, rsimodBull: 0.18687569468769416, candleSize: 1, bearbullMod: -0.059866340544041344, historySize: 100, volumeLength: 75, IDLE_RSI_low: 45.17806085738598, IDLE_RSISLOW: 3, IDLE_RSI_high: 78.00321009983986, usingBearBull: true, volumeThreshold: 23.4441076062751, baseBuyAmbitionVal: 0.9805950017036809, baseSellAmbitionVal: 0.999454252919316, aboveZeroAmbitionMod: 0.6252976610219889, belowZeroAmbitionMod: 1.7742528177025723
};
calconfig.tradingAdvisor = {
  enabled: true,
  method: 'NEOGABYBIT',//'NEOGA',
  candleSize: calconfig.NEOGABYBIT.candleSize,
  historySize: 60 * 12,
};
// calconfig.MYNEOGA = {
//   rsimod: 0.8577512549116797,
//   onDoge: false,
//   ambition: 0,
//   IDLE_RSI: 2,
//   IDLE_RSI_low: 8.248320545208202,
//   IDLE_RSISLOW: 3,
//   IDLE_RSI_high: 91.12033716577221,
//   usingBearBull: true,
//   volumeThreshold: 0.6895450447162945,
//   stoploss_threshold: 0.9422484042189836,
//   baseBuyAmbitionVal: 1.0269214591195321,
//   baseSellAmbitionVal: 0.9788221729463534,
//   aboveZeroAmbitionMod: 0.5057921486417312,
//   belowZeroAmbitionMod: 0.44032793330617664,
//   bearbullMod: 0,
// };
// calconfig.tradingAdvisor = {
//   enabled: true,
//   method: 'NEO',
//   candleSize: 1,
//   historySize: 30,
// };
// calconfig.NEO = {
//   SMA_long: 3,
//   SMA_short: 2,
//   BULL_RSI: 2,
//   BULL_RSI_high: 70,
//   BULL_RSI_low: 30,
//   rsimod: 1.3202523215241384,
//   IDLE_RSI: 10,
//   candleSize: 1,
//   historySize: 30,
//   buyAmbition: false,
//   IDLE_RSISLOW: 3,
//   IDLE_RSI_low: 44.071888908951586,
//   sellAmbition: false,
//   IDLE_RSI_high: 51.442026446531784,
//   baseBuyAmbitionVal: 1.382744719975786,
//   baseSellAmbitionVal: 0.7493876427832505,
//   aboveZeroAmbitionMod: 0.39053700894174437,
//   belowZeroAmbitionMod: 1.5185857236622051,
//   BEAR_RSI: 2,
//   BEAR_RSI_high: 72,
//   BEAR_RSI_low: 10,
//   ROC: 6,
//   ROC_lvl: 0,
// };
// settings for other strategies can be found at the bottom, note that only
// one strategy is active per gekko, the other settings are ignored.
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING PLUGINS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// do you want Gekko to simulate the profit of the strategy's own advice?
calconfig.paperTrader = {
  enabled: false,
  // report the profit in the currency or the asset?
  reportInCurrency: true,
  // start balance, on what the current balance is compared with
  simulationBalance: {
    // these are in the unit types calconfigured in the watcher.
    asset: 1,
    currency: 446403,
  },
  // how much fee in % does each trade cost?
  feeMaker: 0.00,
  feeTaker: 0.001,
  feeUsing: 'maker',
  // how much slippage/spread should Gekko assume per trade?
  slippage: 0.01,
};
calconfig.performanceAnalyzer = {
  enabled: true,
  riskFreeReturn: 1
};
// Want Gekko to perform real trades on buy or sell advice?
// Enabling this will activate trades for the market being
// watched by `calconfig.watch`.
calconfig.trader = {
  enabled: true,
  key: 'dxxe5b4u9warg',
  secret: '8p5pceLimWYRzFuHFLrs83TE_gIRVQf1mnFjx6DBeqc',
  username: '', // your username, only required for specific exchanges.
  passphrase: '', // GDAX, requires a passphrase.
};
calconfig.eventLogger = {
  enabled: false,
  // optionally pass a whitelist of events to log, if not past
  // the eventLogger will log _all_ events.
  whitelist: ['stratUpdate', 'stratCandle', 'candle']
};
calconfig.pushover = {
  enabled: false,
  sendPushoverOnStart: false,
  muteSoft: false, // disable advice printout if it's soft
  tag: '[GEKKO]',
  key: '',
  user: ''
};
calconfig.blotter = {
  enabled: false,
  filename: 'blotter.csv',
  dateFormat: 'l LT',
  timezone: -300, // -300 minutes for EST(-5:00), only used if exchange doesn't provide correct timezone
};
// want Gekko to send a mail on buy or sell advice?
calconfig.mailer = {
  enabled: false, // Send Emails if true, false to turn off
  sendMailOnStart: true, // Send 'Gekko starting' message if true, not if false
  email: '', // Your Gmail address
  muteSoft: true, // disable advice printout if it's soft
  // You don't have to set your password here, if you leave it blank we will ask it
  // when Gekko's starts.
  //
  // NOTE: Gekko is an open source project < https://github.com/askmike/gekko >,
  // make sure you looked at the code or trust the maintainer of this bot when you
  // fill in your email and password.
  //
  // WARNING: If you have NOT downloaded Gekko from the github page above we CANNOT
  // guarantuee that your email address & password are safe!
  password: '', // Your Gmail Password - if not supplied Gekko will prompt on startup.
  tag: '[GEKKO] ', // Prefix all email subject lines with this
  //       ADVANCED MAIL SETTINGS
  // you can leave those as is if you
  // just want to use Gmail
  server: 'smtp.gmail.com', // The name of YOUR outbound (SMTP) mail server.
  smtpauth: true, // Does SMTP server require authentication (true for Gmail)
  // The following 3 values default to the Email (above) if left blank
  user: '', // Your Email server user name - usually your full Email address 'me@mydomain.com'
  from: '', // 'me@mydomain.com'
  to: '', // 'me@somedomain.com, me@someotherdomain.com'
  ssl: true, // Use SSL (true for Gmail)
  port: '', // Set if you don't want to use the default port
};
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
calconfig.kodi = {
  // if you have a username & pass, add it like below
  // http://user:pass@ip-or-hostname:8080/jsonrpc
  host: 'http://ip-or-hostname:8080/jsonrpc',
  enabled: false,
  sendMessageOnStart: true,
};
calconfig.ircbot = {
  enabled: false,
  emitUpdates: false,
  muteSoft: true,
  channel: '#your-channel',
  server: 'irc.freenode.net',
  botName: 'gekkobot'
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
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING BACKTESTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
// Note that these settings are only used in backtesting mode, see here:
// @link: https://gekko.wizb.it/docs/commandline/backtesting.html
calconfig.backtest = {
  daterange: 'scan',
  // daterange: {
  //   from: "2020-03-01",
  //   to: "2022-04-28"
  //},
  batchSize: 1
};
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING IMPORTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
calconfig.importer = {
  daterange: {
    // NOTE: these dates are in UTC
    from: "2021-03-16 11:43", to: "2021-03-16 14:43"
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