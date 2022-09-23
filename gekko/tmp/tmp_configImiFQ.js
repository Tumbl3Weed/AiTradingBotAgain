
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

   "method" : "adadelta",
   "learning_rate" : 7.9e-05,
   "momentum" : 0.01,
   "hodl_threshold" : 0.98,
   "price_buffer_len" : 100,
   "stoploss_threshold" : 0.96,
   "bbands" : {
      "NbDevDn" : 2,
      "TimePeriod" : 20,
      "NbDevUp" : 2
   },
   "threshold_sell" : -0.25,
   "minPredictionAccuracy" : 2,
   "interval" : 10,
   "stoploss_enabled" : "true",
   "thresholds" : {
      "persistence" : 2,
      "low" : 36,
      "high" : 36
   },
   "min_predictions" : 100,
   "decay" : 0.001,
   "threshold_buy" : 0.777
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
  daterange:  'scan',
  batchSize: 50
}
config['I understand that Gekko only automates MY OWN trading strategies'] = true;
module.exports = config;
