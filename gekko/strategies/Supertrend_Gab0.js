var log = require('../core/log.js');
var util = require('../core/util.js');
var config = require('../core/util.js').getConfig();

var strat = {};

// Prepare everything our strat needs
strat.init = function () {
  // your code!
  this.requiredHistory = this.tradingAdvisor.historySize;
  this.addIndicator('stoploss', 'StopLoss', {
    threshold: this.settings.stoploss_threshold,
    action: 'stoploss'
  });
  this.addTulipIndicator("atr", "atr", { optInTimePeriod: this.settings.atrEma });

  this.prevPrice = 0;
  this.bought = 0;

  this.supertrend = {
    upperBandBasic: 0,
    lowerBandBasic: 0,
    upperBand: 0,
    lowerBand: 0,
    supertrend: 0,
  };
  this.lastSupertrend = {
    upperBandBasic: 0,
    lowerBandBasic: 0,
    upperBand: 0,
    lowerBand: 0,
    supertrend: 0,
  };
  this.lastCandleClose = 0;
}

// What happens on every new candle?
strat.update = function (candle) {
  // your code!
}

// For debugging purposes.
strat.log = function () {
  // your code!
}
strat.processRoundT = function (roundTrip) { },
  // Based on the newly calculated
  // information, check if we should
  // update or not.
  strat.check = function (candle) {
    if (this.prevPrice === 0)
      this.prevPrice = candle.close;

    if (!this.tulipIndicators.atr.result.result)
      return;
    var atrResult = this.tulipIndicators.atr.result.result;

    this.supertrend.upperBandBasic = ((candle.high + candle.low) / 2) + (this.settings.bandFactor * atrResult);
    this.supertrend.lowerBandBasic = ((candle.high + candle.low) / 2) - (this.settings.bandFactor * atrResult);

    if (this.supertrend.upperBandBasic < this.lastSupertrend.upperBand || this.lastCandleClose > this.lastSupertrend.upperBand)
      this.supertrend.upperBand = this.supertrend.upperBandBasic;
    else
      this.supertrend.upperBand = this.lastSupertrend.upperBand;

    if (this.supertrend.lowerBandBasic > this.lastSupertrend.lowerBand || this.lastCandleClose < this.lastSupertrend.lowerBand)
      this.supertrend.lowerBand = this.supertrend.lowerBandBasic;
    else
      this.supertrend.lowerBand = this.lastSupertrend.lowerBand;

    if (this.lastSupertrend.supertrend == this.lastSupertrend.upperBand && candle.close <= this.supertrend.upperBand)
      this.supertrend.supertrend = this.supertrend.upperBand;
    else if (this.lastSupertrend.supertrend == this.lastSupertrend.upperBand && candle.close >= this.supertrend.upperBand)
      this.supertrend.supertrend = this.supertrend.lowerBand;
    else if (this.lastSupertrend.supertrend == this.lastSupertrend.lowerBand && candle.close >= this.supertrend.lowerBand)
      this.supertrend.supertrend = this.supertrend.lowerBand;
    else if (this.lastSupertrend.supertrend == this.lastSupertrend.lowerBand && candle.close <= this.supertrend.lowerBand)
      this.supertrend.supertrend = this.supertrend.upperBand;
    else
      this.supertrend.supertrend = 0

    if (candle.close > this.supertrend.supertrend && this.bought == 0) {
      this.advice("long", candle.close);
      this.bought = 1;
      this.indicators.stoploss.long(this.candle.close);
      log.debug("Buy at: ", candle.close);
    }

    if (candle.close < this.supertrend.supertrend && this.bought == 1 && 'stoploss' === this.indicators.stoploss.action) {
      this.advice("short", candle.close)
      this.bought = 0;
      log.debug("Sell at: ", candle.close);
    }

    this.lastCandleClose = candle.close;
    this.lastSupertrend = {
      upperBandBasic: this.supertrend.upperBandBasic,
      lowerBandBasic: this.supertrend.lowerBandBasic,
      upperBand: this.supertrend.upperBand,
      lowerBand: this.supertrend.lowerBand,
      supertrend: this.supertrend.supertrend,
    };
  }

module.exports = strat;

