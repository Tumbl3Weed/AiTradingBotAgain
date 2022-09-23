// Everything is explained here:
// @link https://gekko.wizb.it/docs/commandline/plugins.html

var calconfigNeoGABinance = {};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                          GENERAL SETTINGS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigNeoGABinance.debug = true; // for additional logging / debugging

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                         WATCHING A MARKET
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigNeoGABinance.watch = {

    // see https://gekko.wizb.it/docs/introduction/supported_exchanges.html
    exchange: 'binance',
    currency: 'USDT',
    asset: 'DOGE',
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING TRADING ADVICE
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



// calconfig.tradingAdvisor = {
//   enabled: true,
//   method: 'neuralnetcalRFL',
//   candleSize: 1,
//   historySize: 100,
// };

// calconfig.tradingAdvisor = {
//   enabled: true,
//   method: 'neuralnetcal',
//   candleSize: 1,
//   historySize: 10,
// };
calconfigNeoGABinance.tradingAdvisor = {
    enabled: true,
    method: 'NEOGA',
    candleSize: 1,
    historySize: 30,
};

calconfigNeoGABinance.NEOGA = {
    onDoge: true,

    SMA_long: 3,
    SMA_short: 2,

    rsimod: 1.7324628895380838,
    IDLE_RSI: 2,
    candleSize: 1,
    historySize: 120,
    buyAmbition: true,
    IDLE_RSISLOW: 16,
    IDLE_RSI_low: 13.686330652617485,
    sellAmbition: false,
    IDLE_RSI_high: 52.879611077945974,
    baseBuyAmbitionVal: 1.2591836215789227,
    baseSellAmbitionVal: 0.6297752559992766,
    aboveZeroAmbitionMod: 0.7873277938652483,
    belowZeroAmbitionMod: 0.7670993409864302,


    BEAR_RSI: 2,
    BEAR_RSI_high: 72,
    BEAR_RSI_low: 10,

    ROC: 6,
    ROC_lvl: 0,

};

calconfigNeoGABinance.neuralnetcal = {
    method: 'adadelta',
    threshold_buy: 1.02,

    learning_rate: 0.000079,
    momentum: 0.01,
    decay: 0.001,
    stoploss_enabled: true,
    stoploss_threshold: 0.992,
    hodl_threshold: 0.975,
    price_buffer_len: 300,
    min_predictions: 150,
    minPredictionAccuracy: 0.75,

    interval: 10,

    thresholds: {
        low: 19,
        high: 19,
        persistence: 9,
    },
    bbands: {
        TimePeriod: 10,
        NbDevUp: 2,
        NbDevDn: 2
    }

};

calconfigNeoGABinance.neuralnetcalRFL = {
    method: 'adadelta',
    threshold_buy: 1.0001,
    threshold_sell: -0.25,

    experience_size: 9000,

    learning_rate: 0.000079,
    momentum: 0.01,
    decay: 0.001,
    stoploss_enabled: true,
    stoploss_threshold: 0.9999,
    hodl_threshold: 0.975,
    min_predictions: 20,


    interval: 14,

    thresholds: {
        low: 40,
        high: 40,
        persistence: 9,
    },

};
// settings for other strategies can be found at the bottom, note that only
// one strategy is active per gekko, the other settings are ignored.

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING PLUGINS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// do you want Gekko to simulate the profit of the strategy's own advice?
calconfigNeoGABinance.paperTrader = {
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

calconfigNeoGABinance.performanceAnalyzer = {
    enabled: true,
    riskFreeReturn: 5
};

// Want Gekko to perform real trades on buy or sell advice?
// Enabling this will activate trades for the market being
// watched by `calconfig.watch`.
calconfigNeoGABinance.trader = {
    enabled: true,
    key: 'tB5xJXV4CsUknKs1LqV8Kal4gsdkwV8CRWKJ3wHjZCs7ueXPPpXmliKVygzLzQ2n',
    secret: '7viBaYYcqMrdw72ZH8uabCbYDFYGBuwK0F3T6Mjcb7DberYHXNZzjvKTFBfCsKF5',
    username: '', // your username, only required for specific exchanges.
    passphrase: '', // GDAX, requires a passphrase.
};

calconfigNeoGABinance.eventLogger = {
    enabled: false,
    // optionally pass a whitelist of events to log, if not past
    // the eventLogger will log _all_ events.
    // whitelist: ['portfolioChange', 'portfolioValueChange']
};

calconfigNeoGABinance.pushover = {
    enabled: false,
    sendPushoverOnStart: false,
    muteSoft: false, // disable advice printout if it's soft
    tag: '[GEKKO]',
    key: '',
    user: ''
};

calconfigNeoGABinance.blotter = {
    enabled: false,
    filename: 'blotter.csv',
    dateFormat: 'l LT',
    timezone: -300, // -300 minutes for EST(-5:00), only used if exchange doesn't provide correct timezone
};

// want Gekko to send a mail on buy or sell advice?
calconfigNeoGABinance.mailer = {
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

calconfigNeoGABinance.pushbullet = {
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

calconfigNeoGABinance.kodi = {
    // if you have a username & pass, add it like below
    // http://user:pass@ip-or-hostname:8080/jsonrpc
    host: 'http://ip-or-hostname:8080/jsonrpc',
    enabled: false,
    sendMessageOnStart: true,
};

calconfigNeoGABinance.ircbot = {
    enabled: false,
    emitUpdates: false,
    muteSoft: true,
    channel: '#your-channel',
    server: 'irc.freenode.net',
    botName: 'gekkobot'
};

calconfigNeoGABinance.telegrambot = {
    enabled: false,
    // Receive notifications for trades and warnings/errors related to trading
    emitTrades: false,
    token: 'YOUR_TELEGRAM_BOT_TOKEN',
};





calconfigNeoGABinance.candleWriter = {
    enabled: true
};

calconfigNeoGABinance.adviceWriter = {
    enabled: true,
    muteSoft: true,
};

calconfigNeoGABinance.backtestResultExporter = {
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

calconfigNeoGABinance.candleUploader = {
    enabled: false,
    url: '',
    apiKey: ''
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING ADAPTER
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

calconfigNeoGABinance.adapter = 'sqlite';

calconfigNeoGABinance.sqlite = {
    path: 'plugins/sqlite',

    dataDirectory: 'history',
    version: 0.1,

    journalMode: require('./web/isWindows.js') ? 'DELETE' : 'WAL',

    dependencies: []
};

// Postgres adapter example calconfig (please note: requires postgres >= 9.5):
calconfigNeoGABinance.postgresql = {
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
calconfigNeoGABinance.mongodb = {
    path: 'plugins/mongodb',
    version: 0.1,
    connectionString: 'mongodb://localhost/gekko', // connection to mongodb server
    dependencies: [{
        module: 'mongojs',
        version: '2.4.0'
    }]
};

calconfigNeoGABinance.candleUploader = {
    enabled: false,
    url: '',
    apiKey: ''
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                       calconfigURING BACKTESTING
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Note that these settings are only used in backtesting mode, see here:
// @link: https://gekko.wizb.it/docs/commandline/backtesting.html

calconfigNeoGABinance.backtest = {
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


calconfigNeoGABinance.importer = {
    daterange: {
        // NOTE: these dates are in UTC
        from: "2021-02-04 13:41",
        to: "2021-02-04 15:42",
        batchSize: 1
    }
};

// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//                      OTHER STRATEGY SETTINGS
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

// Exponential Moving Averages settings:
calconfigNeoGABinance.DEMA = {
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
calconfigNeoGABinance.PPO = {
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
calconfigNeoGABinance.varPPO = {
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
calconfigNeoGABinance.RSI = {
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
calconfigNeoGABinance.TSI = {
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
calconfigNeoGABinance.UO = {
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
calconfigNeoGABinance.CCI = {
    constant: 0.015, // constant multiplier. 0.015 gets to around 70% fit
    history: 90, // history size, make same or smaller than history
    thresholds: {
        up: 100, // fixed values for overbuy upward trajectory
        down: -100, // fixed value for downward trajectory
        persistence: 0 // filter spikes by adding extra filters candles
    }
};

// StochRSI settings
calconfigNeoGABinance.StochRSI = {
    interval: 3,
    thresholds: {
        low: 20,
        high: 80,
        // How many candle intervals should a trend persist
        // before we consider it real?
        persistence: 3
    }
};

calconfigNeoGABinance['talib-macd'] = {
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

calconfigNeoGABinance['talib-macd'] = {
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

calconfigNeoGABinance['tulip-adx'] = {
    optInTimePeriod: 10,
    thresholds: {
        down: -0.025,
        up: 0.025,
    }
};



calconfigNeoGABinance['I understand that Gekko only automates MY OWN trading strategies'] = true;

module.exports = calconfigNeoGABinance;