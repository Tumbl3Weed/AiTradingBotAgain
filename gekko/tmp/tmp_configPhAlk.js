
var config = {};
config.debug = true;
config.watch = {
  exchange: 'luno',
  currency: 'ZAR',
  asset: 'XBT',
}
config.tradingAdvisor = {
  enabled: true,
  method: 'neuralnetcal',
  candleSize: 5,
  historySize: 100,
}
config.paperTrader = {
  enabled: true,
  reportInCurrency: true,
  simulationBalance: {
    asset: 0.01,
    currency: 2500,
  },
  feeMaker: 0,
  feeTaker: 0.001,
  feeUsing: 'maker',
  slippage: 0.005,
}
config.neuralnetcal = {

   "stoploss_threshold" : 0.9875,
   "learning_rate" : 7.9e-05,
   "momentum" : 0.01,
   "method" : "adadelta",
   "hodl_threshold" : 0.98,
   "interval" : 12,
   "stoploss_enabled" : "true",
   "threshold_sell" : -0.25,
   "min_predictions" : 100,
   "thresholds" : {
      "persistence" : 2,
      "high" : 19,
      "low" : 36
   },
   "decay" : 0.001,
   "price_buffer_len" : 100,
   "threshold_buy" : 0.777,
   "minPredictionAccuracy" : 4,
   "bbands" : {
      "NbDevUp" : 2,
      "TimePeriod" : 20,
      "NbDevDn" : 2
   }
}

config.performanceAnalyzer = {
  enabled: true,
  riskFreeReturn: 5
}
config.trader = {
  enabled: false,
  key: '',
  secret: '',
  username: '',
  passphrase: '',
  orderUpdateDelay: 1,
}
config.adviceLogger = {
  enabled: false,
  muteSoft: true
}
config.candleWriter = {
  enabled: false
}
config.adviceWriter = {
  enabled: false,
  muteSoft: true,
}
config.adapter = 'sqlite';
config.sqlite = {
  path: 'plugins/sqlite',
  dataDirectory: 'history',
  version: 0.1,
  dependencies: []
}
config.backtest = {
  daterange: {
    from: "2020-12-29 15:00:00",
    to: "2021-1-16 08:00:00"
  },
  batchSize: 50
}
config['I understand that Gekko only automates MY OWN trading strategies'] = true;
module.exports = config;
