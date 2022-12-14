const Luno = require("bitx");
const _ = require('lodash');
const moment = require('moment');
const node_util = require('util');
const Errors = require('../exchangeErrors');
const retry = require('../exchangeUtils').retry;
const name = 'Luno';

var tradeAttempt = 0;

const Trader = function (config) {
  if (_.isObject(config)) {
    this.key = config.key;
    this.secret = config.secret;
    this.currency = config.currency;
    this.asset = config.asset;
    this.pair = config.asset + config.currency;
  }
  this.luno = new Luno(this.key, this.secret, {
    pair: this.pair
  });
  this.market = _.find(Trader.getCapabilities().markets, (market) => {
    return market.pair[0] === this.currency && market.pair[1] === this.asset;
  });
  this.interval = 2000;
}

const log = function () {
  const message = node_util.format.apply(null, _.toArray(arguments));
  console.log(moment().format('YYYY-MM-DD HH:mm:ss') + ' (DEBUG):    ' + message);
}

Trader.prototype.inspect = function (obj) {
  return node_util.inspect(obj, {
    showhidden: false,
    depth: null,
    breakLength: Infinity,
    colors: true
  });
};

const setPrecision = (amount, digits) => {
  let precision = 100000000;
  if (Number.isInteger(digits)) precision = Math.pow(10, digits);
  amount *= precision;
  amount = Math.floor(amount);
  amount /= precision;
  return amount;
}

const round = (value, decimals = 14) => {
  return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

const includez = (str, list) => {
  if (!_.isString(str))
    return false;
  let result = _.some(list, item => str.includes(item));
  return result;
}

const recoverableErrors = [
  'SOCKETTIMEDOUT',
  'TIMEDOUT',
  'CONNRESET',
  'CONNREFUSED',
  'NOTFOUND'
];


const processResponse = function (funcName, callback) {
  return (error, body) => {
    /* BitX Error Codes
          Error: BitX error 400: invalid id
          Error: BitX error 401: "error":"API key not found","error_code":"ErrAPIKeyNotFound","error_action":
          Error: BitX error 429: -- API limit
          Error: BitX error 500: Something went wrong, we're looking into it.
     */

    if (!error && !body) {
      error = new Error('received empty response');
    }

    if (error) {
      log(name, funcName + '() received error -->', error.message);

      if (includez(error.message, recoverableErrors)) {
        error.notFatal = true;
      }

      if (includez(error.message, ['error 429'])) {
        error.notFatal = true;
        error.backoffDelay = 3000;
      }

      if (includez(error.message, ['error 500'])) {
        error.notFatal = true;
        error.backoffDelay = 15000;
      }

      if (includez(error.message, ['Insufficient balance'])) {
        error.notFatal = true;
        error.backoffDelay = 2000;
        tradeAttempt++;
        if (tradeAttempt >= 3) {
          error.notFatal = false;
          log(name, funcName + '() giving up after 3 failed attempts.');
        }
      }

      return callback(error, undefined);
    }

    return callback(undefined, body);
  }
};

//------- Gekko Functions ---------//

Trader.prototype.getTicker = function (callback) {
  // log(name, 'getTicker()');

  const process = (err, data) => {
    if (err) {
      log(name, 'Error: -->', err);
      return callback(err);
    }
    const ticker = {
      ask: data.ask,
      bid: data.bid,
      spread: round(data.ask - data.bid)
    };
    log(name, 'getTicker() -->', this.inspect(ticker));
    callback(undefined, ticker);
  };

  const handler = cb => this.luno.getTicker(processResponse('getTicker', cb));
  retry(null, handler, process);
}

Trader.prototype.getFee = function (callback) {
  // log(name, 'getFee()');

  if (this.pair === 'ETHXBT')
    return callback(undefined, 0.001);
  else if (this.pair === 'XBTIDR')
    return callback(undefined, 0.001);
  else
    return callback(undefined, 0.001);

  /*
  const process = (err, data) => {
    if (err) {
      // log(name, 'Error: -->', err);
      return callback(err);
    }
    // log(name, 'getFee() --> fee:', data.taker_fee / 100);
    callback(undefined, data.taker_fee / 100);
  };
  const handler = cb => this.luno.getFee(processResponse('getFee', cb));
  retry(null, handler, process);
  */
}

Trader.prototype.getPortfolio = function (callback) {
  // log(name, 'getPortfolio()');

  const process = (err, data) => {
    if (err) {
      log(name, 'Error: -->', err);
      return callback(err);
    }
    // console.log('Logging Data!\n', data);
    const assetProfile = _.find(data.balance, a => a.asset === this.asset && a.account_id !== '1690655453517647583');
    const currencyProfile = _.find(data.balance, a => a.asset === this.currency);
    let assetAmount = round(assetProfile.balance - assetProfile.reserved);
    let currencyAmount = round(currencyProfile.balance - currencyProfile.reserved);

    if (!_.isNumber(assetAmount) || _.isNaN(assetAmount)) {
      assetAmount = 0;
    }

    if (!_.isNumber(currencyAmount) || _.isNaN(currencyAmount)) {
      currencyAmount = 0;
    }

    const portfolio = [{
      name: this.asset.toUpperCase(),
      amount: assetAmount
    },
    {
      name: this.currency.toUpperCase(),
      amount: currencyAmount
    }
    ];
    log(name, 'getPortfolio() --> ' + this.inspect(portfolio));
    callback(undefined, portfolio);
  };

  const handler = cb => this.luno.getBalance(processResponse('getPortfolio', cb));
  retry(null, handler, process);
}

Trader.prototype.buy = function (amount, price, callback) {
  if (!this.market.pricePrecision)
    price = Math.round(price);
  log(name, 'buy() amount:', amount, 'price:', price);

  tradeAttempt = 0;
  amount = round(amount);

  const process = (err, data) => {
    if (err) {
      log(name, 'unable to buy:', err.message);
      return callback(err);
    }
    log(name, 'buy() order id: -->', data.order_id);
    callback(undefined, data.order_id);
  };

  const handler = cb => this.luno.postBuyOrder(amount, price, processResponse('buy', cb));
  retry(null, handler, process);
}

Trader.prototype.sell = function (amount, price, callback) {
  if (!this.market.pricePrecision)
    price = Math.round(price);
  log(name, 'sell() amount:', amount, 'price:', price);

  tradeAttempt = 0;
  amount = round(amount);

  const process = (err, data) => {
    if (err) {
      log(name, 'unable to sell:', err.message);
      return callback(err);
    }
    log(name, 'sell() order id: -->', data.order_id);
    callback(undefined, data.order_id);
  };

  const handler = cb => this.luno.postSellOrder(amount, price, processResponse('sell', cb));
  retry(null, handler, process);
}

Trader.prototype.roundAmount = function (amount) {
  amount = setPrecision(amount, this.market.precision);
  return amount;
}

Trader.prototype.roundPrice = function (price) {

  let newPrice = price;
  if (this.market.pricePrecision) {
    console.log('round price', price);
    let pricePrecision = Math.pow(10, this.market.pricePrecision);
    newPrice *= pricePrecision;
    newPrice = Math.floor(newPrice);
    newPrice /= pricePrecision;
    console.log('end of round price', newPrice);
    return +newPrice;
  } else
    return +price;
}

Trader.prototype.getOrder = function (order, callback) {
  // log(name, 'getOrder() order id:', order);

  if (!order) {
    return callback('invalid order_id', false);
  }
  const process = (err, data) => {
    if (err) {
      log(name, 'Error: -->', err);
      return callback(err);
    }
    const price = parseFloat(data.limit_price);
    const amount = parseFloat(data.base);
    let date = moment();
    const fees = {
      [this.asset]: +data.fee_base,
      [this.currency]: +data.fee_counter
    };
    const feePercent = round(data.fee_base / data.base * 100, 2);
    if (data.state === 'PENDING') {
      date = moment(data.creation_timestamp);
    } else {
      date = moment(data.completed_timestamp);
    }
    const result = {
      price,
      amount,
      date,
      fees,
      feePercent
    };
    log(name, 'getOrder() -->', this.inspect(result));
    callback(undefined, result);
  };

  const handler = cb => this.luno.getOrder(order, processResponse('getOrder', cb));
  retry(null, handler, process);
}

Trader.prototype.checkOrder = function (order, callback) {
  // log(name, 'checkOrder() order id:', order);

  if (!order) {
    return callback('invalid order_id');
  }
  const process = (err, data) => {
    if (err) {
      log(name, 'Error: -->', err);
      return callback(err);
    }
    const result = {
      open: data.state === 'PENDING',
      executed: data.limit_volume === data.base,
      filledAmount: +data.base,
      remaining: round(+data.limit_volume - +data.base)
    }
    log(name, 'checkOrder()', order, 'result:', this.inspect(result));
    callback(undefined, result);
  };

  const handler = cb => this.luno.getOrder(order, processResponse('checkOrder', cb));
  retry(null, handler, process);
}

Trader.prototype.cancelOrder = function (order, callback) {
  log(name, 'cancelOrder() order id:', order);

  if (!order) {
    return callback('invalid order_id');
  }
  const process = (err, data) => {
    if (err) {
      if (_.includes(err.message, 'Cannot stop unknown')) {
        log(name, 'unable to cancel order:', order, '(' + err.message + ') assuming success...');
      } else {
        log(name, 'unable to cancel order:', order, '(' + err.message + ') aborting...');
        return callback(err);
      }
    }

    if (data && !data.success) {
      log('cancelOrder() --> status:', data.success);
      return callback(undefined, false);
    }

    this.checkOrder(order, (error, orderStatus) => {
      if (error) {
        log(name, 'cancelOrder\'s checkOrder failed. What do i do here?');
        return callback(error, false);
      }

      if (orderStatus.executed) {
        log(name, 'cancelOrder() -->', order, 'was fulfilled before cancelOrder was completed.');
        return callback(undefined, true);
      }
      const remaining = {
        remaining: orderStatus.remaining,
        filled: orderStatus.filledAmount
      }
      log(name, 'cancelOrder() --> status: false remaining:', this.inspect(remaining));
      return callback(undefined, false, remaining);
    });
  }

  const handler = cb => this.luno.stopOrder(order, processResponse('cancelOrder', cb));
  retry(null, handler, process);
}

Trader.prototype.getTrades = function (since, callback, descending) {
  // log(name, 'getTrades() since:', since);

  const process = (err, result) => {
    if (err) {
      log(name, 'Error: -->', err);
      return callback(err);
    }
    let trades = _.map(result.trades, (t) => {
      return {
        price: t.price,
        date: Math.round(t.timestamp / 1000),
        amount: t.volume,
        tid: t.timestamp
      }
    });
    if (!descending) {
      trades = trades.reverse()
    }
    callback(undefined, trades);
  };

  if (moment.isMoment(since)) since = since.valueOf();
  (_.isNumber(since) && since > 0) ? since : since = 0;

  const options = {
    pair: this.pair,
    since: since
  }

  const handler = cb => this.luno.getTrades(options, processResponse('getTrades', cb));
  retry(null, handler, process);
}

Trader.getCapabilities = function () {
  return {
    name: 'Luno',
    slug: 'luno',
    currencies: ['MYR', 'KES', 'NGN', 'ZAR', 'XBT', 'ETH'],
    assets: ['ETH', 'XBT', 'XRP'],
    markets: [
      { pair: ['XBT', 'ETH'], minimalOrder: { amount: 0.01, unit: 'asset' }, precision: 2 },
      { pair: ['ZAR', 'XBT'], minimalOrder: { amount: 0.0005, unit: 'asset' }, precision: 6 },
      { pair: ['ZAR', 'ETH'], minimalOrder: { amount: 0.000500, unit: 'asset' }, precision: 6 },
      { pair: ['ZAR', 'XRP'], minimalOrder: { amount: 1, unit: 'currency' }, precision: 0, pricePrecision: 2 }
      /*
      {"markets":[{"market_id":"LTCXBT","trading_status":"ACTIVE","base_currency":"LTC","counter_currency":"XBT","min_volume":"0.001","max_volume":"10000.00","volume_scale":2,"min_price":"0.000001","max_price":"0.10","price_scale":6,"fee_scale":8},{"market_id":"LTCMYR","trading_status":"ACTIVE","base_currency":"LTC","counter_currency":"MYR","min_volume":"0.001","max_volume":"10000.00","volume_scale":4,"min_price":"10.00","max_price":"10000.00","price_scale":0,"fee_scale":8},{"market_id":"LTCNGN","trading_status":"ACTIVE","base_currency":"LTC","counter_currency":"NGN","min_volume":"0.001","max_volume":"10000.00","volume_scale":4,"min_price":"1000.00","max_price":"1000000.00","price_scale":0,"fee_scale":8},{"market_id":"LTCZAR","trading_status":"ACTIVE","base_currency":"LTC","counter_currency":"ZAR","min_volume":"0.001","max_volume":"10000.00","volume_scale":4,"min_price":"10.00","max_price":"100000.00","price_scale":0,"fee_scale":8},{"market_id":"BCHXBT","trading_status":"ACTIVE","base_currency":"BCH","counter_currency":"XBT","min_volume":"0.01","max_volume":"100.00","volume_scale":2,"min_price":"0.0001","max_price":"1.00","price_scale":6,"fee_scale":8},{"market_id":"XRPXBT","trading_status":"ACTIVE","base_currency":"XRP","counter_currency":"XBT","min_volume":"1.00","max_volume":"100000.00","volume_scale":0,"min_price":"0.000001","max_price":"0.0001","price_scale":8,"fee_scale":8},{"market_id":"XRPMYR","trading_status":"ACTIVE","base_currency":"XRP","counter_currency":"MYR","min_volume":"1.00","max_volume":"100000.00","volume_scale":0,"min_price":"0.10","max_price":"100.00","price_scale":4,"fee_scale":8},{"market_id":"XRPNGN","trading_status":"ACTIVE","base_currency":"XRP","counter_currency":"NGN","min_volume":"1.00","max_volume":"100000.00","volume_scale":0,"min_price":"1.00","max_price":"10000.00","price_scale":2,"fee_scale":8},{"market_id":"XRPZAR","trading_status":"ACTIVE","base_currency":"XRP","counter_currency":"ZAR","min_volume":"1.00","max_volume":"100000.00","volume_scale":0,"min_price":"0.10","max_price":"100.00","price_scale":2,"fee_scale":8},{"market_id":"ETHUSDC","trading_status":"ACTIVE","base_currency":"ETH","counter_currency":"USDC","min_volume":"0.001","max_volume":"1000.00","volume_scale":4,"min_price":"10.00","max_price":"1000000.00","price_scale":2,"fee_scale":8},{"market_id":"ETHXBT","trading_status":"ACTIVE","base_currency":"ETH","counter_currency":"XBT","min_volume":"0.01","max_volume":"1000.00","volume_scale":2,"min_price":"0.0001","max_price":"1.00","price_scale":6,"fee_scale":8},{"market_id":"ETHEUR","trading_status":"ACTIVE","base_currency":"ETH","counter_currency":"EUR","min_volume":"0.001","max_volume":"1000.00","volume_scale":4,"min_price":"10.00","max_price":"100000.00","price_scale":2,"fee_scale":8},{"market_id":"ETHGBP","trading_status":"ACTIVE","base_currency":"ETH","counter_currency":"GBP","min_volume":"0.001","max_volume":"1000.00","volume_scale":4,"min_price":"10.00","max_price":"100000.00","price_scale":2,"fee_scale":8},{"market_id":"ETHAUD","trading_status":"ACTIVE","base_currency":"ETH","counter_currency":"AUD","min_volume":"0.001","max_volume":"1000.00","volume_scale":4,"min_price":"10.00","max_price":"100000.00","price_scale":2,"fee_scale":8},{"market_id":"ETHIDR","trading_status":"ACTIVE","base_currency":"ETH","counter_currency":"IDR","min_volume":"0.001","max_volume":"400.00","volume_scale":4,"min_price":"100000.00","max_price":"200000000.00","price_scale":-3,"fee_scale":8},{"market_id":"ETHMYR","trading_status":"ACTIVE","base_currency":"ETH","counter_currency":"MYR","min_volume":"0.01","max_volume":"100.00","volume_scale":2,"min_price":"5.00","max_price":"100000.00","price_scale":0,"fee_scale":8},{"market_id":"ETHNGN","trading_status":"ACTIVE","base_currency":"ETH","counter_currency":"NGN","min_volume":"0.001","max_volume":"200.00","volume_scale":6,"min_price":"5000.00","max_price":"10000000.00","price_scale":0,"fee_scale":8},{"market_id":"ETHZAR","trading_status":"ACTIVE","base_currency":"ETH","counter_currency":"ZAR","min_volume":"0.0005","max_volume":"100.00","volume_scale":6,"min_price":"1000.00","max_price":"2000000.00","price_scale":0,"fee_scale":8},{"market_id":"XBTUSDC","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"USDC","min_volume":"0.0005","max_volume":"100.00","volume_scale":4,"min_price":"100.00","max_price":"1000000.00","price_scale":2,"fee_scale":8},{"market_id":"XBTEUR","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"EUR","min_volume":"0.0005","max_volume":"100.00","volume_scale":4,"min_price":"100.00","max_price":"1000000.00","price_scale":2,"fee_scale":8},{"market_id":"XBTGBP","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"GBP","min_volume":"0.0005","max_volume":"100.00","volume_scale":4,"min_price":"100.00","max_price":"1000000.00","price_scale":2,"fee_scale":8},{"market_id":"XBTAUD","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"AUD","min_volume":"0.0005","max_volume":"100.00","volume_scale":4,"min_price":"100.00","max_price":"1000000.00","price_scale":2,"fee_scale":8},{"market_id":"XBTIDR","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"IDR","min_volume":"0.0005","max_volume":"90.00","volume_scale":6,"min_price":"10.00","max_price":"1000000000.00","price_scale":-3,"fee_scale":8},{"market_id":"XBTMYR","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"MYR","min_volume":"0.0005","max_volume":"100.00","volume_scale":6,"min_price":"10000.00","max_price":"10000000.00","price_scale":0,"fee_scale":8},{"market_id":"XBTNGN","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"NGN","min_volume":"0.0001","max_volume":"90.00","volume_scale":6,"min_price":"10.00","max_price":"1000000000.00","price_scale":0,"fee_scale":8},{"market_id":"XBTSGD","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"SGD","min_volume":"0.0005","max_volume":"100.00","volume_scale":4,"min_price":"1000.00","max_price":"1000000.00","price_scale":2,"fee_scale":8},{"market_id":"XBTUGX","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"UGX","min_volume":"0.0005","max_volume":"90.00","volume_scale":6,"min_price":"1000.00","max_price":"1000000000.00","price_scale":-3,"fee_scale":8},{"market_id":"XBTZAR","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"ZAR","min_volume":"0.0005","max_volume":"100.00","volume_scale":6,"min_price":"10.00","max_price":"10000000.00","price_scale":0,"fee_scale":8},{"market_id":"XBTZMW","trading_status":"ACTIVE","base_currency":"XBT","counter_currency":"ZMW","min_volume":"0.0005","max_volume":"100.00","volume_scale":6,"min_price":"10.00","max_price":"10000000.00","price_scale":0,"fee_scale":8}]}
      */
    ],
    requires: ['key', 'secret'],
    providesFullHistory: true,
    providesHistory: 'date',
    maxHistoryFetch: 1000,
    tid: 'tid',
    tradable: true,
    forceReorderDelay: true,
    gekkoBroker: 0.6
  };
}

module.exports = Trader;
