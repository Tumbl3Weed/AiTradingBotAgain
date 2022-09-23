// Everything is explained here:
// @link https://gekko.wizb.it/docs/commandline/plugins.html

var calconfigBinanceDoge = {};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                          GENERAL SETTINGS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigBinanceDoge.debug = true; // for additional logging / debugging

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                         WATCHING A MARKET
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigBinanceDoge.watch = {
    exchange: 'binance',
    currency: 'USDT',
    asset: 'DOGE',
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING TRADING ADVICE

// };
calconfigBinanceDoge.tradingAdvisor = {
    enabled: true,
    method: 'NEOGABinance',
    candleSize: 1,
    historySize: 30,
};

calconfigBinanceDoge.NEOGABinance = {
    onDoge: true,
    BULL_RSI_low: 3.803726422817988,
    IDLE_RSI_low: 45.23230798611081,

    BULL_RSI_high: 51.034720403633,
    IDLE_RSI_high: 59.79808324595167,

    // ROC: 6,
    // rsimod: 1.1828297884637298,
    // ROC_lvl: 0,
    // SMA_long: 6,
    // BULL_RSI: 2,
    // IDLE_RSI: 2,
    // BEAR_RSI: 2,
    // SMA_short: 2,
    // IDLE_RSISLOW: 6,
    // rsimodWeight: 1,
    // BEAR_RSI_low: 2.74,
    // rsimodEponent: 1,
    // BEAR_RSI_high: 42.01,
    // stoploss_threshold: 0.9925369809596861,
    volumeThreshold: 0,
    IDLE_RSISLOW: 4,
    ROC: 6,
    onDoge: true,
    rsimod: 0.3607754954904787,
    ROC_lvl: 0, SMA_long: 6, BULL_RSI: 2,
    IDLE_RSI: 2,
    BEAR_RSI: 2,
    SMA_short: 2,

    sellPriceMod: 1,
    buyPriceMod: 1,
    rsimodWeight: 1,
    BEAR_RSI_low: 1.22,
    rsimodEponent: 2.7785086960276617,
    BEAR_RSI_high: 58.97,
    stoploss_threshold: 0.9774710875389244
};

// calconfig.tradingAdvisor = {
//   enabled: true,
//   method: 'NEO',
//   candleSize: 1,
//   historySize: 30,
// };

calconfigBinanceDoge.NEOGA = {
    onDoge: true,
    usingBearBull: false,
    SMA_long: 3,
    SMA_short: 2,


    BULL_RSI: 2,
    BULL_RSI_high: 70,
    BULL_RSI_low: 30,

    rsimod: 1.3202523215241384,
    IDLE_RSI: 10,
    candleSize: 1,
    historySize: 30,
    buyAmbition: false,
    IDLE_RSISLOW: 3,
    IDLE_RSI_low: 44.071888908951586,
    sellAmbition: false,
    IDLE_RSI_high: 51.442026446531784,
    baseBuyAmbitionVal: 1.382744719975786,
    baseSellAmbitionVal: 0.7493876427832505,
    aboveZeroAmbitionMod: 0.39053700894174437,
    belowZeroAmbitionMod: 1.5185857236622051,


    BEAR_RSI: 2,
    BEAR_RSI_high: 72,
    BEAR_RSI_low: 10,

    ROC: 6,
    ROC_lvl: 0,

};

// settings for other strategies can be found at the bottom, note that only
// one strategy is active per gekko, the other settings are ignored.

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING PLUGINS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// do you want Gekko to simulate the profit of the strategy's own advice?
calconfigBinanceDoge.paperTrader = {
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

calconfigBinanceDoge.performanceAnalyzer = {
    enabled: true,
    riskFreeReturn: 1
};

// Want Gekko to perform real trades on buy or sell advice?
// Enabling this will activate trades for the market being
// watched by `calconfig.watch`.
calconfigBinanceDoge.trader = {
    enabled: true,
    key: 'tB5xJXV4CsUknKs1LqV8Kal4gsdkwV8CRWKJ3wHjZCs7ueXPPpXmliKVygzLzQ2n',
    secret: '7viBaYYcqMrdw72ZH8uabCbYDFYGBuwK0F3T6Mjcb7DberYHXNZzjvKTFBfCsKF5',
    username: '', // your username, only required for specific exchanges.
    passphrase: '', // GDAX, requires a passphrase.
};

calconfigBinanceDoge.eventLogger = {
    enabled: false,
    // optionally pass a whitelist of events to log, if not past
    // the eventLogger will log _all_ events.
    // whitelist: ['portfolioChange', 'portfolioValueChange']
};

calconfigBinanceDoge.pushover = {
    enabled: false,
    sendPushoverOnStart: false,
    muteSoft: false, // disable advice printout if it's soft
    tag: '[GEKKO]',
    key: '',
    user: ''
};

calconfigBinanceDoge.blotter = {
    enabled: false,
    filename: 'blotter.csv',
    dateFormat: 'l LT',
    timezone: -300, // -300 minutes for EST(-5:00), only used if exchange doesn't provide correct timezone
};

// want Gekko to send a mail on buy or sell advice?
calconfigBinanceDoge.mailer = {
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

calconfigBinanceDoge.pushbullet = {
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

calconfigBinanceDoge.kodi = {
    // if you have a username & pass, add it like below
    // http://user:pass@ip-or-hostname:8080/jsonrpc
    host: 'http://ip-or-hostname:8080/jsonrpc',
    enabled: false,
    sendMessageOnStart: true,
};

calconfigBinanceDoge.ircbot = {
    enabled: false,
    emitUpdates: false,
    muteSoft: true,
    channel: '#your-channel',
    server: 'irc.freenode.net',
    botName: 'gekkobot'
};

calconfigBinanceDoge.telegrambot = {
    enabled: false,
    // Receive notifications for trades and warnings/errors related to trading
    emitTrades: false,
    token: 'YOUR_TELEGRAM_BOT_TOKEN',
};

calconfigBinanceDoge.candleWriter = {
    enabled: true
};

calconfigBinanceDoge.adviceWriter = {
    enabled: true,
    muteSoft: true,
};

calconfigBinanceDoge.backtestResultExporter = {
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

calconfigBinanceDoge.candleUploader = {
    enabled: false,
    url: '',
    apiKey: ''
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING ADAPTER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigBinanceDoge.adapter = 'sqlite';

calconfigBinanceDoge.sqlite = {
    path: 'plugins/sqlite',

    dataDirectory: 'history',
    version: 0.1,

    journalMode: require('./web/isWindows.js') ? 'DELETE' : 'WAL',

    dependencies: []
};

// Postgres adapter example calconfig (please note: requires postgres >= 9.5):
calconfigBinanceDoge.postgresql = {
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
calconfigBinanceDoge.mongodb = {
    path: 'plugins/mongodb',
    version: 0.1,
    connectionString: 'mongodb://localhost/gekko', // connection to mongodb server
    dependencies: [{
        module: 'mongojs',
        version: '2.4.0'
    }]
};

calconfigBinanceDoge.candleUploader = {
    enabled: false,
    url: '',
    apiKey: ''
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING BACKTESTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Note that these settings are only used in backtesting mode, see here:
// @link: https://gekko.wizb.it/docs/commandline/backtesting.html

calconfigBinanceDoge.backtest = {
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

calconfigBinanceDoge.importer = {
    daterange: {
        // NOTE: these dates are in UTC
        from: "2021-02-12 22:40"
        // to: "2021-02-05 00:00:00"
    }
};


// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      OTHER STRATEGY SETTINGS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Exponential Moving Averages settings:
calconfigBinanceDoge.DEMA = {
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
calconfigBinanceDoge.PPO = {
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
calconfigBinanceDoge.varPPO = {
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
calconfigBinanceDoge.RSI = {
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
calconfigBinanceDoge.TSI = {
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
calconfigBinanceDoge.UO = {
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
calconfigBinanceDoge.CCI = {
    constant: 0.015, // constant multiplier. 0.015 gets to around 70% fit
    history: 90, // history size, make same or smaller than history
    thresholds: {
        up: 100, // fixed values for overbuy upward trajectory
        down: -100, // fixed value for downward trajectory
        persistence: 0 // filter spikes by adding extra filters candles
    }
};

// StochRSI settings
calconfigBinanceDoge.StochRSI = {
    interval: 3,
    thresholds: {
        low: 20,
        high: 80,
        // How many candle intervals should a trend persist
        // before we consider it real?
        persistence: 3
    }
};

calconfigBinanceDoge['talib-macd'] = {
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

calconfigBinanceDoge['talib-macd'] = {
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

calconfigBinanceDoge['tulip-adx'] = {
    optInTimePeriod: 10,
    thresholds: {
        down: -0.025,
        up: 0.025,
    }
};



calconfigBinanceDoge['I understand that Gekko only automates MY OWN trading strategies'] = true;

module.exports = calconfigBinanceDoge;