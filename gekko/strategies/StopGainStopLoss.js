/*

  BB strategy - okibcn 2018-01-03

 */
// helpers
var _ = require('lodash');
var log = require('../core/log.js');

var BB = require('./indicators/BB.js');


// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function () {
  this.name = 'SLSG';
  this.nsamples = 0;
  this.trend = {
    zone: 'none',  // none, top, high, low, bottom
    duration: 0,
    persisted: false
  };
  this.prevAction = 'buy';
  this.requiredHistory = this.tradingAdvisor.historySize;
  this.prevPrice = 0;
  // define the indicators we need
  this.addIndicator('stoploss', 'StopLoss', {
    threshold: this.settings.stoploss_threshold,
    action: 'stoploss'
  });
  this.addIndicator('bb', 'BB', this.settings.bbands);
}


// for debugging purposes log the last
// calculated parameters.
method.log = function (candle) {
  // var digits = 8;
  // var BB = this.indicators.bb;
  // //BB.lower; BB.upper; BB.middle are your line values 

  // log.debug('______________________________________');
  // log.debug('calculated BB properties for candle ', this.nsamples);

  // if (BB.upper > candle.close) log.debug('\t', 'Upper BB:', BB.upper.toFixed(digits));
  // if (BB.middle > candle.close) log.debug('\t', 'Mid   BB:', BB.middle.toFixed(digits));
  // if (BB.lower >= candle.close) log.debug('\t', 'Lower BB:', BB.lower.toFixed(digits));
  // log.debug('\t', 'price:', candle.close.toFixed(digits));
  // if (BB.upper <= candle.close) log.debug('\t', 'Upper BB:', BB.upper.toFixed(digits));
  // if (BB.middle <= candle.close) log.debug('\t', 'Mid   BB:', BB.middle.toFixed(digits));
  // if (BB.lower < candle.close) log.debug('\t', 'Lower BB:', BB.lower.toFixed(digits));
  // log.debug('\t', 'Band gap: ', BB.upper.toFixed(digits) - BB.lower.toFixed(digits));

  // log.debug('\t', 'price:', candle.close.toFixed(digits));
}

method.check = function (candle) {
  var BB = this.indicators.bb;
  var price = candle.vwp;
  this.nsamples++;
  if (this.nsamples < 21) {
    this.indicators.stoploss.long(price);
    return;
  }
  // price Zone detection
  var zone = 'none';
  if (price >= BB.upper) zone = 'top';
  if ((price < BB.upper) && (price >= BB.middle)) zone = 'high';
  if ((price > BB.lower) && (price < BB.middle)) zone = 'low';
  if (price <= BB.lower) zone = 'bottom';
  log.debug('current zone:  ', zone);
  log.debug('current trend duration:  ', this.trend.duration);

  if (this.trend.zone == zone) {
    this.trend = {
      zone: zone,  // none, top, high, low, bottom
      duration: this.trend.duration + 1,
      persisted: true
    }
  }
  else {
    this.trend = {
      zone: zone,  // none, top, high, low, bottom
      duration: 0,
      persisted: false
    }
  }

  // if ('buy' !== this.prevAction && this.prevPrice > price) {
  //   this.prevPrice = price;
  // }

  if ('buy' !== this.prevAction) {// && this.prevPrice * this.settings.stopgain_threshold < price) {
    this.indicators.stoploss.long(price);
    this.prevAction = 'buy';
    return this.advice('long');
  }
  if ('sell' !== this.prevAction && this.prevPrice < price && 'stoploss' === this.indicators.stoploss.action) {
    this.prevPrice = price;
    this.prevAction = 'sell';
    return this.advice('short');
  }

  // this.trend = {
  //   zone: zone,  // none, top, high, low, bottom
  //   duration: 0,
  //   persisted: false


}

module.exports = method;
