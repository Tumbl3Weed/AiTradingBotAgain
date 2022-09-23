
var config = {};
config.debug = true;
config.watch = {
  exchange: 'luno',
  currency: 'ZAR',
  asset: 'XBT',
}
config.tradingAdvisor = {
  enabled: true,
  method: 'MACD',
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
config.MACD = {

   "long" : 21,
   "thresholds" : {
      "persistence" : 1,
      "up" : 0.025,
      "down" : -0.025
   },
   "short" : 10,
   "signal" : 9
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
