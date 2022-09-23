// stop loss as an indicator
// originally created by scraqz. Thanks!

var Indicator = function (settings) {
  this.input = 'candle';
  this.candle = null;
  this.price = 0;
  this.action = 'continue'; // continue
  this.threshold = settings.threshold;
  this.stoplossHardValue = 0;
}

Indicator.prototype.update = function (candle) {
  this.candle = candle;
  let stoploss = this.price - this.stoplossHardValue;
  if ((this.candle.close) < stoploss) {
    if (!['stoploss', 'freefall'].includes(this.action)) { // new trend
      this.action = 'stoploss'; // sell
    } else {
      // this.updatePrice(); // lower our standards
      this.action = 'stoploss'; // strategy should do nothing
    }
  } else {
    if ((this.candle.close) > this.price * this.threshold)
      if (this.price < Math.round(this.candle.close)) this.updatePrice(); // trailing
    this.action = 'continue'; // safe to continue with rest of strategy
  }
}
Indicator.prototype.updatePrice = function () {
  this.price = (this.candle.close);
}
Indicator.prototype.long = function (price) {
  if (this.stoplossHardValue == 0 || this.stoplossHardValue > (1 - this.threshold) * price || this.stoplossHardValue < ((1 - this.threshold) * price) * 0.8) {
    this.stoplossHardValue = (1 - this.threshold) * price;
  }
  this.price = Math.round(price);
}

module.exports = Indicator;
