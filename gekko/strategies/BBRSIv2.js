/*

  BB strategy - okibcn 2018-01-03

 */
// helpers
var _ = require('lodash');
var log = require('../core/log.js');

var BB = require('./indicators/BB.js');
var rsi = require('./indicators/RSI.js');

// let's create our own method
var method = {};

// prepare everything our method needs
method.init = function () {

    this.name = 'BB';
    this.nsamples = 0;
    this.trend = {
        zone: 'none',  // none, top, high, low, bottom
        duration: 0,
        persisted: false
    };

    this.requiredHistory = this.tradingAdvisor.historySize;

    // define the indicators we need
    this.addIndicator('stoploss', 'StopLoss', {
        threshold: this.settings.stoploss_threshold,
        action: 'stoploss'
    });
    this.addIndicator('bb', 'BB', this.settings.bbands);
    this.addIndicator('rsi', 'RSI', this.settings);
    this.prevPrice = 1;
    this.prevAdxr = 1;
    this.prevAction = 'buy';
    this.tradeNumber = 0;
    var adxrsettings = {
        optInTimePeriod: 5
    };
    this.addTulipIndicator('adxr', 'adxr', adxrsettings);
}


// for debugging purposes log the last
// calculated parameters.
method.log = function (candle) {
    // var digits = 8;
    // var BB = this.indicators.bb;
    // //BB.lower; BB.upper; BB.middle are your line values 

    // console.log('______________________________________');
    // console.log('calculated BB properties for candle ', this.nsamples);

    // if (BB.upper > candle.close) console.log('\t', 'Upper BB:', BB.upper.toFixed(digits));
    // if (BB.middle > candle.close) console.log('\t', 'Mid   BB:', BB.middle.toFixed(digits));
    // if (BB.lower >= candle.close) console.log('\t', 'Lower BB:', BB.lower.toFixed(digits));
    // console.log('\t', 'price:', candle.close.toFixed(digits));
    // if (BB.upper <= candle.close) console.log('\t', 'Upper BB:', BB.upper.toFixed(digits));
    // if (BB.middle <= candle.close) console.log('\t', 'Mid   BB:', BB.middle.toFixed(digits));
    // if (BB.lower < candle.close) console.log('\t', 'Lower BB:', BB.lower.toFixed(digits));
    // console.log('\t', 'Band gap: ', BB.upper.toFixed(digits) - BB.lower.toFixed(digits));



    // console.log('calculated RSI properties for candle:');
    // console.log('\t', 'rsi:', rsi.result.toFixed(digits));
    // console.log('\t', 'price:', candle.close.toFixed(digits));
}

method.check = function (candle) {

    if ('stoploss' === this.indicators.stoploss.action && this.prevAction !== 'sell') {
        this.prevPrice = price;
        this.prevAction = 'sell';
        this.tradeNumber++;
        return this.advice('short');
    }
    var BB = this.indicators.bb;
    var price = (candle.close + candle.open + candle.high + candle.low) / 4;
    this.nsamples++;

    var rsi = this.indicators.rsi;
    var rsiVal = rsi.result;

    var adxrVal = this.tulipIndicators.adxr.result.result;

    // var predictedNextDirection = 'none';
    var acending = false;
    var speedingUp = false;
    var noAction = true;
    if (this.prevAdxrDirection > 1) { //acending dir
        acending = true;
        if ((adxrVal / this.prevAdxr) / this.prevAdxrDirection > 1) { //speeding up

            speedingUp = true;
            noAction = false;

        } else { //slowing down
            noAction = false;
            speedingUp = false;
            // console.log('test2');
        }
    } else {//decending dir
        acending = false;

        if ((adxrVal / this.prevAdxr) / this.prevAdxrDirection < 1) { //speeding up
            noAction = false;
            speedingUp = true;
            //  console.log('test3');
        } else { //slowing down
            noAction = false;
            speedingUp = false;

        }
    }

    console.log(this.tradeNumber + ' acending/speedingup: ' + acending + '/' + speedingUp + ' adxrVal ' + adxrVal + ' prevAdxr ' + this.prevAdxr + ' this acceleration ' + (adxrVal / this.prevAdxr) / this.prevAdxrDirection + ' prevadxrdirection ' + this.prevAdxrDirection);
    this.prevAdxrDirection = (adxrVal / this.prevAdxr);
    this.prevAdxr = adxrVal;
    // if (isNaN(adxrVal)) noAction = true;
    // if (isNaN(adxrVal / this.prevAdxr)) noAction = true;
    // if (isNaN(this.prevAdxrDirection)) noAction = true;


    // price Zone detection
    var zone = 'none';
    if (price >= BB.upper) zone = 'top';
    if ((price < BB.upper) && (price >= BB.middle)) zone = 'high';
    if ((price > BB.lower) && (price < BB.middle)) zone = 'low';
    if (price <= BB.lower) zone = 'bottom';
    // console.log('current zone:  ', zone);
    // console.log('current trend duration:  ', this.trend.duration);

    if (this.trend.zone == zone) {
        this.trend = {
            zone: zone,  // none, top, high, low, bottom
            duration: this.trend.duration + 1,
            persisted: true
        };
    }
    else {
        this.trend = {
            zone: zone,  // none, top, high, low, bottom
            duration: 0,
            persisted: false
        };
    }

    // if (this.prevAction === 'sell' && this.prevPrice > price) { //following buy prev price
    //     this.prevPrice = price;
    // }
    // if (this.prevAction === 'buy' && this.prevPrice < price * 0.999) { //following buy prev price
    //     this.prevPrice = price * 0.999;
    // }
    // if (price <= BB.lower && rsiVal <= this.settings.thresholds.low) 

    if (this.prevAction === 'sell') {
        if ((acending && speedingUp || !acending && !speedingUp)) {  // && price < this.prevPrice) { //price > this.prevPrice &&
            this.indicators.stoploss.long(price);
            this.prevPrice = price;
            this.prevAction = 'buy';
            this.tradeNumber++;
            return this.advice('long');
        }
    }
    // 

    // if (price >= BB.middle && rsiVal >= this.settings.thresholds.high)

    // if (this.prevAction === 'buy' && !noAction && ('stoploss' === this.indicators.stoploss.action))
    //     if ((!acending && speedingUp || acending && !speedingUp)) {// && (price < this.prevPrice * this.settings.stoploss_threshold)) {
    //         this.prevPrice = price;
    //         this.prevAction = 'sell';
    //         this.tradeNumber++;
    //         return this.advice('short');
    //     }


    // this.trend = {
    //   zone: zone,  // none, top, high, low, bottom
    //   duration: 0,
    //   persisted: false


};

module.exports = method;
