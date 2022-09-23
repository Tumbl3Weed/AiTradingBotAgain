
var config = {};
config.debug = true;
config.watch = {
  exchange: 'luno',
  currency: 'ZAR',
  asset: 'XBT',
}
config.tradingAdvisor = {
  enabled: false,
  method: 'MACD',
  candleSize: 1,
  historySize: 2,
}
config.paperTrader = {
  enabled: false,
  reportInCurrency: true,
  simulationBalance: {
    asset: 0,
    currency: 4,
  },
  feeMaker: 0.05,
  feeTaker: 0.05,
  feeUsing: 'maker',
  slippage: 0.5,
}
config.performanceAnalyzer = {
  enabled: false,
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
  enabled: true
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
